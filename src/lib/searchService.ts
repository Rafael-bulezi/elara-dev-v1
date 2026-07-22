import { supabase } from './supabase';
import { Product } from '../types';
import { DiscoveryFilters, SearchResult } from '../types/discovery';
import { initialProducts } from '../constants';

export async function searchProducts(filters: DiscoveryFilters): Promise<SearchResult> {
  const page = Math.max(1, filters.page || 1);
  const perPage = filters.perPage || 24;

  try {
    const { data, error } = await supabase.rpc('search_products', {
      p_query: filters.query.trim() || null,
      p_category: filters.category || null,
      p_min_price: filters.minPrice || null,
      p_max_price: filters.maxPrice || null,
      p_condition: filters.condition || null,
      p_verified: filters.verified || false,
      p_local_only: filters.localOnly || false,
      p_import_only: filters.importOnly || false,
      p_province: filters.province || null,
      p_sort: filters.sort || 'relevance',
      p_page: page,
      p_per_page: perPage
    });

    if (error) {
      console.warn('[searchService] Supabase RPC fallback active:', error.message);
      return fallbackClientSearch(filters, initialProducts);
    }

    if (!data || data.length === 0) {
      // If DB has no products matching, check fallback if DB is empty
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      if (count === 0) {
        return fallbackClientSearch(filters, initialProducts);
      }
      return {
        products: [],
        totalCount: 0,
        page,
        totalPages: 0,
        isLoading: false,
      };
    }

    const totalCount = Number(data[0]?.total_count || data.length);
    const totalPages = Math.ceil(totalCount / perPage);

    // Map DB columns to Product interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: Product[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      image: row.image_url || (row.images && row.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      category: row.category || 'Geral',
      sellerId: row.seller_id,
      sellerName: row.seller_name || 'Vendedor Elara',
      sellerAvatar: row.seller_avatar || '',
      sellerPhone: row.seller_phone || '',
      sellerRating: Number(row.seller_rating || 4.8),
      condition: row.condition || 'Novo',
      isImport: Boolean(row.is_import),
      emPromocao: Boolean(row.em_promocao),
      stock: row.stock ?? 1,
      verified: Boolean(row.verified),
      productRating: row.product_rating ? Number(row.product_rating) : undefined,
      productReviews: row.product_reviews ? Number(row.product_reviews) : undefined,
      origin: row.origin || 'Local',
      createdAt: row.created_at || new Date().toISOString(),
    }));

    return {
      products,
      totalCount,
      page,
      totalPages,
      isLoading: false,
    };
  } catch (err) {
    console.error('[searchService] Exception caught during search:', err);
    return fallbackClientSearch(filters, initialProducts);
  }
}

/**
 * Fallback client-side search for offline development or initial seed testing
 */
function fallbackClientSearch(filters: DiscoveryFilters, allProducts: Product[]): SearchResult {
  let result = [...allProducts];

  // 1. Text Query Filter
  if (filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // 2. Category Filter
  if (filters.category) {
    result = result.filter(p => p.category === filters.category);
  }

  // 3. Price Filter
  if (filters.minPrice !== null) {
    result = result.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== null) {
    result = result.filter(p => p.price <= filters.maxPrice!);
  }

  // 4. Condition Filter
  if (filters.condition) {
    result = result.filter(p => p.condition === filters.condition);
  }

  // 5. Verified Seller
  if (filters.verified) {
    result = result.filter(p => p.verified);
  }

  // 6. Origin
  if (filters.localOnly) {
    result = result.filter(p => !p.isImport);
  }
  if (filters.importOnly) {
    result = result.filter(p => p.isImport);
  }

  // 7. Sort
  switch (filters.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      break;
    case 'promo':
      result.sort((a, b) => (b.emPromocao ? 1 : 0) - (a.emPromocao ? 1 : 0));
      break;
    case 'rating':
      result.sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0));
      break;
    default:
      break;
  }

  const totalCount = result.length;
  const page = Math.max(1, filters.page || 1);
  const perPage = filters.perPage || 24;
  const totalPages = Math.ceil(totalCount / perPage);
  const startIndex = (page - 1) * perPage;
  const paginatedProducts = result.slice(startIndex, startIndex + perPage);

  return {
    products: paginatedProducts,
    totalCount,
    page,
    totalPages,
    isLoading: false,
  };
}
