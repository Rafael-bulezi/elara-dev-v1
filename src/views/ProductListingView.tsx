import React, { useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, X, ChevronDown, ChevronUp, Search, Check, LayoutGrid, List, ShoppingCart, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ProductCondition } from '../types';
import { DiscoveryFilters, SearchResult } from '../types/discovery';
import ProductCard from '../components/product/ProductCard';
import { searchProducts } from '../lib/searchService';

interface Props {
  products: Product[]; // Fallback list
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

  if (filters.minPrice) chips.push({ label: `Mín: ${filters.minPrice.toLocaleString('pt-AO')} Kz`, clear: () => onChange({ ...filters, minPrice: null, page: 1 }) });
  if (filters.maxPrice) chips.push({ label: `Máx: ${filters.maxPrice.toLocaleString('pt-AO')} Kz`, clear: () => onChange({ ...filters, maxPrice: null, page: 1 }) });
  if (filters.condition) chips.push({ label: filters.condition, clear: () => onChange({ ...filters, condition: null, page: 1 }) });
  if (filters.verified) chips.push({ label: 'Verificado', clear: () => onChange({ ...filters, verified: false, page: 1 }) });
  if (filters.localOnly) chips.push({ label: 'Local', clear: () => onChange({ ...filters, localOnly: false, page: 1 }) });
  if (filters.importOnly) chips.push({ label: 'Importado', clear: () => onChange({ ...filters, importOnly: false, page: 1 }) });
  if (filters.province) chips.push({ label: filters.province, clear: () => onChange({ ...filters, province: null, page: 1 }) });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <span key={i} className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {chip.label}
          <button onClick={chip.clear} className="ml-0.5 hover:text-purple-900"><X size={12} /></button>
        </span>
      ))}
      <button onClick={() => onChange({ ...filters, minPrice: null, maxPrice: null, condition: null, verified: false, localOnly: false, importOnly: false, province: null, page: 1 })}
        className="text-xs font-bold text-zinc-500 hover:text-rose-500 underline">
        Limpar tudo
      </button>
    </div>
  );
};

// Filter Panel
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
          <button onClick={() => onChange({ ...filters, minPrice: null, maxPrice: null, condition: null, verified: false, localOnly: false, importOnly: false, province: null, page: 1 })}
            className="text-xs font-bold text-purple-600 hover:underline">
            Limpar tudo
          </button>
          {onClose && <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4">
        {/* Location / Province */}
        <FilterSection title="Província / Localização" defaultOpen>
          <select
            value={filters.province || ''}
            onChange={(e) => onChange({ ...filters, province: e.target.value || null, page: 1 })}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-800 outline-none focus:border-purple-500"
          >
            <option value="">Todas as Províncias</option>
            {['Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Quando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'].map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </FilterSection>

        {/* Delivery */}
        <FilterSection title="Origem & Entrega" defaultOpen>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.localOnly ? 'bg-purple-600 border-purple-600' : 'border-zinc-300'}`}
                onClick={() => onChange({ ...filters, localOnly: !filters.localOnly, importOnly: false, page: 1 })}>
                {filters.localOnly && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Produtos Locais</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${filters.importOnly ? 'bg-purple-600 border-purple-600' : 'border-zinc-300'}`}
                onClick={() => onChange({ ...filters, importOnly: !filters.importOnly, localOnly: false, page: 1 })}>
                {filters.importOnly && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm text-zinc-700 group-hover:text-zinc-900">Produtos Importados</span>
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
                onBlur={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null, page: 1 })}
                className="w-full mt-1 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 bg-white outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Máx</label>
              <input ref={maxPriceRef} type="number" placeholder="2.000.000"
                defaultValue={filters.maxPrice ?? ''}
                onBlur={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null, page: 1 })}
                className="w-full mt-1 border border-zinc-300 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 bg-white outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {['Até 50k', '50k–200k', '200k–1M', 'Acima 1M'].map((r, i) => {
              const ranges = [[null, 50000], [50000, 200000], [200000, 1000000], [1000000, null]];
              const [min, max] = ranges[i];
              const active = filters.minPrice === min && filters.maxPrice === max;
              return (
                <button key={r}
                  onClick={() => onChange({ ...filters, minPrice: min as number | null, maxPrice: max as number | null, page: 1 })}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors font-semibold ${active ? 'bg-purple-600 border-purple-600 text-white' : 'border-zinc-300 text-zinc-600 hover:border-purple-500'}`}>
                  {r}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Marca" defaultOpen={false}>
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
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Condition */}
        <FilterSection title="Condição" defaultOpen={false}>
          <div className="flex gap-2 flex-wrap">
            {['Novo', 'Semi-novo', 'Usado'].map(c => (
              <button key={c} onClick={() => onChange({ ...filters, condition: filters.condition === c ? null : c as ProductCondition, page: 1 })}
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
              onClick={() => onChange({ ...filters, verified: !filters.verified, page: 1 })}>
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

/* ── Row / list-mode card ── */
const RowCard: React.FC<{
  product: Product;
  wishlisted: boolean;
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist?: (p: Product) => void;
}> = ({ product: p, wishlisted, onProductClick, onAddToCart, onToggleWishlist }) => {
  const disc = p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
  const rating = p.sellerRating || 4.5;
  return (
    <div
      className="flex gap-4 bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
      onClick={() => onProductClick(p)}>
      <div className="relative shrink-0 w-32 sm:w-40 aspect-square overflow-hidden bg-zinc-50">
        <img src={p.image} alt={p.title} loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
        {disc && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">-{disc}%</span>
        )}
      </div>

      <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-0.5">{p.category}</p>
          <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug mb-1">{p.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />)}
            <span className="text-[10px] text-zinc-400 ml-0.5">{Number(rating).toFixed(1)}</span>
            {p.verified && <span className="ml-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Verificado</span>}
          </div>
          <p className="text-[11px] text-zinc-400 hidden sm:block">Vendedor: {p.sellerName}</p>
        </div>

        <div className="flex items-end justify-between gap-2 mt-2">
          <div>
            <p className="text-lg font-black text-zinc-900">{p.price.toLocaleString('pt-AO')} <span className="text-sm font-bold text-zinc-500">Kz</span></p>
            {p.originalPrice && p.originalPrice > p.price && (
              <p className="text-xs text-zinc-400 line-through">{p.originalPrice.toLocaleString('pt-AO')} Kz</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(p); }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${wishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-rose-400'}`}>
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(p); }}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              <ShoppingCart size={13} /> Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Return to top ── */
const ReturnToTop: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 md:bottom-8 right-4 z-40 bg-white border border-zinc-200 shadow-lg rounded-full px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-1.5">
      ↑ Topo
    </button>
  );
};

