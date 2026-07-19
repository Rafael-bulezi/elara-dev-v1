import React, { useState, useRef } from 'react';
import { ArrowRight, Smartphone, Shirt, Cpu, Laptop, Home, Sparkles, Dumbbell, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../../types';
import ImageWithFallback from '../common/ImageWithFallback';

const catIconMap: Record<string, React.ReactNode> = {
  Smartphones: <Smartphone size={16} />,
  Moda: <Shirt size={16} />,
  'Eletrónicos': <Cpu size={16} />,
  Computadores: <Laptop size={16} />,
  Casa: <Home size={16} />,
  Beleza: <Sparkles size={16} />,
  Esportes: <Dumbbell size={16} />,
};

const catBanners: Record<string, string> = {
  Smartphones: '/hero-banner.jpg',
  Moda: '/banner-urban.jpg',
  'Eletrónicos': '/hero-banner.jpg',
  Computadores: '/hero-banner.jpg',
  Casa: '/banner-kitchen.jpg',
  Beleza: '/banner-beauty.jpg',
  Esportes: '/banner-fitness.jpg',
};

const catColors: Record<string, string> = {
  Smartphones: 'text-blue-600',
  Moda: 'text-pink-600',
  'Eletrónicos': 'text-purple-600',
  Computadores: 'text-indigo-600',
  Casa: 'text-amber-600',
  Beleza: 'text-rose-600',
  Esportes: 'text-emerald-600',
};

interface CategoryMegaMenuProps {
  categories: { id: string; name: string; icon: string }[];
  products: Product[];
  onSelectCategory: (name: string) => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (p: Product) => void;
  onNavigate: (view: 'home') => void;
}

const MiniProductCard: React.FC<{
  product: Product;
  onClick: () => void;
  onCart: (e: React.MouseEvent) => void;
  wishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
}> = ({ product, onClick, onCart, wishlisted, onWishlist }) => (
  <div onClick={onClick} className="group cursor-pointer flex flex-col">
    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2">
      <ImageWithFallback
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-200"
      />
      <button
        onClick={onWishlist}
        className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-colors ${wishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-zinc-400 hover:text-rose-500'}`}
      >
        <Heart size={11} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1 leading-tight mb-1">{product.title}</p>
    <p className="text-xs font-black text-zinc-900 dark:text-white mb-1.5">{product.price.toLocaleString('pt-AO')} Kz</p>
    <button
      onClick={onCart}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
    >
      <ShoppingCart size={10} />
      Adicionar
    </button>
  </div>
);

const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  categories, products, onSelectCategory, onProductClick, onAddToCart, wishlist, onToggleWishlist, onNavigate,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (name: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHovered(name);
  };

  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setHovered(null), 150);
  };

  const catProducts = hovered
    ? products.filter(p => p.category === hovered).slice(0, 5)
    : [];

  return (
    <div
      className="sticky top-[56px] md:top-[64px] z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
      onMouseLeave={handleLeave}
    >
      {/* Strip */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1.5">
          <button
            onClick={() => onNavigate('home')}
            onMouseEnter={() => handleEnter('')}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white"
          >
            Início
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => handleEnter(cat.name)}
              onClick={() => { setHovered(null); onSelectCategory(cat.name); }}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap
                ${hovered === cat.name
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-purple-400 hover:text-purple-600'
                }`}
            >
              <span className={catColors[cat.name] || 'text-zinc-500'}>
                {catIconMap[cat.name]}
              </span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mega-menu dropdown */}
      {hovered && catProducts.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl z-50"
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={handleLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex gap-5">
            {/* Banner */}
            <div className="hidden md:flex shrink-0 w-52 flex-col gap-3">
              <div className="rounded-xl overflow-hidden h-36">
                <img
                  src={catBanners[hovered] || '/hero-banner.jpg'}
                  alt={hovered}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">{hovered}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Explore {catProducts.length > 0 ? 'os mais vendidos' : 'todos os produtos'}</p>
              </div>
              <button
                onClick={() => { setHovered(null); onSelectCategory(hovered); }}
                className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                Ver tudo <ArrowRight size={12} />
              </button>
            </div>

            {/* Products */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {catProducts.map(p => (
                <MiniProductCard
                  key={p.id}
                  product={p}
                  onClick={() => { setHovered(null); onProductClick(p); }}
                  onCart={(e) => { e.stopPropagation(); onAddToCart(p); }}
                  wishlisted={wishlist.includes(p.id)}
                  onWishlist={(e) => { e.stopPropagation(); onToggleWishlist(p); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
