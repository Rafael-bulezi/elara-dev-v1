import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion } from 'motion/react';
import { viewVariants } from './utils/animations';
import { useScrollDirection } from './utils/useScrollDirection';
import { UserProfile, Product, Chat, CartItem, BeforeInstallPromptEvent } from './types';
import { categories, initialProducts } from './constants';
import { CLOUD_LOGO } from './constants/logo';

// Components
import Header from './components/layout/Header';
import Hero from './components/layout/Hero';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import WishlistDrawer from './components/layout/WishlistDrawer';
import MobileMenu from './components/layout/MobileMenu';
import AuthModal from './components/auth/AuthModal';
import AuthCallback from './components/auth/AuthCallback';
import CartDrawer from './components/cart/CartDrawer';
import ProfileDrawer from './components/auth/ProfileDrawer';
import ProductFormModal from './components/product/ProductFormModal';
import CheckoutModal from './components/cart/CheckoutModal';
import InstallPrompt from './components/common/InstallPrompt';
import OnboardingFlow from './components/common/OnboardingFlow';
import ImportRequestForm from './components/product/ImportRequestForm';
import ProductListingView from './views/ProductListingView';
import { DiscoveryFilters } from './types/discovery';
import CategoryMegaMenu from './components/layout/CategoryMegaMenu';
import {
  OfertasDoDia, CategoryShowcaseSection, StripSection,
  ImportCTA, DuoGrid, StatsBanner,
} from './components/layout/HomePageSections';
import ProductDetailPage from './views/ProductDetailPage';

// Views
import OrdersView from './views/OrdersView';
import ProductsView from './views/ProductsView';
import ProfileSettingsView from './views/ProfileSettingsView';
import SellerProfileView from './views/SellerProfileView';
import SellerOnboardingView from './views/SellerOnboardingView';
import SellerDashboardView from './views/SellerDashboardView';
import AdminView from './views/AdminView';
import ChatListView from './views/ChatListView';
import ChatRoomView from './views/ChatRoomView';
import ImportQuoteView from './views/ImportQuoteView';

import { CheckCircle, Bell } from 'lucide-react';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

import { initOneSignal } from './lib/notifications';

