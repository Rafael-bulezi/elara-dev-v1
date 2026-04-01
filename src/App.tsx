import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, onSnapshot, query, where, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Product, Chat, CartItem } from './types';
import { initialProducts } from './constants';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import ProductCard from './components/ProductCard';
import ProductSkeleton from './components/ProductSkeleton';
import ImportSection from './components/ImportSection';
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

const App = () => {
  // Auth & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // UI State
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote'>('home');
  const [activeTab, setActiveTab] = useState('home');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  
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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
        } else {
          // If user exists in Auth but not Firestore (shouldn't happen with AuthModal logic)
          setIsAuthModalOpen(true);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Products Listener
  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      // Combine with initial products if Firestore is empty (for demo)
      if (productsData.length === 0) {
        setProducts(initialProducts);
      } else {
        setProducts(productsData);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setProducts(initialProducts);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!userProfile) return;
    
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          sellerId: userProfile.uid,
          sellerName: userProfile.name,
          sellerAvatar: userProfile.avatar || '',
          sellerPhone: productData.sellerPhone || userProfile.phoneNumber || userProfile.phone || '',
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  // Chat Handlers
  const startChat = async (sellerId: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    if (userProfile.uid === sellerId) return;

    const chatId = [userProfile.uid, sellerId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    const chatData: Partial<Chat> = {
      id: chatId,
      participants: [userProfile.uid, sellerId],
      updatedAt: serverTimestamp()
    };

    if (!chatSnap.exists()) {
      await setDoc(chatRef, chatData);
    }

    setActiveChat(chatData as Chat);
    setCurrentView('chat');
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 font-sans selection:bg-purple-500/30">
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
      />

      <main className="relative">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {currentView === 'home' && (
            <>
              <Hero />
              <Categories 
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
              
              <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
                  <div>
                    <h2 className="text-4xl md:text-7xl font-black dark:text-white tracking-tighter mb-4">Destaques</h2>
                    <p className="text-lg md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium">Os produtos mais desejados do momento</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400">{filteredProducts.length} Produtos</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-10">
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
                  ) : (
                    filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        onProductClick={(p) => {
                          setSelectedProduct(p);
                          setIsProductDetailsOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>

                {!isLoading && filteredProducts.length === 0 && (
                  <div className="py-24 text-center">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-zinc-400">
                      <ShoppingBag size={48} />
                    </div>
                    <h3 className="text-2xl font-black dark:text-white mb-2">Nenhum produto encontrado</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Tente ajustar sua busca ou categoria.</p>
                  </div>
                )}
              </section>

              <ImportSection onOpenQuote={() => navigateTo('quote')} />
            </>
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
        onLogin={setUserProfile}
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
        }}
      />
    </div>
  );
};

export default App;
