import React, { useState, useRef } from 'react';
import { Search, ShoppingCart, Menu, MapPin, ChevronDown, Bell, Heart, User, PlusCircle, Globe, X, MessageCircle, ArrowLeft, Home, Cpu, Shirt, Sparkles, Home as HomeIcon, Dumbbell, Car, Gem } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  toggleMobileMenu: () => void;
  cartCount: number;
  wishlistCount: number;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSellProduct: () => void;
  onOpenImport: () => void;
  onNavigate: (view: 'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote' | 'category') => void;
  appLogo?: string | null;
  /** Pass current view so header can show back arrow on non-home pages */
  currentView?: string;
  /** Categories for mobile pill row */
  categories?: { id: string; name: string; icon: string }[];
  onSelectCategory?: (name: string) => void;
}

const catIconMap: Record<string, React.ReactNode> = {
  Tecnologia:           <Cpu size={13} />,
  Moda:                 <Shirt size={13} />,
  Beleza:               <Sparkles size={13} />,
  Casa:                 <HomeIcon size={13} />,
  Esportes:             <Dumbbell size={13} />,
  Veículos:             <Car size={13} />,
  'Jóias & Acessórios': <Gem size={13} />,
};

const catColors: Record<string, string> = {
  Tecnologia:           'text-blue-500',
  Moda:                 'text-pink-500',
  Beleza:               'text-rose-500',
  Casa:                 'text-amber-500',
  Esportes:             'text-emerald-500',
  Veículos:             'text-indigo-500',
  'Jóias & Acessórios': 'text-purple-500',
};

