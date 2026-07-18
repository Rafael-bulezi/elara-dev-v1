import { ProductCondition } from './index';

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
  sort: SortOption;
}

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Mais Relevantes',
  'price-asc': 'Menor Preço',
  'price-desc': 'Maior Preço',
  newest: 'Mais Recentes',
  promo: 'Melhores Promoções',
  rating: 'Melhor Avaliados'
};
