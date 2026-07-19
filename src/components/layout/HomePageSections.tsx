import React from 'react';
import { ArrowRight, Clock, Flame, Globe, Percent } from 'lucide-react';
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
    <section className="py-8 bg-white border-b border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-black text-zinc-900">Ofertas do Dia</h2>
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-semibold">
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

/* ─── 2. CATEGORY SHOWCASE (Amazon-style 4-pod grid) ─── */
const SHOWCASE_PODS = [
  {
    title: 'Smartphones & Tablets',
    sub: 'Os mais vendidos',
    cat: 'Smartphones',
    link: 'Ver todos os Smartphones',
  },
  {
    title: 'Eletrónicos & Tech',
    sub: 'Tendências do momento',
    cat: 'Eletrónicos',
    link: 'Ver todos os Eletrónicos',
  },
  {
    title: 'Moda & Estilo',
    sub: 'Novidades da semana',
    cat: 'Moda',
    link: 'Ver toda a Moda',
  },
  {
    title: 'Esportes & Fitness',
    sub: 'Equipe-se para treinar',
    cat: 'Esportes',
    link: 'Ver todos os Esportes',
  },
];

export const CategoryShowcaseSection: React.FC<CommonProps & { onSelectCategory: (name: string) => void }> = ({
  products, onProductClick, onSelectCategory,
}) => (
  <section className="py-8 bg-white border-b border-zinc-100">
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SHOWCASE_PODS.map((pod, podIdx) => {
          const items = products.filter(p => p.category === pod.cat).slice(0, 4);

          // Pod 1 = very pale purple, Pod 3 = black/dark
          const isDark = podIdx === 3;
          const isPale = podIdx === 1;
          const podBg   = isDark ? 'bg-zinc-900 border-zinc-800' : isPale ? 'bg-purple-50 border-purple-100' : 'bg-white border-zinc-200';
          const headClr = isDark ? 'text-white' : 'text-zinc-900';
          const subClr  = isDark ? 'text-zinc-400' : 'text-zinc-500';
          const titleClr= isDark ? 'text-zinc-300' : 'text-zinc-600';
          const imgBg   = isDark ? 'bg-zinc-800' : isPale ? 'bg-white/70' : 'bg-zinc-100';
          const divider = isDark ? 'border-zinc-700' : isPale ? 'border-purple-200' : 'border-zinc-100';
          const linkClr = isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700';

          return (
            <div key={pod.cat} className={`rounded-2xl border p-4 flex flex-col gap-3 ${podBg}`}>
              {/* Pod header */}
              <div>
                <h3 className={`text-sm font-black leading-tight ${headClr}`}>{pod.title}</h3>
                <p className={`text-[11px] mt-0.5 ${subClr}`}>{pod.sub}</p>
              </div>

              {/* 2×2 image grid */}
              <div className="grid grid-cols-2 gap-2">
                {(items.length >= 4 ? items : [...items, ...items, ...items, ...items]).slice(0, 4).map((p, i) => (
                  <div
                    key={`${p.id}-${i}`}
                    onClick={() => onProductClick(p)}
                    className="cursor-pointer group"
                  >
                    <div className={`aspect-square rounded-xl overflow-hidden mb-1 ${imgBg}`}>
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-200"
                      />
                    </div>
                    <p className={`text-[10px] line-clamp-1 font-medium leading-tight ${titleClr}`}>
                      {p.title.split(' ').slice(0, 3).join(' ')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer link */}
              <button
                onClick={() => onSelectCategory(pod.cat)}
                className={`text-xs font-bold flex items-center gap-1 mt-auto pt-1 border-t ${divider} ${linkClr}`}
              >
                {pod.link} <ArrowRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ─── 3. STRIP ROW (1×5 horizontal, compact) ─── */
export const StripSection: React.FC<CommonProps & { category: string; onViewAll: () => void }> = ({
  products, onAddToCart, onProductClick, wishlist, onToggleWishlist, category, onViewAll,
}) => {
  const cats = products.filter(p => p.category === category).slice(0, 5);
  if (cats.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-zinc-900">{category}</h2>
          <button onClick={onViewAll} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Ver mais <ArrowRight size={13} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-snap-x custom-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-x-visible touch-pan-x">
          {cats.map(p => (
            <div key={p.id} className="min-w-[155px] md:min-w-0 shrink-0 md:shrink scroll-snap-item">
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
    <section className="py-8 bg-zinc-50 border-b border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-amber-500" />
            <h2 className="text-lg font-black text-zinc-900">{cats.join(' & ')}</h2>
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
  <section className="py-10 bg-zinc-900">
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
