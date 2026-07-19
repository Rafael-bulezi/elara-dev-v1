import React from 'react';
import { ArrowRight, Clock, Flame, Globe, TrendingUp, Percent } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../product/ProductCard';

/* ─── Shared types ─── */
interface CommonProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onProductClick: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (p: Product) => void;
}

/* ─── 1. OFERTAS DO DIA  (6-card horizontal scroll on mobile / 6-col grid desktop) ─── */
export const OfertasDoDia: React.FC<CommonProps> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist,
}) => {
  const deals = products.filter(p => p.emPromocao || (p.originalPrice && p.originalPrice > p.price));
  const display = (deals.length >= 6 ? deals : products).slice(0, 6);

  return (
    <section className="py-8 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">Ofertas do Dia</h2>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-semibold">
              <Clock size={10} /> Renova em 24h
            </span>
          </div>
          <button className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Ver todas <ArrowRight size={13} />
          </button>
        </div>

        {/* horizontal scroll mobile / grid desktop */}
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-x-visible">
          {display.map(p => (
            <div key={p.id} className="min-w-[155px] md:min-w-0 shrink-0 md:shrink">
              <ProductCard product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── 2. FEATURE HERO (1 large + 4 small: 5-product asymmetric) ─── */
export const FeatureHeroSection: React.FC<CommonProps & { category: string; onViewAll: () => void }> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist, category, onViewAll,
}) => {
  const cats = products.filter(p => p.category === category).slice(0, 5);
  if (cats.length < 2) return null;

  const [hero, ...rest] = cats;
  const discount = hero.originalPrice && hero.originalPrice > hero.price
    ? Math.round(((hero.originalPrice - hero.price) / hero.originalPrice) * 100) : null;

  return (
    <section className="py-8 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">{category}</h2>
          </div>
          <button onClick={onViewAll} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Ver mais <ArrowRight size={13} />
          </button>
        </div>

        {/* Desktop: 1 large left + 2×2 right | Mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {/* Hero card */}
          <div
            onClick={() => onProductClick(hero)}
            className="md:col-span-1 row-span-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden cursor-pointer hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col"
          >
            <div className="relative flex-1 min-h-48">
              {discount && (
                <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-black px-2 py-1 rounded-lg">-{discount}%</span>
              )}
              <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(hero); }}
                className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow ${wishlist.includes(hero.id) ? 'bg-rose-500 text-white' : 'bg-white/90 text-zinc-400 hover:text-rose-500'}`}>
                <Flame size={14} fill={wishlist.includes(hero.id) ? 'currentColor' : 'none'} />
              </button>
              <img src={hero.image} alt={hero.title} className="w-full h-56 object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 mb-2">{hero.title}</p>
              <p className="text-xl font-black text-zinc-900 dark:text-white mb-3">{hero.price.toLocaleString('pt-AO')} Kz</p>
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(hero); }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>

          {/* 4 small cards in 2×2 */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {rest.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            ))}
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex md:hidden gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4">
          {cats.map(p => (
            <div key={p.id} className="min-w-[155px] shrink-0">
              <ProductCard product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── 3. STRIP ROW (1×5 horizontal, compact) ─── */
export const StripSection: React.FC<CommonProps & { category: string; onViewAll: () => void }> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist, category, onViewAll,
}) => {
  const cats = products.filter(p => p.category === category).slice(0, 5);
  if (cats.length === 0) return null;

  return (
    <section className="py-8 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">{category}</h2>
          <button onClick={onViewAll} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Ver mais <ArrowRight size={13} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-x-visible">
          {cats.map(p => (
            <div key={p.id} className="min-w-[155px] md:min-w-0 shrink-0 md:shrink">
              <ProductCard product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── 4. IMPORT CTA ─── */
export const ImportCTA: React.FC<{ onOpenImport: () => void }> = ({ onOpenImport }) => (
  <section className="bg-[#5A189A] py-10 px-4">
    <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="text-center sm:text-left">
        <p className="text-purple-300 text-xs font-black uppercase tracking-widest mb-2">Importação Personalizada</p>
        <h3 className="text-white font-black text-2xl md:text-3xl leading-tight mb-2">
          Não encontrou o que procura?
        </h3>
        <p className="text-purple-200 text-sm max-w-sm">
          Importamos da China, EUA ou Europa. Produtos únicos com as melhores taxas do mercado angolano.
        </p>
      </div>
      <button
        onClick={onOpenImport}
        className="shrink-0 flex items-center gap-2 bg-white text-[#5A189A] px-7 py-3.5 rounded-xl font-black text-sm hover:bg-zinc-100 transition-colors shadow-xl"
      >
        <Globe size={18} />
        Pedir Importação
      </button>
    </div>
  </section>
);

/* ─── 5. 2×2 GRID (4 products, two categories combined) ─── */
export const DuoGrid: React.FC<CommonProps & { categories: string[]; onSelectCategory: (name: string) => void }> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist, categories: cats, onSelectCategory,
}) => {
  const display = cats.flatMap(cat =>
    products.filter(p => p.category === cat).slice(0, 2)
  ).slice(0, 4);
  if (display.length < 2) return null;

  return (
    <section className="py-8 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-amber-500" />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">{cats.join(' & ')}</h2>
          </div>
          <div className="flex gap-2">
            {cats.map(cat => (
              <button key={cat} onClick={() => onSelectCategory(cat)}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
                {cat} <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {display.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
              wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── 6. STATS TRUST STRIP ─── */
export const StatsBanner: React.FC = () => (
  <section className="py-10 bg-zinc-900 dark:bg-zinc-950">
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { value: '10K+', label: 'Produtos' },
          { value: '500+', label: 'Vendedores' },
          { value: '98%', label: 'Avaliações positivas' },
          { value: '24-48h', label: 'Entrega em Luanda' },
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
            <p className="text-sm text-zinc-400 font-semibold">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
