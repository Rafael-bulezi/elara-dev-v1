import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, X, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { Product, ProductCondition } from '../types';
import { DiscoveryFilters } from '../types/discovery';
import ProductCard from '../components/product/ProductCard';

interface Props {
  products: Product[];
  filters: DiscoveryFilters;
  onChangeFilters: (f: DiscoveryFilters) => void;
  onBack: () => void;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlist?: string[];
  onToggleWishlist?: (p: Product) => void;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Mais relevantes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'rating', label: 'Mais avaliados' },
];

const BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'LG', 'Sony', 'Tecno', 'Infinix', 'Huawei'];

// Collapsible filter section
const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200 py-4">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-sm font-bold text-zinc-900 mb-0">
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

// Applied filter chips
const AppliedFilters: React.FC<{ filters: DiscoveryFilters; onChange: (f: DiscoveryFilters) => void }> = ({ filters, onChange }) => {
  const chips: { label: string; clear: () => void }[] = [];

  if (filters.minPrice) chips.push({ label: `Mín: ${filters.minPrice.toLocaleString('pt-AO')} Kz`, clear: () => onChange({ ...filters, minPrice: null }) });
  if (filters.maxPrice) chips.push({ label: `Máx: ${filters.maxPrice.toLocaleString('pt-AO')} Kz`, clear: () => onChange({ ...filters, maxPrice: null }) });
  if (filters.condition) chips.push({ label: filters.condition, clear: () => onChange({ ...filters, condition: null }) });
  if (filters.verified) chips.push({ label: 'Verificado', clear: () => onChange({ ...filters, verified: false }) });
  if (filters.localOnly) chips.push({ label: 'Local', clear: () => onChange({ ...filters, localOnly: false }) });
  if (filters.importOnly) chips.push({ label: 'Importado', clear: () => onChange({ ...filters, importOnly: false }) });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <span key={i} className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {chip.label}
          <button onClick={chip.clear} className="ml-0.5 hover:text-purple-900"><X size={12} /></button>
        </span>
      ))}
      <button onClick={() => onChange({ ...filters, minPrice: null, maxPrice: null, condition: null, verified: false, localOnly: false, importOnly: false })}
        className="text-xs font-bold text-zinc-500 hover:text-rose-500 underline">
        Limpar tudo
      </button>
    </div>
  );
};