const Header: React.FC<HeaderProps> = ({
  toggleMobileMenu,
  cartCount, wishlistCount, notifications,
  onMarkNotificationsRead,
  onOpenCart, onOpenWishlist, onOpenProfile,
  userProfile, onOpenAuth,
  searchQuery, setSearchQuery,
  onSellProduct, onOpenImport,
  onNavigate,
  appLogo,
  currentView = 'home',
  categories = [],
  onSelectCategory,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const isHome = currentView === 'home';

  const POPULAR = [
    'iPhone 15', 'Samsung Galaxy', 'Fone de ouvido', 'Tênis Nike', 'Portátil',
    'Scooter elétrico', 'Relógio', 'Perfume', 'Câmera', 'Roupa desportiva',
  ];

  const suggestions = localSearch.trim()
    ? POPULAR.filter(s => s.toLowerCase().includes(localSearch.toLowerCase()))
    : POPULAR.slice(0, 6);

  const submitSearch = (q: string) => {
    setLocalSearch(q);
    setSearchQuery(q);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    if (q.trim()) onNavigate('home');
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  };

  return (
    <header className="bg-white shadow-sm">

      {/* ═══════════════════ DESKTOP header ═══════════════════ */}
      <div className="hidden md:block border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="h-16 flex items-center gap-5">

            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 shrink-0">
              <img src={appLogo || '/elara-logo.jpg'} alt="Elara" className="w-9 h-9 object-contain rounded" />
              <span className="text-2xl font-black tracking-tight text-zinc-900 hidden sm:block">Elara</span>
            </button>

            {/* Location */}
            <button className="hidden lg:flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 shrink-0">
              <MapPin size={14} className="text-purple-600" />
              <div className="text-left">
                <div className="text-[9px] text-zinc-400 leading-none">Entregar para</div>
                <div className="text-xs font-bold text-zinc-900">Luanda, AO</div>
              </div>
              <ChevronDown size={12} />
            </button>

            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos, marcas e categorias..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(localSearch); }}
                className="w-full bg-zinc-100 border border-zinc-200 focus:border-purple-500 focus:bg-white rounded-lg py-2 pl-9 pr-8 text-sm font-medium outline-none placeholder:text-zinc-400 transition-colors"
              />
              {localSearch && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setLocalSearch(''); setSearchQuery(''); setShowSuggestions(false); }}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  <X size={14} />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {localSearch.trim() ? 'Sugestões' : 'Pesquisas populares'}
                    </span>
                  </div>
                  {suggestions.map((s) => (
                    <button key={s} onMouseDown={(e) => e.preventDefault()} onClick={() => submitSearch(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left transition-colors">
                      <Search size={13} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-0.5 shrink-0">
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); onMarkNotificationsRead(); }}
                  className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                      <h3 className="font-bold text-sm text-zinc-900">Notificações</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-zinc-400 text-sm">Sem notificações</div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-purple-50' : ''}`}>
                            <p className="text-xs font-bold text-zinc-900">{n.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={onOpenWishlist} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={onOpenCart} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              <button onClick={() => onNavigate('messages')} className="flex items-center gap-1 text-zinc-600 hover:text-purple-600 px-2 py-1.5 rounded-lg font-bold text-xs transition-colors">
                <MessageCircle size={15} />
                <span className="hidden lg:inline">Mensagens</span>
              </button>

              <button onClick={onSellProduct} className="flex items-center gap-1 bg-zinc-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs">
                <PlusCircle size={14} /> Vender
              </button>

              <button onClick={onOpenImport} className="hidden lg:flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                <Globe size={14} /> Importar
              </button>

              {userProfile ? (
                <button onClick={onOpenProfile} className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-purple-50 border border-zinc-200 hover:border-purple-200 transition-all group">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-200 bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
                    {userProfile.avatar && userProfile.avatar.trim() !== '' ? (
                      <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(userProfile.name || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight pr-0.5">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Olá,</span>
                    <span className="text-xs font-black text-zinc-900 truncate max-w-[90px]">{(userProfile.name || 'Usuário').split(' ')[0]}</span>
                  </div>
                  <ChevronDown size={14} className="text-zinc-400 group-hover:text-purple-600 transition-colors" />
                </button>
              ) : (
                <button onClick={onOpenAuth} className="flex items-center gap-1 text-zinc-700 hover:text-zinc-900 font-bold text-xs px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
                  <User size={16} />
                  <span className="hidden lg:inline">Conta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ MOBILE header ═══════════════════ */}
      <div className="md:hidden">

        {/* Mobile search overlay */}
        {mobileSearchOpen && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              <button onClick={() => { setMobileSearchOpen(false); setShowSuggestions(false); }}
                className="p-2 rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200 shrink-0">
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400 pointer-events-none">
                  <Search size={16} />
                </div>
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Pesquisar produtos..."
                  value={localSearch}
                  onChange={(e) => { setLocalSearch(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(localSearch); }}
                  className="w-full bg-zinc-100 border-none rounded-xl py-2.5 pl-9 pr-8 text-sm font-medium outline-none"
                  autoComplete="off"
                />
                {localSearch && (
                  <button onClick={() => { setLocalSearch(''); setSearchQuery(''); }}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {localSearch.trim() ? 'Sugestões' : 'Pesquisas populares'}
                </span>
              </div>
              {suggestions.map((s) => (
                <button key={s} onClick={() => submitSearch(s)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 active:bg-zinc-100 text-left border-b border-zinc-50 transition-colors">
                  <Search size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-sm text-zinc-700 font-medium">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Single Merged Mobile Header Strip (Top Navbar) ── */}
        <div className="h-14 flex items-center px-3 gap-2 border-b border-zinc-200 bg-white/95 backdrop-blur-xl">

          {/* Left: Back Arrow (non-home) OR Search (home) + Security Lock Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isHome ? (
              <button onClick={() => onNavigate('home')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-700 active:bg-zinc-200 shrink-0">
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button onClick={openMobileSearch}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:bg-zinc-200 shrink-0">
                <Search size={18} />
              </button>
            )}
            
            {/* Brand Logo Badge */}
            <img src={appLogo || '/elara-logo.jpg'} alt="Elara" className="w-8 h-8 object-contain rounded-lg shrink-0" />
          </div>

          {/* Center: Title / Category Name or Brand */}
          <button onClick={() => onNavigate('home')} className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden">
            {!isHome ? (
              <span className="text-sm font-black tracking-tight text-zinc-900 truncate uppercase">
                {currentView === 'product' ? 'Produto' : currentView === 'category' ? 'Categoria' : currentView}
              </span>
            ) : (
              <>
                <img src={appLogo || '/elara-logo.jpg'} alt="Elara" className="w-6 h-6 object-contain rounded shrink-0" />
                <span className="text-lg font-black tracking-tight text-zinc-900 truncate">Elara</span>
              </>
            )}
          </button>

          {/* Right: Wishlist Heart + Cart + Profile Avatar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Wishlist / Favourites */}
            <button onClick={onOpenWishlist} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 relative active:bg-zinc-100">
              <Heart size={20} className={wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={onOpenCart} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 relative active:bg-zinc-100">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] bg-purple-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Avatar or Menu */}
            {userProfile ? (
              <button onClick={onOpenProfile}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                {userProfile.avatar && userProfile.avatar.trim() !== '' ? (
                  <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(userProfile.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </button>
            ) : (
              <button onClick={toggleMobileMenu}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-600 active:bg-zinc-100">
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
