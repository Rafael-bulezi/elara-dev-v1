import React, { useState } from 'react';
import { Search, ShoppingCart, Moon, Sun, Menu, MapPin, ChevronDown, Bell, Heart, User, PlusCircle, Globe, X } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';
import { categories } from '../../constants';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
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
  onSelectCategory: (name: string) => void;
  appLogo?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  isDark, toggleTheme, toggleMobileMenu,
  cartCount, wishlistCount, notifications,
  onMarkNotificationsRead,
  onOpenCart, onOpenWishlist, onOpenProfile,
  userProfile, onOpenAuth,
  searchQuery, setSearchQuery,
  onSellProduct, onOpenImport,
  onNavigate, onSelectCategory,
  appLogo,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
      if (localSearch.trim() !== '') onNavigate('home');
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery, onNavigate]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 shadow-sm">
      {/* Main bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-3 md:px-6">
          <div className="h-14 md:h-16 flex items-center gap-3 md:gap-5">

            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 shrink-0">
              <img
                src={appLogo || '/elara-logo.jpg'}
                alt="Elara"
                className="w-8 h-8 md:w-9 md:h-9 object-contain rounded"
              />
              <span className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white hidden sm:block">Elara</span>
            </button>

            {/* Location - desktop */}
            <button className="hidden lg:flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0">
              <MapPin size={14} className="text-purple-600" />
              <div className="text-left">
                <div className="text-[9px] text-zinc-400 leading-none">Entregar para</div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Luanda, AO</div>
              </div>
              <ChevronDown size={12} />
            </button>

            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos, marcas e categorias..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-950 rounded-lg py-2 pl-9 pr-4 text-sm font-medium outline-none dark:text-white placeholder:text-zinc-400 transition-colors"
              />
              {localSearch && (
                <button onClick={() => { setLocalSearch(''); setSearchQuery(''); }} className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); onMarkNotificationsRead(); }}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-zinc-950" />
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Notificações</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-zinc-400 text-sm">Sem notificações</div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">{n.title}</p>
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
              <button onClick={onOpenWishlist} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 relative">
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-zinc-950">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button onClick={onOpenCart} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 relative">
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-zinc-950">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Sell */}
              <button onClick={onSellProduct} className="hidden md:flex items-center gap-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg font-bold text-xs">
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
                <button onClick={onOpenProfile} className="hidden md:flex items-center gap-1.5 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
                  </div>
                </button>
              ) : (
                <button onClick={onOpenAuth} className="hidden md:flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-bold text-xs px-2 py-1.5">
                  <User size={16} />
                  <span className="hidden lg:inline">Conta</span>
                </button>
              )}

              <button onClick={toggleMobileMenu} className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Nav Strip */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-0 overflow-x-auto custom-scrollbar">
            <button onClick={() => onNavigate('home')} className="shrink-0 px-3 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 border-b-2 border-purple-600">
              Início
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => onSelectCategory(cat.name)}
                className="shrink-0 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white uppercase tracking-wide whitespace-nowrap">
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
