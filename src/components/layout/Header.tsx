import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, MapPin, ChevronDown, Bell, Heart, User, PlusCircle, Globe, X, MessageCircle } from 'lucide-react';
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
}

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
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

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
    if (q.trim()) onNavigate('home');
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Main bar */}
      <div className="border-b border-zinc-200">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="h-14 md:h-16 flex items-center gap-3 md:gap-5">

            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 shrink-0">
              <img
                src={appLogo || '/elara-logo.jpg'}
                alt="Elara"
                className="w-8 h-8 md:w-9 md:h-9 object-contain rounded"
              />
              <span className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 hidden sm:block">Elara</span>
            </button>

            {/* Location - desktop */}
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

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {localSearch.trim() ? 'Sugestões' : 'Pesquisas populares'}
                    </span>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => submitSearch(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left transition-colors"
                    >
                      <Search size={13} className="text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); onMarkNotificationsRead(); }}
                  className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                  )}
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

              {/* Wishlist */}
              <button onClick={onOpenWishlist} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button onClick={onOpenCart} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Chat */}
              <button onClick={() => onNavigate('messages')} className="hidden md:flex items-center gap-1 text-zinc-600 hover:text-purple-600 px-2 py-1.5 rounded-lg font-bold text-xs transition-colors">
                <MessageCircle size={15} />
                <span className="hidden lg:inline">Mensagens</span>
              </button>

              {/* Sell */}
              <button onClick={onSellProduct} className="hidden md:flex items-center gap-1 bg-zinc-900 text-white px-3 py-1.5 rounded-lg font-bold text-xs">
                <PlusCircle size={14} />
                Vender
              </button>

              {/* Import */}
              <button onClick={onOpenImport} className="hidden lg:flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
                <Globe size={14} />
                Importar
              </button>

              {/* Account */}
              {userProfile ? (
                <button onClick={onOpenProfile} className="hidden md:flex items-center gap-1.5 p-1 rounded-lg hover:bg-zinc-100 transition-colors">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200">
                    <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
                  </div>
                </button>
              ) : (
                <button onClick={onOpenAuth} className="hidden md:flex items-center gap-1 text-zinc-700 hover:text-zinc-900 font-bold text-xs px-2 py-1.5">
                  <User size={16} />
                  <span className="hidden lg:inline">Conta</span>
                </button>
              )}

              <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-lg hover:bg-zinc-100 text-zinc-500">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