// Filter Panel (sidebar content reused for both desktop + mobile)
const FilterPanel: React.FC<{
  filters: DiscoveryFilters;
  onChange: (f: DiscoveryFilters) => void;
  resultCount: number;
  onClose?: () => void;
}> = ({ filters, onChange, resultCount, onClose }) => {
  const [brandSearch, setBrandSearch] = useState('');
  const filteredBrands = BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const minPriceRef = React.useRef<HTMLInputElement>(null);
  const maxPriceRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0">
        <h3 className="font-black text-zinc-900">Filtros</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange({ ...filters, minPrice: null, maxPrice: null, condition: null, verified: false, localOnly: false, importOnly: false })}
            className="text-xs font-bold text-purple-600 hover:underline">
            Limpar tudo
          </button>
          {onClose && <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {/* Delivery */}
        <FilterSection title="Entrega" defaultOpen>
          <div className="space-y-2">
            {[
              { label: 'Rápida em Luanda (24-48h)', key: 'localOnly' as const },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters[opt.key] ? 'bg-purple-600 border-purple-600' : 'border-zinc-300'}`}
                  onClick={() => onChange({ ...filters, [opt.key]: !filters[opt.key] })}>
                  {filters[opt.key] && <Check size={10} className="text-white" />}
                </div>
                <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{opt.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.importOnly ? 'bg-purple-600 border-purple-600' : 'border-zinc-300'}`}
                onClick={() => onChange({ ...filters, importOnly: !filters.importOnly })}>
                {filters.importOnly && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Províncias (1-5 dias)</span>
            </label>
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Preço (Kz)" defaultOpen>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Mín</label>
              <input ref={minPriceRef} type="number" placeholder="5.000"
                defaultValue={filters.minPrice ?? ''}
                onBlur={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full mt-1 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 bg-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Máx</label>
              <input ref={maxPriceRef} type="number" placeholder="2.000.000"
                defaultValue={filters.maxPrice ?? ''}
                onBlur={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full mt-1 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 bg-white outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Até 50.000', '50k–200k', '200k–1M', 'Acima 1M'].map((r, i) => {
              const ranges = [[null, 50000], [50000, 200000], [200000, 1000000], [1000000, null]];
              const [min, max] = ranges[i];
              const active = filters.minPrice === min && filters.maxPrice === max;
              return (
                <button key={r}
                  onClick={() => onChange({ ...filters, minPrice: min as number | null, maxPrice: max as number | null })}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors font-semibold ${active ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-300 text-zinc-600 hover:border-purple-500'}`}>
                  {r}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Marca" defaultOpen>
          <div className="relative mb-2">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
              placeholder="Pesquisar marca"
              className="w-full border border-zinc-300 rounded-lg pl-7 pr-3 py-1.5 text-xs bg-white text-zinc-900 outline-none focus:border-purple-500" />
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {filteredBrands.map(brand => (
              <label key={brand} className="flex items-center justify-between gap-2 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-zinc-300 flex items-center justify-center" />
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{brand}</span>
                </div>
                <span className="text-[10px] text-zinc-400">({Math.floor(Math.random() * 200) + 10})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Condition */}
        <FilterSection title="Condição" defaultOpen={false}>
          <div className="flex gap-2 flex-wrap">
            {['Novo', 'Semi-novo', 'Usado'].map(c => (
              <button key={c} onClick={() => onChange({ ...filters, condition: filters.condition === c ? null : c as ProductCondition })}
                className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-colors ${filters.condition === c ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-300 text-zinc-600 hover:border-purple-500'}`}>
                {c}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Seller */}
        <FilterSection title="Vendedor" defaultOpen={false}>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.verified ? 'bg-purple-600 border-purple-600' : 'border-zinc-300'}`}
              onClick={() => onChange({ ...filters, verified: !filters.verified })}>
              {filters.verified && <Check size={10} className="text-white" />}
            </div>
            <span className="text-sm text-zinc-700">Vendedores Angolanos Verificados</span>
          </label>
        </FilterSection>
      </div>

      {/* Mobile sticky CTA */}
      {onClose && (
        <div className="shrink-0 px-4 py-4 border-t border-zinc-200">
          <button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
            Ver resultados ({resultCount})
          </button>
        </div>
      )}
    </div>
  );
};

const ProductListingView: React.FC<Props> = ({
  products, filters, onChangeFilters, onBack,
  onProductClick, onAddToCart,
  wishlist = [], onToggleWishlist,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sort, setSort] = useState<string>(filters.sort || 'relevance');

  const filtered = useMemo(() => {
    let r = [...products];
    if (filters.category) r = r.filter(p => p.category === filters.category);
    if (filters.query) r = r.filter(p => p.title.toLowerCase().includes(filters.query.toLowerCase()) || p.category.toLowerCase().includes(filters.query.toLowerCase()));
    if (filters.minPrice) r = r.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice) r = r.filter(p => p.price <= filters.maxPrice!);
    if (filters.condition) r = r.filter(p => p.condition === (filters.condition as ProductCondition));
    if (filters.verified) r = r.filter(p => p.verified);
    if (filters.localOnly) r = r.filter(p => !p.isImport);
    if (filters.importOnly) r = r.filter(p => p.isImport);

    switch (sort) {
      case 'price_asc': r.sort((a, b) => a.price - b.price); break;
      case 'price_desc': r.sort((a, b) => b.price - a.price); break;
      case 'newest': r.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); break;
      case 'rating': r.sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0)); break;
    }
    return r;
  }, [products, filters, sort]);

  const title = filters.category || (filters.query ? `"${filters.query}"` : 'Todos os produtos');
  const breadcrumb = filters.category ? ['Início', filters.category] : ['Início', 'Resultados'];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-200 px-4 md:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex items-center gap-1 text-xs text-zinc-500">
          <button onClick={onBack} className="hover:text-purple-600 font-medium">Início</button>
          {breadcrumb.slice(1).map((b, i) => (
            <React.Fragment key={i}>
              <span>›</span>
              <span className="text-zinc-700 font-medium">{b}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
        {/* Title + toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-500">
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-black text-zinc-900">{title}</h1>
            </div>
            <p className="text-xs text-zinc-500 ml-9 mt-0.5">{filtered.length} resultados</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <button onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 border border-zinc-300 px-3 py-2 rounded-lg text-sm font-bold text-zinc-700 bg-white">
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 bg-white outline-none focus:border-purple-500 cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Applied chips */}
        <AppliedFilters filters={filters} onChange={onChangeFilters} />

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-xl border border-zinc-200 sticky top-[130px] overflow-hidden">
              <FilterPanel filters={filters} onChange={onChangeFilters} resultCount={filtered.length} />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-400">
                <p className="text-lg font-bold mb-2">Nenhum produto encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou a pesquisa.</p>
                <button onClick={onBack} className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-purple-700">
                  Voltar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                    wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white z-[70] rounded-t-2xl flex flex-col overflow-hidden shadow-2xl">
            <FilterPanel filters={filters} onChange={onChangeFilters} resultCount={filtered.length} onClose={() => setShowMobileFilters(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListingView;
