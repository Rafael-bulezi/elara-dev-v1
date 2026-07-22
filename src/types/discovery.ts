import { Product, ProductCondition } from './index';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'promo' | 'rating';

export interface DiscoveryFilters {
  query: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: ProductCondition | null;
  verified: boolean;
  localOnly: boolean;
  importOnly: boolean;
  province: string | null;
  sort: SortOption;
  page: number;
  perPage: number;
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error?: string | null;
}

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Mais Relevantes',
  'price-asc': 'Menor Preço',
  'price-desc': 'Maior Preço',
  newest: 'Mais Recentes',
  promo: 'Melhores Promoções',
  rating: 'Melhor Avaliados'
};

export const ANGOLA_PROVINCES = [
  'Luanda',
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire'
] as const;
