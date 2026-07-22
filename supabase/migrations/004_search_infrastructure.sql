-- ============================================================
-- ELARA SEARCH INFRASTRUCTURE & SCALABILITY MIGRATION (004)
-- Enables Full-Text Search (tsvector), GIN Indexes, B-tree Indexes,
-- Auto-update Triggers, and High-Performance search_products RPC.
-- ============================================================

-- 1. ADD SEARCH & LOCATION COLUMNS TO PRODUCTS
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS tags           TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS province       TEXT DEFAULT 'Luanda',
    ADD COLUMN IF NOT EXISTS search_vector  TSVECTOR;

-- 2. AUTOMATIC SEARCH VECTOR TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.category, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search_vector ON public.products;
CREATE TRIGGER trg_products_search_vector
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_search_vector_update();

-- 3. HIGH-PERFORMANCE INDEXES
-- GIN Index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING GIN (search_vector);

-- B-Tree Indexes for fast WHERE filtering and ORDER BY sorting
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_province ON public.products (province);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products (condition);
CREATE INDEX IF NOT EXISTS idx_products_is_import ON public.products (is_import);
CREATE INDEX IF NOT EXISTS idx_products_verified ON public.products (verified);
CREATE INDEX IF NOT EXISTS idx_products_em_promocao ON public.products (em_promocao);
CREATE INDEX IF NOT EXISTS idx_products_status_created ON public.products (status, created_at DESC);

-- 4. BACKFILL SEARCH VECTOR FOR EXISTING PRODUCTS
UPDATE public.products
SET search_vector =
    setweight(to_tsvector('portuguese', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(category, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(array_to_string(tags, ' '), '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(description, '')), 'C')
WHERE search_vector IS NULL;

-- 5. SEARCH RPC FUNCTION (Full-text search, filter, sort, pagination)
CREATE OR REPLACE FUNCTION public.search_products(
    p_query        TEXT    DEFAULT NULL,
    p_category     TEXT    DEFAULT NULL,
    p_min_price    NUMERIC DEFAULT NULL,
    p_max_price    NUMERIC DEFAULT NULL,
    p_condition    TEXT    DEFAULT NULL,
    p_verified     BOOLEAN DEFAULT NULL,
    p_local_only   BOOLEAN DEFAULT FALSE,
    p_import_only  BOOLEAN DEFAULT FALSE,
    p_province     TEXT    DEFAULT NULL,
    p_sort         TEXT    DEFAULT 'relevance',
    p_page         INT     DEFAULT 1,
    p_per_page     INT     DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC,
    original_price NUMERIC,
    image_url TEXT,
    images TEXT[],
    condition TEXT,
    category TEXT,
    category_id UUID,
    seller_id UUID,
    seller_name TEXT,
    seller_avatar TEXT,
    seller_phone TEXT,
    status TEXT,
    is_import BOOLEAN,
    em_promocao BOOLEAN,
    stock INT,
    verified BOOLEAN,
    product_rating NUMERIC,
    product_reviews INT,
    origin TEXT,
    province TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INT := (GREATEST(p_page, 1) - 1) * p_per_page;
    v_tsquery TSQUERY;
BEGIN
    IF p_query IS NOT NULL AND TRIM(p_query) <> '' THEN
        v_tsquery := websearch_to_tsquery('portuguese', p_query);
    END IF;

    RETURN QUERY
    WITH filtered AS (
        SELECT
            p.*,
            CASE
                WHEN v_tsquery IS NOT NULL THEN ts_rank_cd(p.search_vector, v_tsquery, 32)
                ELSE 0::REAL
            END AS rank,
            COUNT(*) OVER() AS total_count
        FROM public.products p
        WHERE p.status = 'approved'
          AND (v_tsquery IS NULL OR p.search_vector @@ v_tsquery OR p.title ILIKE '%' || p_query || '%')
          AND (p_category IS NULL OR p_category = '' OR p.category = p_category)
          AND (p_min_price IS NULL OR p.price >= p_min_price)
          AND (p_max_price IS NULL OR p.price <= p_max_price)
          AND (p_condition IS NULL OR p_condition = '' OR p.condition = p_condition)
          AND (p_verified IS NULL OR p_verified = FALSE OR p.verified = TRUE)
          AND (p_local_only = FALSE OR p.is_import = FALSE)
          AND (p_import_only = FALSE OR p.is_import = TRUE)
          AND (p_province IS NULL OR p_province = '' OR p.province = p_province)
    )
    SELECT
        f.id, f.title, f.description, f.price, f.original_price,
        f.image_url, f.images, f.condition, f.category, f.category_id,
        f.seller_id, f.seller_name, f.seller_avatar, f.seller_phone,
        f.status, f.is_import, f.em_promocao, f.stock, f.verified,
        f.product_rating, f.product_reviews, f.origin, f.province,
        f.tags, f.created_at, f.updated_at,
        f.rank, f.total_count
    FROM filtered f
    ORDER BY
        CASE WHEN p_sort = 'relevance' AND v_tsquery IS NOT NULL THEN f.rank END DESC NULLS LAST,
        CASE WHEN p_sort = 'relevance' AND v_tsquery IS NULL THEN f.created_at END DESC NULLS LAST,
        CASE WHEN p_sort = 'price_asc' OR p_sort = 'price-asc' THEN f.price END ASC NULLS LAST,
        CASE WHEN p_sort = 'price_desc' OR p_sort = 'price-desc' THEN f.price END DESC NULLS LAST,
        CASE WHEN p_sort = 'newest' THEN f.created_at END DESC NULLS LAST,
        CASE WHEN p_sort = 'promo' THEN f.em_promocao END DESC NULLS LAST,
        CASE WHEN p_sort = 'rating' THEN f.product_rating END DESC NULLS LAST,
        f.created_at DESC
    LIMIT p_per_page
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. PERMISSIONS
GRANT EXECUTE ON FUNCTION public.search_products TO anon;
GRANT EXECUTE ON FUNCTION public.search_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_products TO service_role;
