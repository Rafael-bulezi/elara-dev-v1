-- Elara schema refinements: guest checkout, storage, chat helpers

-- ============================================================
-- ORDERS: support guest checkout and align with app fields
-- ============================================================
ALTER TABLE public.orders
    ALTER COLUMN buyer_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS buyer_name TEXT,
    ADD COLUMN IF NOT EXISTS buyer_phone TEXT,
    ADD COLUMN IF NOT EXISTS delivery_option TEXT;

-- order_items: allow nulls for deleted products/users
ALTER TABLE public.order_items
    ALTER COLUMN product_id DROP NOT NULL,
    ALTER COLUMN seller_id DROP NOT NULL;

-- RLS policy for guest checkout (buyer_id IS NULL) and authenticated buyers
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders
    FOR INSERT
    WITH CHECK (
        buyer_id IS NULL
        OR auth.uid() = buyer_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    USING (
        auth.uid() = buyer_id
        OR auth.uid() = seller_id
        OR public.is_admin()
        OR (buyer_id IS NULL AND payment_method = 'cod' AND created_at > now() - interval '7 days')
    );

-- ============================================================
-- STORAGE: images bucket for avatars and product photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, false, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DROP POLICY IF EXISTS "Allow public reads on images" ON storage.objects;
CREATE POLICY "Allow public reads on images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Allow authenticated uploads on images" ON storage.objects;
CREATE POLICY "Allow authenticated uploads on images" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'images'
        AND auth.role() = 'authenticated'
        AND (storage.extension(name) = 'png' OR storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'webp')
    );

DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
CREATE POLICY "Allow users to update their own images" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'images'
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;
CREATE POLICY "Allow users to delete their own images" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'images'
        AND auth.uid() = owner
    );

-- ============================================================
-- HELPER: create a chat between two users atomically
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_or_get_chat(
    p_user_id UUID,
    p_other_user_id UUID,
    p_product_id UUID DEFAULT NULL,
    p_product_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_chat_id UUID;
BEGIN
    -- Check existing chat
    SELECT c.id INTO v_chat_id
    FROM public.chats c
    WHERE p_user_id = ANY(c.participants)
      AND p_other_user_id = ANY(c.participants)
      AND (p_product_id IS NULL OR c.product_id = p_product_id)
    LIMIT 1;

    IF v_chat_id IS NOT NULL THEN
        RETURN v_chat_id;
    END IF;

    INSERT INTO public.chats (participants, product_id, product_name)
    VALUES (
        ARRAY[p_user_id, p_other_user_id],
        p_product_id,
        p_product_name
    )
    RETURNING id INTO v_chat_id;

    RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_or_get_chat(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_or_get_chat(UUID, UUID, UUID, TEXT) TO service_role;
