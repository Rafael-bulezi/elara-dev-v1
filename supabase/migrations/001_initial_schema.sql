-- Elara Supabase initial schema
-- Run this via Supabase SQL Editor or with a Postgres connection.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin', 'intermediary')),
    address TEXT,
    bio TEXT,
    rating NUMERIC(3,2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        avatar_url = EXCLUDED.avatar_url,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    original_price NUMERIC(12,2),
    image_url TEXT,
    images TEXT[],
    condition TEXT NOT NULL DEFAULT 'Novo' CHECK (condition IN ('Novo', 'Semi-novo', 'Usado')),
    category TEXT,
    category_id UUID REFERENCES public.categories(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_name TEXT,
    seller_avatar TEXT,
    seller_phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_import BOOLEAN DEFAULT false,
    em_promocao BOOLEAN DEFAULT false,
    stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
    verified BOOLEAN DEFAULT false,
    product_rating NUMERIC(3,2) DEFAULT 5.0 CHECK (product_rating >= 0 AND product_rating <= 5),
    product_reviews INTEGER DEFAULT 0,
    origin TEXT DEFAULT 'Local' CHECK (origin IN ('China', 'Europa', 'Local')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ORDERS & ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL,
    seller_id UUID,
    total NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'shipped', 'received')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verifying', 'verified', 'rejected')),
    payment_method TEXT,
    payment_receipt TEXT,
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    seller_id UUID REFERENCES public.profiles(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- CART (authenticated users only; guests keep localStorage)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

CREATE TRIGGER set_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- ============================================================
-- CHATS & MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants UUID[] NOT NULL,
    participant_names JSONB DEFAULT '{}',
    participant_avatars JSONB DEFAULT '{}',
    unread_count JSONB DEFAULT '{}',
    product_id UUID REFERENCES public.products(id),
    product_name TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    last_sender_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- IMPORT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.import_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id),
    product_name TEXT NOT NULL,
    product_url TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    description TEXT,
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_import_requests_updated_at
BEFORE UPDATE ON public.import_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ADMIN FLAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_flags ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Helper function: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_flags
        WHERE user_id = auth.uid() AND is_super_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products
DROP POLICY IF EXISTS "Approved products are viewable by everyone" ON public.products;
CREATE POLICY "Approved products are viewable by everyone" ON public.products FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id);
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Sellers and admins can update orders" ON public.orders;
CREATE POLICY "Sellers and admins can update orders" ON public.orders FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin());

-- Order items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid() OR public.is_admin())
    )
);
DROP POLICY IF EXISTS "Buyers can create order items" ON public.order_items;
CREATE POLICY "Buyers can create order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_id AND orders.buyer_id = auth.uid()
    )
);

-- Cart items
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own cart" ON public.cart_items;
CREATE POLICY "Users can insert own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own cart" ON public.cart_items;
CREATE POLICY "Users can delete own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can view own wishlist" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can insert own wishlist" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own wishlist" ON public.wishlist_items;
CREATE POLICY "Users can delete own wishlist" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- Chats
DROP POLICY IF EXISTS "Participants can view chats" ON public.chats;
CREATE POLICY "Participants can view chats" ON public.chats FOR SELECT USING (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Participants can create chats" ON public.chats;
CREATE POLICY "Participants can create chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Participants can update chats" ON public.chats;
CREATE POLICY "Participants can update chats" ON public.chats FOR UPDATE USING (auth.uid() = ANY(participants));

-- Messages
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
    auth.uid() = ANY(ARRAY(SELECT participants FROM public.chats WHERE id = chat_id))
);
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = ANY(ARRAY(SELECT participants FROM public.chats WHERE id = chat_id))
);

-- Import requests
DROP POLICY IF EXISTS "Users can view own import requests" ON public.import_requests;
CREATE POLICY "Users can view own import requests" ON public.import_requests FOR SELECT USING (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Admins and intermediaries can view all import requests" ON public.import_requests;
CREATE POLICY "Admins and intermediaries can view all import requests" ON public.import_requests FOR SELECT USING (
    public.is_admin() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'intermediary')
);
DROP POLICY IF EXISTS "Users can create import requests" ON public.import_requests;
CREATE POLICY "Users can create import requests" ON public.import_requests FOR INSERT WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL);

-- Reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Admin flags
DROP POLICY IF EXISTS "Admins can manage admin flags" ON public.admin_flags;
CREATE POLICY "Admins can manage admin flags" ON public.admin_flags FOR ALL USING (public.is_admin());

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
INSERT INTO public.categories (name, slug, sort_order)
VALUES
    ('Smartphones', 'smartphones', 1),
    ('Moda', 'moda', 2),
    ('Eletrónicos', 'eletronicos', 3),
    ('Computadores', 'computadores', 4),
    ('Casa', 'casa', 5),
    ('Beleza', 'beleza', 6),
    ('Esportes', 'esportes', 7),
    ('Veículos', 'veiculos', 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- GRANTS (ensure service_role can manage everything)
-- ============================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
