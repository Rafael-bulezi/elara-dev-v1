import React from 'react';
import { Search, ShoppingCart, Moon, Sun, Menu, PlusCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { getAvatarUrl } from '../utils/avatar';
import logo from '../assets/elara-logo.png';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSellProduct: () => void;
  appLogo?: string | null;
}

const Header = ({ 
  isDark, 
  toggleTheme, 
  toggleMobileMenu, 
  cartCount, 
  onOpenCart, 
  onOpenProfile, 
  userProfile, 
  onOpenAuth, 
  searchQuery, 
  setSearchQuery, 
  onSellProduct,
  onNavigate,
  appLogo
}: HeaderProps & { onNavigate: (view: 'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote') => void }) => {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
      if (localSearch.trim() !== '') {
        onNavigate('home');
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery, onNavigate]);

  return (
  <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
    <div className="container mx-auto px-4">
      <div className="h-14 md:h-20 flex items-center justify-between gap-3 md:gap-8">
        {/* Logo */}
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform bg-purple-600 text-white font-black text-2xl shrink-0">
            <img 
              src={appLogo || logo} 
              alt="Elara" 
              className="w-full h-full object-cover scale-125" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== window.location.origin + logo && target.src !== logo) {
                  target.src = logo;
                } else {
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = 'E';
                }
              }} 
            />
          </div>
          <span className="text-2xl md:text-3xl font-black tracking-tighter dark:text-white">Elara</span>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider ml-1">Beta</span>
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-2xl relative group">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-400 group-focus-within:text-purple-500 transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="O que você está procurando hoje?"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent focus:border-purple-500/50 focus:bg-white dark:focus:bg-zinc-950 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium transition-all outline-none dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={toggleTheme}
            className="p-1.5 md:p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            {isDark ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
          </button>

          <button 
            onClick={onSellProduct}
            className="hidden lg:flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10 dark:shadow-white/10"
          >
            <PlusCircle size={18} />
            Vender
          </button>

          <button 
            onClick={onOpenCart}
            className="relative p-1.5 md:p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors group"
          >
            <ShoppingCart size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 md:w-5 md:h-5 bg-purple-600 text-white text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden md:block" />

          {userProfile ? (
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 md:gap-2 p-0.5 md:p-1 md:pr-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
            >
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-purple-500 transition-colors">
                <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black dark:text-white leading-none mb-1">{userProfile.name.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ver Perfil</p>
              </div>
            </button>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-xs md:text-sm shadow-lg shadow-purple-500/30 active:scale-95 transition-all"
            >
              Entrar
            </button>
          )}

          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      
      <div className="pb-3 md:hidden">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-900 py-2 pl-10 pr-4 rounded-xl text-sm text-zinc-900 dark:text-white font-medium outline-none border-2 border-transparent focus:border-purple-500/30 transition-all"
          />
        </div>
      </div>
    </div>
  </header>
  );
};

export default Header;
