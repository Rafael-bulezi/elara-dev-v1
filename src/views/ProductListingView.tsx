import React from 'react';
import { ArrowLeft, SlidersHorizontal, SearchX } from 'lucide-react';
import { Product } from '../types';
import { DiscoveryFilters } from '../types/discovery';
import ProductCard from '../components/product/ProductCard';
import FiltersPanel from '../components/discovery/FiltersPanel';
import SortSelect from '../components/discovery/SortSelect';
import FilterChip from '../components/discovery/FilterChip';

interface ProductListingViewProps {
  products: Product[];
  filters: DiscoveryFilters;
  onChangeFilters: (filters: DiscoveryFilters) => void;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductListingView = ({
  products,
  filters,
  onChangeFilters,
  onBack,
  onProductClick,
  onAddToCart
}: ProductListingViewProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const q = filters.query.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q);
      const matchesCategory = !filters.category || p.category === filters.category;
      const matchesMinPrice = filters.minPrice === null || p.price >= filters.minPrice;
      const matchesMaxPrice = filters.maxPrice === null || p.price <= filters.maxPrice;
      const matchesCondition = !filters.condition || p.condition === filters.condition;
      const matchesVerified = !filters.verified || p.verified;
      const matchesLocal = !filters.localOnly || !p.isImport;
      const matchesImport = !filters.importOnly || p.isImport;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesCondition &&
        matchesVerified &&
        matchesLocal &&
        matchesImport
      );
    }).sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return b.createdAt - a.createdAt;
        case 'promo': return (b.emPromocao ? 1 : 0) - (a.emPromocao ? 1 : 0);
        case 'rating': return (b.productRating || 0) - (a.productRating || 0);
        default: return 0;
      }
    });
  }, [products, filters]);

  const maxPrice = React.useMemo(() => {
    return products.length > 0 ? Math.max(...products.map((p) => p.price)) : 1000000;
  }, [products]);

  const activeChips = React.useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (filters.minPrice !== null) {
      chips.push({ label: `Min: Kz ${filters.minPrice.toLocaleString('pt-AO')}`, onRemove: () => onChangeFilters({ ...filters, minPrice: null }) });
    }
    if (filters.maxPrice !== null) {
      chips.push({ label: `Max: Kz ${filters.maxPrice.toLocaleString('pt-AO')}`, onRemove: () => onChangeFilters({ ...filters, maxPrice: null }) });
    }
    if (filters.condition) {
      chips.push({ label: filters.condition, onRemove: () => onChangeFilters({ ...filters, condition: null }) });
    }
    if (filters.verified) {
      chips.push({ label: 'Verificado', onRemove: () => onChangeFilters({ ...filters, verified: false }) });
    }
    if (filters.localOnly) {
      chips.push({ label: 'Local', onRemove: () => onChangeFilters({ ...filters, localOnly: false }) });
    }
    if (filters.importOnly) {
      chips.push({ label: 'Importado', onRemove: () => onChangeFilters({ ...filters, importOnly: false }) });
    }
    return chips;
  }, [filters, onChangeFilters]);

  const title = filters.query
    ? `Resultados para "${filters.query}"`
    : filters.category || 'Todos os Produtos';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-700 dark:text-zinc-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-black text-zinc-900 dark:text-white truncate">{title}</h1>
            <p className="text-xs md:text-sm font-bold text-zinc-500 mt-0.5">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-72 shrink-0">
            <FiltersPanel
              filters={filters}
              onChange={onChangeFilters}
              maxPrice={maxPrice}
            />
          </aside>

          <div className="flex-1">
            <div className="sticky top-14 z-30 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md py-3 mb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:backdrop-blur-none">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  Filtros
                </button>
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) => onChangeFilters({ ...filters, sort })}
                />
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeChips.map((chip, i) => (
                    <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
                  ))}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <SearchX size={40} className="text-zinc-400" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto font-medium">
                  Tente ajustar os filtros ou a pesquisa para encontrar o que procura.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={onAddToCart}
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <FiltersPanel
          filters={filters}
          onChange={onChangeFilters}
          isMobile
          onClose={() => setMobileFiltersOpen(false)}
          maxPrice={maxPrice}
        />
      )}
    </div>
  );
};

export default ProductListingView;