const ProductListingView: React.FC<Props> = ({
  products: initialFallbackProducts, filters, onChangeFilters, onBack,
  onProductClick, onAddToCart,
  wishlist = [], onToggleWishlist,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchResult, setSearchResult] = useState<SearchResult>({
    products: initialFallbackProducts,
    totalCount: initialFallbackProducts.length,
    page: filters.page || 1,
    totalPages: 1,
    isLoading: true,
  });

  // Asynchronously execute server-side search via RPC whenever filters change
  useEffect(() => {
    let isMounted = true;
    setSearchResult(prev => ({ ...prev, isLoading: true }));

    searchProducts(filters).then(res => {
      if (isMounted) {
        setSearchResult(res);
      }
    });

    return () => { isMounted = false; };
  }, [filters]);

  const title = filters.category || (filters.query ? `"${filters.query}"` : 'Todos os produtos');
  const breadcrumb = filters.category ? ['Início', filters.category] : ['Início', 'Resultados'];

  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
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
            <p className="text-xs text-zinc-500 ml-9 mt-0.5">
              {searchResult.isLoading ? 'Buscando produtos...' : `${searchResult.totalCount} resultados encontrados`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter button */}
            <button onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 border border-zinc-300 px-3 py-2 rounded-lg text-sm font-bold text-zinc-700 bg-white">
              <SlidersHorizontal size={16} />
              Filtros
            </button>

            {/* Sort */}
            <select
              value={filters.sort || 'relevance'}
              onChange={e => onChangeFilters({ ...filters, sort: e.target.value as any, page: 1 })}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 bg-white outline-none focus:border-purple-500 cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle — grid / list */}
            <div className="hidden sm:flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                title="Grelha">
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                title="Lista">
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Applied chips */}
        <AppliedFilters filters={filters} onChange={onChangeFilters} />

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div
              className="bg-white rounded-xl border border-zinc-200 sticky top-[130px] overflow-hidden flex flex-col"
              style={{ maxHeight: 'calc(100vh - 150px)' }}>
              <FilterPanel filters={filters} onChange={onChangeFilters} resultCount={searchResult.totalCount} />
            </div>
          </aside>

          {/* Product grid / list */}
          <div className="flex-1 min-w-0">
            {searchResult.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-zinc-200 h-64 animate-pulse p-3 flex flex-col justify-between">
                    <div className="bg-zinc-200 rounded-lg h-36 w-full" />
                    <div className="space-y-2">
                      <div className="bg-zinc-200 h-4 rounded w-3/4" />
                      <div className="bg-zinc-200 h-5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResult.products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 p-8">
                <p className="text-lg font-black text-zinc-900 mb-1">Nenhum produto encontrado</p>
                <p className="text-sm text-zinc-500 mb-6">Tente ajustar a sua pesquisa ou remover alguns filtros.</p>
                <button
                  onClick={() => onChangeFilters({ query: '', category: null, minPrice: null, maxPrice: null, condition: null, verified: false, localOnly: false, importOnly: false, province: null, sort: 'relevance', page: 1, perPage: 24 })}
                  className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {searchResult.products.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onProductClick={onProductClick}
                    wishlisted={wishlist.includes(p.id)} onToggleWishlist={onToggleWishlist} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResult.products.map(p => (
                  <RowCard key={p.id} product={p}
                    wishlisted={wishlist.includes(p.id)}
                    onProductClick={onProductClick}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {searchResult.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-zinc-200">
                <button
                  disabled={searchResult.page <= 1}
                  onClick={() => {
                    onChangeFilters({ ...filters, page: searchResult.page - 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} /> Anterior
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: searchResult.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === searchResult.totalPages || Math.abs(p - searchResult.page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-zinc-400 text-xs px-1">...</span>}
                        <button
                          onClick={() => {
                            onChangeFilters({ ...filters, page: p });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${
                            searchResult.page === p
                              ? 'bg-purple-600 text-white'
                              : 'bg-white border border-zinc-200 text-zinc-700 hover:border-purple-300'
                          }`}>
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  disabled={searchResult.page >= searchResult.totalPages}
                  onClick={() => {
                    onChangeFilters({ ...filters, page: searchResult.page + 1 });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Próxima <ChevronRight size={16} />
                </button>
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
            <FilterPanel filters={filters} onChange={onChangeFilters} resultCount={searchResult.totalCount} onClose={() => setShowMobileFilters(false)} />
          </div>
        </>
      )}

      <ReturnToTop />
    </div>
  );
};

export default ProductListingView;
