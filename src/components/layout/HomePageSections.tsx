import React from 'react';
import { ArrowRight, Clock, Flame, Smartphone, Shirt, Cpu, Laptop, Home, Sparkles, Dumbbell, Globe } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../product/ProductCard';

const catIconMap: Record<string, React.ReactNode> = {
  Smartphones: <Smartphone size={20} />,
  Moda: <Shirt size={20} />,
  Eletrónicos: <Cpu size={20} />,
  Computadores: <Laptop size={20} />,
  Casa: <Home size={20} />,
  Beleza: <Sparkles size={20} />,
  Esportes: <Dumbbell size={20} />,
};

const catColors: Record<string, string> = {
  Smartphones: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  Moda: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
  Eletrónicos: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  Computadores: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
  Casa: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  Beleza: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  Esportes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
};

interface SectionProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onProductClick: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (p: Product) => void;
  onSelectCategory: (name: string) => void;
  onOpenImport: () => void;
}

export const CategoryPills: React.FC<{ categories: { id: string; name: string; icon: string }[]; onSelect: (name: string) => void }> = ({ categories, onSelect }) => (
  <section className="py-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => onSelect(cat.name)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors`}>
            <span className={catColors[cat.name] || 'bg-zinc-100 text-zinc-600'}>{catIconMap[cat.name] ? React.cloneElement(catIconMap[cat.name] as React.ReactElement, { size: 14 }) : null}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  </section>
);

export const OfertasDoDia: React.FC<Omit<SectionProps, 'onOpenImport' | 'onSelectCategory'>> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist,
}) => {
  const dealProducts = products.filter(p => p.emPromocao || (p.originalPrice && p.originalPrice > p.price)).slice(0, 8);
  const displayProducts = dealProducts.length > 0 ? dealProducts : products.slice(0, 8);

  return (
    <section className="py-6 bg-white dark:bg-zinc-950">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">Ofertas do Dia</h2>
            <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              <Clock size={11} />
              Renova em 24h
            </span>
          </div>
          <button className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        {/* Promo Banner */}
        <div className="mb-4 rounded-xl overflow-hidden">
          <img src="/banner-urban.jpg" alt="Ofertas" className="w-full h-28 md:h-40 object-cover object-center" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              wishlisted={wishlist.includes(p.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const FeaturedSection: React.FC<SectionProps> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist, onSelectCategory, onOpenImport,
}) => {
  // Pick 3 different categories to feature
  const cats = ['Smartphones', 'Moda', 'Eletrónicos', 'Computadores', 'Casa', 'Beleza', 'Esportes'];

  return (
    <>
      {cats.map((cat, idx) => {
        const catProducts = products.filter(p => p.category === cat).slice(0, 6);
        if (catProducts.length === 0) return null;

        // Every 3rd section, show an import banner
        const showBanner = idx === 2;

        return (
          <React.Fragment key={cat}>
            {showBanner && (
              <section className="bg-[#5A189A] py-8 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">Importação Personalizada</p>
                    <h3 className="text-white font-black text-xl md:text-2xl">Não encontrou o que procura?</h3>
                    <p className="text-purple-200 text-sm mt-1">Importamos da China, EUA ou Europa com as melhores taxas.</p>
                  </div>
                  <button onClick={onOpenImport} className="shrink-0 flex items-center gap-2 bg-white text-[#5A189A] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-100 transition-colors">
                    <Globe size={16} />
                    Pedir Importação
                  </button>
                </div>
              </section>
            )}

            <section className="py-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${catColors[cat] || 'bg-zinc-100 text-zinc-600'}`}>
                      {catIconMap[cat]}
                    </span>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white">{cat}</h2>
                  </div>
                  <button onClick={() => onSelectCategory(cat)} className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                    Ver mais <ArrowRight size={14} />
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-x-visible">
                  {catProducts.map(p => (
                    <div key={p.id} className="min-w-[150px] md:min-w-0 shrink-0 md:shrink">
                      <ProductCard
                        product={p}
                        onAddToCart={onAddToCart}
                        onProductClick={onProductClick}
                        wishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={onToggleWishlist}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </React.Fragment>
        );
      })}
    </>
  );
};
