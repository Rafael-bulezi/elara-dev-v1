import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion } from 'motion/react';
import { UserProfile, Product, Chat, CartItem, BeforeInstallPromptEvent } from './types';
import { initialProducts, categories } from './constants';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import MobileMenu from './components/MobileMenu';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import ProductDetailsModal from './components/ProductDetailsModal';
import ProductFormModal from './components/ProductFormModal';
import CheckoutModal from './components/CheckoutModal';

// Views
import OrdersView from './views/OrdersView';
import ProductsView from './views/ProductsView';
import ProfileSettingsView from './views/ProfileSettingsView';
import SellerProfileView from './views/SellerProfileView';
import AdminView from './views/AdminView';
import ChatListView from './views/ChatListView';
import ChatRoomView from './views/ChatRoomView';
import ImportQuoteView from './views/ImportQuoteView';

import { CheckCircle, Bell } from 'lucide-react';

import { initOneSignal } from './lib/notifications';

import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  // Auth & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Initialize OneSignal when userProfile is available
  useEffect(() => {
    if (userProfile) {
      initOneSignal(userProfile);
    }
  }, [userProfile]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // UI State
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote' | 'category'>('home');
  const [activeTab, setActiveTab] = useState('home');
  
  // Data State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'promo'>('relevance');
  
  // Selection State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Theme Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const showNotification = (message: string, type: 'success' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch profile with a timeout to prevent hanging
        const fetchProfile = async () => {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error && error.code === 'PGRST116') {
              // Profile doesn't exist, create it
              const isAdmin = session.user.email === '7dark7cloud7@gmail.com';
              const newProfile = {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'Usuário',
                email: session.user.email || '',
                avatar_url: session.user.user_metadata?.avatar_url || '',
                role: isAdmin ? 'admin' : 'buyer'
              };
              await supabase.from('profiles').insert(newProfile);
              setUserProfile({ 
                uid: newProfile.id, 
                name: newProfile.full_name, 
                email: newProfile.email,
                avatar: newProfile.avatar_url, 
                role: newProfile.role as 'buyer' | 'seller' | 'admin'
              });
            } else if (profile) {
              setUserProfile({ 
                uid: profile.id, 
                name: profile.full_name, 
                email: profile.email,
                avatar: profile.avatar_url, 
                role: profile.role as 'buyer' | 'seller' | 'admin',
                phone: profile.phone,
                address: profile.address
              } as UserProfile);
            }
          } catch (err) {
            console.error('Error in auth listener profile fetch:', err);
          }
        };
        fetchProfile();
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Products Listener
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(full_name, avatar_url, phone)')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching products:', error);
        setProducts(initialProducts);
      } else {
        if (data && data.length > 0) {
          setProducts(((data || []) as Record<string, unknown>[]).map((p) => ({
            id: p.id as string,
            title: p.title as string,
            description: p.description as string,
            price: p.price as number,
            image: (p.image_url || p.image) as string,
            category: p.category as string,
            condition: p.condition as string,
            sellerId: p.seller_id as string,
            sellerName: ((p.profiles as Record<string, unknown>)?.full_name || p.seller_name || 'Vendedor Desconhecido') as string,
            sellerAvatar: ((p.profiles as Record<string, unknown>)?.avatar_url || p.seller_avatar || '') as string,
            sellerPhone: ((p.profiles as Record<string, unknown>)?.phone || p.seller_phone || '') as string,
            sellerRating: 5.0,
            emPromocao: false,
            status: p.status as Product['status'],
            stock: p.stock as number,
            isImport: p.is_import as boolean,
            createdAt: new Date(p.created_at as string).getTime()
          } as Product)));
        } else {
          setProducts(initialProducts);
        }
      }
    };

    fetchProducts();

    const productsChannel = supabase
      ?.channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(productsChannel);
      }
    };
  }, []);

  // Orders Listener
  useEffect(() => {
    if (!userProfile) return;

    const ordersChannel = supabase
      ?.channel('orders_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as { seller_id: string, total: number };
        // If the current user is the seller of the new order
        if (userProfile && newOrder.seller_id === userProfile.uid) {
          showNotification(`Nova compra recebida! Total: Kz ${newOrder.total.toLocaleString('pt-AO')}`, 'success');
        }
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(ordersChannel);
      }
    };
  }, [userProfile]);

  // Cart Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.id === product.id) {
            const newQty = Math.min(item.stock || 1, (item.cartQuantity || 1) + 1);
            return { ...item, cartQuantity: newQty };
          }
          return item;
        });
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.min(item.stock || 1, Math.max(1, (item.cartQuantity || 1) + delta));
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Product Handlers
  const handleSaveProduct = async (productData: Partial<Product> & { imageUrl?: string }) => {
    if (!userProfile) return;
    
    try {
      const finalImageUrl = productData.imageUrl || productData.image;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            title: productData.title,
            description: productData.description,
            price: productData.price,
            image_url: finalImageUrl,
            category: productData.category,
            condition: productData.condition,
            stock: productData.stock,
            is_import: productData.isImport
          })
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            title: productData.title,
            description: productData.description,
            price: productData.price,
            image_url: finalImageUrl,
            category: productData.category,
            condition: productData.condition,
            seller_id: userProfile.uid,
            seller_name: userProfile.name,
            seller_avatar: userProfile.avatar || '',
            seller_phone: productData.sellerPhone || userProfile.phone || '',
            status: 'pending',
            stock: productData.stock || 1,
            is_import: productData.isImport || false
          });
        
        if (error) throw error;
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto.');
    }
  };

  // Chat Handlers
  const startChat = async (sellerId: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    if (userProfile.uid === sellerId) return;

    // Check if chat exists
    const { data: existingChats, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .contains('participants', [userProfile.uid, sellerId]);

    if (fetchError) {
      console.error('Error fetching chat:', fetchError);
      return;
    }

    let chat = existingChats?.[0];

    if (!chat) {
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
          participants: [userProfile.uid, sellerId]
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating chat:', insertError);
        return;
      }
      chat = newChat;
    }

    setActiveChat({
      id: chat.id,
      participants: chat.participants,
      lastMessage: chat.last_message,
      lastMessageAt: chat.updated_at,
      lastSenderId: chat.last_sender_id
    } as Chat);
    setCurrentView('chat');
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.sellerName && p.sellerName.toLowerCase().includes(query));
      
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'promo') return (b.emPromocao ? 1 : 0) - (a.emPromocao ? 1 : 0);
    return b.createdAt - a.createdAt;
  });

  // Navigation
  const navigateTo = (view: typeof currentView) => {
    setCurrentView(view);
    if (view === 'home' || view === 'messages') {
      setActiveTab(view);
    }
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 font-sans selection:bg-purple-500/30 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          isDark={isDark}
          toggleTheme={() => setIsDark(!isDark)}
          toggleMobileMenu={() => setIsMobileMenuOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          userProfile={userProfile}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSellProduct={() => userProfile ? setIsProductModalOpen(true) : setIsAuthModalOpen(true)}
          onNavigate={navigateTo}
        />

        <main className="relative flex-1">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
          {currentView === 'home' ? (
            searchQuery.trim() !== '' ? (
              <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold dark:text-white mb-6">Resultados para "{searchQuery}"</h2>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} onProductClick={(p) => { setSelectedProduct(p); setIsProductDetailsOpen(true); }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-500 dark:text-zinc-400">Nenhum produto encontrado para "{searchQuery}".</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <Hero />
                
                {/* Featured Products */}
                <section className="px-4">
                  <h2 className="text-xl font-bold dark:text-white mb-4">Destaques</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {products.slice(0, 4).map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} onProductClick={(p) => { setSelectedProduct(p); setIsProductDetailsOpen(true); }} />
                    ))}
                  </div>
                </section>

                {categories.map(cat => (
                  <section key={cat.id} className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <h2 className="text-xl font-bold dark:text-white">{cat.name}</h2>
                      <button onClick={() => { setActiveCategory(cat.name); setCurrentView('category'); }} className="text-purple-600 font-semibold text-sm">Ver Mais</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto px-4 scroll-snap-x custom-scrollbar">
                      {products.filter(p => p.category === cat.name).slice(0, 10).map(p => (
                        <div key={p.id} className="min-w-[160px] scroll-snap-item">
                          <ProductCard product={p} onAddToCart={addToCart} onProductClick={(p) => { setSelectedProduct(p); setIsProductDetailsOpen(true); }} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : currentView === 'category' ? (
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white">{activeCategory}</h2>
                <select onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price-asc' | 'price-desc' | 'promo')} className="bg-white dark:bg-zinc-800 border rounded-lg px-3 py-1 text-sm">
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Mais Baratos</option>
                  <option value="price-desc">Mais Caros</option>
                  <option value="promo">Promoções</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} onProductClick={(p) => { setSelectedProduct(p); setIsProductDetailsOpen(true); }} />
                ))}
              </div>
            </div>
          ) : (
            null
          )}

          {currentView === 'orders' && (
            <OrdersView 
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
              onContactUser={startChat}
            />
          )}

          {currentView === 'products' && (
            <ProductsView 
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onAddProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
            />
          )}

          {currentView === 'settings' && (
            <ProfileSettingsView 
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
              onUpdateProfile={(updates) => setUserProfile(prev => prev ? { ...prev, ...updates } : null)}
            />
          )}

          {currentView === 'seller' && selectedSellerId && (
            <SellerProfileView 
              sellerId={selectedSellerId}
              onBack={() => navigateTo('home')}
              onProductClick={(p) => {
                setSelectedProduct(p);
                setIsProductDetailsOpen(true);
              }}
              onAddToCart={addToCart}
              onContactSeller={startChat}
            />
          )}

          {currentView === 'admin' && (
            <AdminView 
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
            />
          )}

          {currentView === 'messages' && (
            <ChatListView 
              userProfile={userProfile}
              onSelectChat={(chat) => {
                setActiveChat(chat);
                navigateTo('chat');
              }}
            />
          )}

          {currentView === 'chat' && activeChat && (
            <ChatRoomView 
              chat={activeChat}
              userProfile={userProfile}
              onBack={() => navigateTo('messages')}
            />
          )}

          {currentView === 'quote' && (
            <ImportQuoteView 
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
            />
          )}
        </motion.div>
      </main>

      <Footer />

      <BottomNav 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') navigateTo('home');
          if (tab === 'messages') navigateTo('messages');
        }}
        cartCount={cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSellProduct={() => userProfile ? setIsProductModalOpen(true) : setIsAuthModalOpen(true)}
      />

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNavigate={(view) => navigateTo(view as any)}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigate={navigateTo}
      />

      <ProductDetailsModal 
        isOpen={isProductDetailsOpen}
        onClose={() => setIsProductDetailsOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
        onContactSeller={(id) => {
          setIsProductDetailsOpen(false);
          startChat(id);
        }}
        onViewSeller={(id) => {
          setSelectedSellerId(id);
          setIsProductDetailsOpen(false);
          navigateTo('seller');
        }}
      />

      <ProductFormModal 
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        userProfile={userProfile}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        userProfile={userProfile}
        onOrderComplete={() => {
          setCart([]);
          setIsCheckoutOpen(false);
          navigateTo('orders');
          showNotification('Pedido realizado com sucesso!', 'success');
        }}
      />

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-top-4">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm ${
            notification.type === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
              : 'bg-purple-500 text-white shadow-purple-500/20'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
            {notification.message}
          </div>
        </div>
      )}

      {deferredPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-[9999] bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Elara" className="w-12 h-12 rounded-xl" referrerPolicy="no-referrer" />
            <div>
              <h4 className="font-black dark:text-white">Instalar Elara</h4>
              <p className="text-xs text-zinc-500">Tenha uma experiência mais rápida</p>
            </div>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-purple-700 transition-colors"
          >
            Instalar
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