import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  // OAuth callback detection (e.g. after Google sign-in redirect)
  const [authCallbackActive, setAuthCallbackActive] = useState(
    () => window.location.pathname === '/auth/callback'
  );

  // Auth & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('elara_onboarded'); } catch { return false; }
  });

  // Initialize OneSignal when userProfile is available
  useEffect(() => {
    if (userProfile) {
      initOneSignal(userProfile);
    }
  }, [userProfile]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Intelligent navbar — hide on scroll down, show on scroll up
  const navVisible = useScrollDirection();

  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote' | 'category' | 'product' | 'seller-dashboard' | 'seller-onboarding'>('home');
  const [activeTab, setActiveTab] = useState('home');
  const [sellerMode, setSellerMode] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>({
    query: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    condition: null,
    verified: false,
    localOnly: false,
    importOnly: false,
    sort: 'relevance'
  });

  const searchQuery = discoveryFilters.query;
  const setSearchQuery = (q: string) => setDiscoveryFilters(prev => ({ ...prev, query: q }));
  const setActiveCategory = (cat: string | null) => setDiscoveryFilters(prev => ({ ...prev, category: cat }));
  
  // Selection State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([
    { id: '1', title: 'Bem-vindo à Elara!', message: 'Explore milhares de produtos locais e importados.', time: 'Agora', read: false },
  ]);

  const toggleWishlist = React.useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const wishlistIds = React.useMemo(() => wishlist.map(p => p.id), [wishlist]);


  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [forceShowInstall, setForceShowInstall] = useState(false);
  const [appLogo, setAppLogo] = useState<string | null>(CLOUD_LOGO);

  useEffect(() => {
    const fetchAdminLogo = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('email', '7dark7cloud7@gmail.com')
          .maybeSingle();

        if (data?.avatar_url) {
          setAppLogo(data.avatar_url);
        }
      } catch {
        // Non-critical; keep the default logo
      }
    };
    fetchAdminLogo();
  }, []);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Show install prompt periodically if not installed
    const isStandAlone = window.matchMedia('(display-mode: standalone)').matches || 
                         ('standalone' in window.navigator && !!window.navigator.standalone);
    
    const timers: NodeJS.Timeout[] = [];
    if (!isStandAlone) {
      const shownCount = parseInt(localStorage.getItem('installPromptCount') || '0');
      
      if (shownCount < 3) {
        // Show at 30 seconds
        timers.push(setTimeout(() => {
          setForceShowInstall(true);
          localStorage.setItem('installPromptCount', (shownCount + 1).toString());
        }, 30000));
        
        // Show again at 3 minutes if they are still browsing
        timers.push(setTimeout(() => {
          setForceShowInstall(true);
          localStorage.setItem('installPromptCount', (shownCount + 2).toString());
        }, 180000));
        
        // Show again at 10 minutes
        timers.push(setTimeout(() => {
          setForceShowInstall(true);
          localStorage.setItem('installPromptCount', (shownCount + 3).toString());
        }, 600000));
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

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
              .select('*, seller_profiles(*)')
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
                role: isAdmin ? 'admin' : 'buyer',
                seller_status: 'none'
              };
              await supabase.from('profiles').insert(newProfile);
              setUserProfile({ 
                uid: newProfile.id, 
                name: newProfile.full_name, 
                email: newProfile.email,
                avatar: newProfile.avatar_url, 
                role: newProfile.role as 'buyer' | 'seller' | 'admin',
                sellerStatus: 'none'
              });
            } else if (profile) {
              const sellerProfile = (profile.seller_profiles?.[0] || profile) as Record<string, unknown>;
              setUserProfile({ 
                uid: profile.id, 
                name: profile.full_name, 
                email: profile.email,
                avatar: profile.avatar_url, 
                role: profile.role as 'buyer' | 'seller' | 'admin',
                sellerStatus: (profile.seller_status || sellerProfile.seller_status || 'none') as UserProfile['sellerStatus'],
                shopName: (profile.shop_name || sellerProfile.shop_name) as string | undefined,
                verificationLevel: (profile.verification_level || sellerProfile.verification_level) as UserProfile['verificationLevel'],
                idDocumentUrl: (profile.id_document_url || sellerProfile.id_document_url) as string | undefined,
                bankDetails: (profile.bank_details || sellerProfile.bank_details) as string | undefined,
                mixeiroStatus: (profile.mixeiro_status || sellerProfile.mixeiro_status) as UserProfile['mixeiroStatus'],
                mixeiroVerified: !!(profile.mixeiro_verified || sellerProfile.mixeiro_verified),
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
        console.warn('Falling back to mock products');
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
  const addToCart = React.useCallback((product: Product) => {
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
  }, []);

  const updateCartQuantity = React.useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.min(item.stock || 1, Math.max(1, (item.cartQuantity || 1) + delta));
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  }, []);

  const removeFromCart = React.useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  // Product Handlers
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!userProfile) {
      showNotification('Inicie sessão para publicar um produto.', 'info');
      return;
    }

    try {
      const finalImageUrl = productData.image || '';
      const basePayload = {
        title: productData.title,
        description: productData.description,
        price: productData.price,
        image_url: finalImageUrl,
        category: productData.category,
        condition: productData.condition,
        stock: productData.stock ?? 1,
        origin: productData.origin || 'Local',
        is_import: productData.isImport || false
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(basePayload)
          .eq('id', editingProduct.id);
        if (error) throw error;
        showNotification('Produto atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...basePayload,
            seller_id: userProfile.uid,
            seller_name: userProfile.name,
            seller_avatar: userProfile.avatar || '',
            seller_phone: productData.sellerPhone || userProfile.phone || '',
            status: 'pending'
          });
        if (error) throw error;
        showNotification('Produto enviado para aprovação!', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Erro ao salvar produto. Tente novamente.', 'info');
    }
  };

  // Chat Handlers
  const startChat = async (sellerId: string) => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }

    if (userProfile.uid === sellerId) return;

    try {
      // Use the atomic RPC to create or get a chat between buyer and seller
      const { data: chatId, error: rpcError } = await supabase
        .rpc('create_or_get_chat', {
          p_user_id: userProfile.uid,
          p_other_user_id: sellerId
        });

      if (rpcError) throw rpcError;
      if (!chatId) throw new Error('Could not create chat');

      // Fetch the chat row and both participant profiles
      const [{ data: chatRow }, { data: sellerProfile }] = await Promise.all([
        supabase.from('chats').select('*').eq('id', chatId).single(),
        supabase.from('profiles').select('id, full_name, avatar_url').eq('id', sellerId).single()
      ]);

      if (!chatRow) throw new Error('Chat not found');

      const names: { [uid: string]: string } = {
        [userProfile.uid]: userProfile.name || 'Eu',
        [sellerId]: sellerProfile?.full_name || 'Vendedor'
      };
      const avatars: { [uid: string]: string } = {
        [userProfile.uid]: userProfile.avatar || '',
        [sellerId]: sellerProfile?.avatar_url || ''
      };

      // Update denormalized participant metadata so the chat list renders correctly
      await supabase.from('chats').update({
        participant_names: names,
        participant_avatars: avatars
      }).eq('id', chatId);

      setActiveChat({
        id: chatRow.id,
        participants: chatRow.participants,
        participantNames: names,
        participantAvatars: avatars,
        lastMessage: chatRow.last_message,
        lastMessageAt: chatRow.updated_at,
        lastSenderId: chatRow.last_sender_id
      } as Chat);
      setCurrentView('chat');
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Erro ao iniciar conversa. Tente novamente.');
    }
  };

  // Navigation
  const navigateTo = React.useCallback((view: typeof currentView) => {
    setCurrentView(view);
    if (view === 'home' || view === 'messages') {
      setActiveTab(view);
    }
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const handleSelectCategory = React.useCallback((name: string) => {
    setActiveCategory(name);
    navigateTo('category');
  }, [navigateTo]);

  const handleProductClick = React.useCallback((p: Product) => {
    setSelectedProduct(p);
    navigateTo('product');
  }, [navigateTo]);

  const handleImportSubmit = async (data: { name: string; description: string; budget: string; whatsapp: string }) => {
    console.log("Import Request Submitted:", data);
    showNotification("Pedido de importação enviado com sucesso! Entraremos em contacto em breve.", "success");
    return Promise.resolve();
  };

  const handleOnboardingComplete = (city?: string) => {
    try {
      localStorage.setItem('elara_onboarded', '1');
      if (city) localStorage.setItem('elara_city', city);
    } catch { /* localStorage may be unavailable */ }
    setShowOnboarding(false);
  };

  const handleStartSelling = () => {
    if (!userProfile) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentView('seller-onboarding');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleEnterSellerDashboard = () => {
    setSellerMode(true);
    setCurrentView('seller-dashboard');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleExitSellerMode = () => {
    setSellerMode(false);
    navigateTo('home');
  };

  // Render the OAuth callback screen while Supabase exchanges the PKCE code
  if (authCallbackActive) {
    return (
      <ErrorBoundary>
        <AuthCallback onComplete={() => setAuthCallbackActive(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors duration-500 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 font-sans selection:bg-purple-500/30 relative">

      {/* ── Fixed intelligent navbar (hides on scroll-down, shows on scroll-up) ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <Header 
          toggleMobileMenu={() => setIsMobileMenuOpen(true)}
          cartCount={cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0)}
          wishlistCount={wishlist.length}
          notifications={appNotifications}
          onMarkNotificationsRead={() => setAppNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          userProfile={userProfile}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSellProduct={() => {
            if (!userProfile) {
              setIsAuthModalOpen(true);
            } else if (userProfile.role === 'seller') {
              setIsProductModalOpen(true);
            } else {
              setCurrentView('seller-onboarding');
              setIsProfileOpen(false);
              setIsMobileMenuOpen(false);
              window.scrollTo(0, 0);
            }
          }}
          onOpenImport={() => setIsImportModalOpen(true)}
          onNavigate={navigateTo}
          appLogo={appLogo}
        />

        {/* Category strip — desktop only; on mobile it lives inside the mobile menu */}
        <div className="hidden md:block">
          <CategoryMegaMenu
            categories={categories}
            products={products}
            onSelectCategory={handleSelectCategory}
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
            wishlist={wishlistIds}
            onToggleWishlist={toggleWishlist}
            onNavigate={(v) => navigateTo(v)}
          />
        </div>
      </div>

      {/* Main content — padded to clear the fixed header (mobile: 56px, desktop: 56px header + 44px strip) */}
      <div className="relative z-10 flex flex-col min-h-screen pt-14 md:pt-[108px]">
        <main className="relative flex-1">
          <motion.div
            key={currentView}
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
          {currentView === 'home' && (
            searchQuery.trim() !== '' ? (
              <ProductListingView
                products={products}
                filters={discoveryFilters}
                onChangeFilters={setDiscoveryFilters}
                onBack={() => { setSearchQuery(''); navigateTo('home'); }}
                onProductClick={handleProductClick}
                onAddToCart={addToCart}
                wishlist={wishlistIds}
                onToggleWishlist={toggleWishlist}
              />
            ) : (
              /* ── 7-section homepage ── */
              <div id="home-content">
                {/* 1. Hero */}
                <Hero onCtaClick={() => document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' })} />

                {/* 2. Ofertas do Dia */}
                <div id="ofertas">
                  <OfertasDoDia
                    products={products}
                    onAddToCart={addToCart}
                    onProductClick={handleProductClick}
                    wishlist={wishlistIds}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>

                {/* 3. Category showcase — Amazon-style 4-pod grid */}
                <CategoryShowcaseSection
                  products={products}
                  onAddToCart={addToCart}
                  onProductClick={handleProductClick}
                  wishlist={wishlistIds}
                  onToggleWishlist={toggleWishlist}
                  onSelectCategory={handleSelectCategory}
                />

                {/* 4. Moda — 1×5 strip */}
                <StripSection
                  category="Moda"
                  products={products}
                  onAddToCart={addToCart}
                  onProductClick={handleProductClick}
                  wishlist={wishlistIds}
                  onToggleWishlist={toggleWishlist}
                  onViewAll={() => handleSelectCategory('Moda')}
                />

                {/* 5. Import CTA */}
                <ImportCTA onOpenImport={() => setIsImportModalOpen(true)} />

                {/* 6. Tecnologia & Casa — 2×2 grid */}
                <DuoGrid
                  categories={['Tecnologia', 'Casa']}
                  products={products}
                  onAddToCart={addToCart}
                  onProductClick={handleProductClick}
                  wishlist={wishlistIds}
                  onToggleWishlist={toggleWishlist}
                  onSelectCategory={handleSelectCategory}
                />

                {/* 7. Stats strip */}
                <StatsBanner />
              </div>
            )
          )}

          {currentView === 'product' && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              products={products}
              onBack={() => navigateTo('home')}
              onAddToCart={addToCart}
              onBuyNow={(p) => { addToCart(p); setIsCheckoutOpen(true); }}
              onContactSeller={(id) => { navigateTo('home'); startChat(id); }}
              onViewSeller={(id) => { setSelectedSellerId(id); navigateTo('seller'); }}
              wishlisted={wishlistIds.includes(selectedProduct.id)}
              onToggleWishlist={toggleWishlist}
              onProductClick={handleProductClick}
              wishlist={wishlistIds}
            />
          )}

          {currentView === 'category' && (
            <ProductListingView
              products={products}
              filters={discoveryFilters}
              onChangeFilters={setDiscoveryFilters}
              onBack={() => { setActiveCategory(null); navigateTo('home'); }}
              onProductClick={handleProductClick}
              onAddToCart={addToCart}
              wishlist={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
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

          {currentView === 'seller-dashboard' && (
            <SellerDashboardView
              userProfile={userProfile}
              onBack={handleExitSellerMode}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onAddProduct={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onViewOrders={() => navigateTo('orders')}
            />
          )}

          {currentView === 'seller-onboarding' && (
            <SellerOnboardingView
              userProfile={userProfile}
              onBack={() => navigateTo('home')}
              onComplete={(updates) => {
                setUserProfile(prev => prev ? { ...prev, ...updates } : null);
                setSellerMode(true);
                setCurrentView('seller-dashboard');
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
              onProductClick={handleProductClick}
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

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onAddToCart={(p) => { addToCart(p); setIsWishlistOpen(false); }}
        onRemove={(id) => setWishlist(prev => prev.filter(p => p.id !== id))}
      />

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
        onSellProduct={() => {
          if (!userProfile) {
            setIsAuthModalOpen(true);
          } else if (userProfile.role === 'seller') {
            setIsProductModalOpen(true);
          } else {
            setCurrentView('seller-onboarding');
            setIsProfileOpen(false);
            setIsMobileMenuOpen(false);
            window.scrollTo(0, 0);
          }
        }}
        visible={navVisible}
      />

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNavigate={(view) => navigateTo(view as any)}
        onInstallClick={() => setForceShowInstall(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        appLogo={appLogo}
        categories={categories}
        onSelectCategory={handleSelectCategory}
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
        onStartSelling={handleStartSelling}
        onEnterSellerDashboard={handleEnterSellerDashboard}
        onExitSellerMode={handleExitSellerMode}
        sellerMode={sellerMode}
      />

      {/* ProductDetailsModal kept for legacy — no longer opened by card click */}

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

      <ImportRequestForm
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportSubmit}
        userProfile={userProfile}
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

      {/* Install Prompt */}
      <InstallPrompt 
        deferredPrompt={deferredPrompt} 
        clearPrompt={() => {
          setDeferredPrompt(null);
          setForceShowInstall(false);
        }}
        forceShow={forceShowInstall}
        appLogo={appLogo}
      />
      
      {/* Onboarding — shown only on first visit */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onOpenAuth={() => { handleOnboardingComplete(); setIsAuthModalOpen(true); }}
        />
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
