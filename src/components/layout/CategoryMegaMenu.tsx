import React, { useState, useRef } from 'react';
import { ArrowRight, Smartphone, Shirt, Cpu, Laptop, Home, Sparkles, Dumbbell } from 'lucide-react';
import { Product } from '../../types';

const catIconMap: Record<string, React.ReactNode> = {
  Smartphones: <Smartphone size={16} />,
  Moda: <Shirt size={16} />,
  'Eletrónicos': <Cpu size={16} />,
  Computadores: <Laptop size={16} />,
  Casa: <Home size={16} />,
  Beleza: <Sparkles size={16} />,
  Esportes: <Dumbbell size={16} />,
};

// Category-specific banner for the left panel
const catBanners: Record<string, string> = {
  Smartphones:    '/banner-tech.jpg',
  Moda:           '/banner-beauty2.jpg',
  'Eletrónicos':  '/banner-eletronicos.jpg',
  Computadores:   '/banner-tech.jpg',
  Casa:           '/banner-casa.jpg',
  Beleza:         '/banner-beauty2.jpg',
  Esportes:       '/banner-sports.jpg',
};

// Four featured banner tiles shown on the right of every dropdown
const FEATURED_BANNERS = [
  { img: '/banner-tech.jpg',       label: 'Eletrónicos & Tech',   tag: 'Tendência',     cat: 'Eletrónicos' },
  { img: '/banner-sports.jpg',     label: 'Esportes & Fitness',   tag: 'Novo',          cat: 'Esportes' },
  { img: '/banner-casa.jpg',       label: 'Casa & Cozinha',       tag: 'Em destaque',   cat: 'Casa' },
  { img: '/banner-eletronicos.jpg',label: 'Arte & Criatividade',  tag: 'Importação',    cat: 'Eletrónicos' },
];

const catColors: Record<string, string> = {
  Smartphones:   'text-blue-600',
  Moda:          'text-pink-600',
  'Eletrónicos': 'text-purple-600',
  Computadores:  'text-indigo-600',
  Casa:          'text-amber-600',
  Beleza:        'text-rose-600',
  Esportes:      'text-emerald-600',
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

const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  categories, onSelectCategory, onNavigate,
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

  return (
    <div
      className="sticky top-[56px] md:top-[64px] z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
      onMouseLeave={handleLeave}
    >
      {/* Pill strip */}
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
      {hovered && hovered !== '' && (
        <div
          className="absolute left-0 right-0 top-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl z-50"
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onMouseLeave={handleLeave}
        >
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex gap-5">

            {/* Left: category-specific banner */}
            <div
              className="hidden md:flex shrink-0 w-56 flex-col gap-3 cursor-pointer group"
              onClick={() => { setHovered(null); onSelectCategory(hovered); }}
            >
              <div className="relative rounded-2xl overflow-hidden h-48 shadow-md">
                <img
                  src={catBanners[hovered] || '/banner-hero-main.jpg'}
                  alt={hovered}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-sm leading-tight">{hovered}</p>
                  <p className="text-white/70 text-[10px] mt-0.5">Ver todos os produtos</p>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
              >
                Ver tudo em {hovered} <ArrowRight size={12} />
              </button>
            </div>

            {/* Right: 4 featured banner tiles */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
              {FEATURED_BANNERS.map((b, i) => (
                <div
                  key={i}
                  onClick={() => { setHovered(null); onSelectCategory(b.cat); }}
                  className="relative rounded-xl overflow-hidden cursor-pointer group aspect-[4/3]"
                >
                  <img
                    src={b.img}
                    alt={b.label}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  {/* Tag pill */}
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {b.tag}
                  </span>
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-bold text-xs leading-tight">{b.label}</p>
                    <p className="text-white/60 text-[9px] mt-0.5 flex items-center gap-0.5">
                      Explorar <ArrowRight size={8} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
