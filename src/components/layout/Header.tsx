import React from 'react';
import { Search, ShoppingCart, Moon, Sun, Menu, MapPin, User, ChevronDown, PlusCircle, Globe } from 'lucide-react';
import { UserProfile } from '../../types';
import { getAvatarUrl } from '../../utils/avatar';
import { CLOUD_LOGO } from '../../constants/logo';
import { categories } from '../../constants';

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
  onOpenImport: () => void;
  onNavigate: (view: 'home' | 'orders' | 'products' | 'settings' | 'seller' | 'admin' | 'messages' | 'chat' | 'quote' | 'category') => void;
  onSelectCategory: (name: string) => void;
  appLogo?: string | null;
}

const Header: React.FC<HeaderProps> = ({
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
  onOpenImport,
  onNavigate,
  onSelectCategory,
  appLogo,
}) => {
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

  const handleCategoryClick = (name: string) => {
    setSearchQuery('');
    onSelectCategory(name);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      {/* Top Bar */}
      <div className="container mx-auto px-4">
        <div className="h-14 md:h-16 flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-purple-600 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={appLogo || CLOUD_LOGO}
                alt="Elara"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Elara</span>
          </button>

          {/* Location - desktop only */}
          <button className="hidden lg:flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <MapPin size={14} />
            <span>Luanda, AO</span>
            <ChevronDown size={14} />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Pesquisar em toda a Elara..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-purple-500 focus:bg-white dark:focus:bg-zinc-950 rounded-lg py-2 pl-10 pr-4 text-sm font-medium outline-none dark:text-white placeholder:text-zinc-400 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={onSellProduct}
              className="hidden lg:flex items-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-lg font-bold text-xs transition-colors"
            >
              <PlusCircle size={16} />
              Vender
            </button>

            <button
              onClick={onOpenImport}
              className="hidden lg:flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-bold text-xs transition-colors"
            >
              <Globe size={16} />
              Importar
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>

            {userProfile ? (
              <button
                onClick={onOpenProfile}
                className="hidden md:flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img src={getAvatarUrl(userProfile.avatar, userProfile.name)} alt={userProfile.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white leading-none">Olá, {userProfile.name.split(' ')[0]}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Conta</p>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden md:flex items-center gap-1.5 text-zinc-900 dark:text-white font-bold text-xs px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <User size={18} />
                <span className="hidden lg:inline">Entrar</span>
              </button>
            )}

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Nav */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => onNavigate('home')}
              className="shrink-0 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Início
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="shrink-0 px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors uppercase tracking-wide"
              >
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
