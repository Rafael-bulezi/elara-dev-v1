-- Elara: add seller-profile columns to profiles + update role constraint
-- Run this in Supabase SQL Editor after 001 and 002.

-- ============================================================
-- Add seller fields directly to profiles
-- (app reads profiles with a left-join on seller_profiles,
--  but also falls back to flat columns for simpler setups)
-- ============================================================
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS seller_status       TEXT DEFAULT 'none'
        CHECK (seller_status IN ('none', 'pending', 'active', 'suspended', 'rejected')),
    ADD COLUMN IF NOT EXISTS shop_name           TEXT,
    ADD COLUMN IF NOT EXISTS verification_level  TEXT DEFAULT 'none'
        CHECK (verification_level IN ('none', 'basic', 'verified', 'premium')),
    ADD COLUMN IF NOT EXISTS id_document_url     TEXT,
    ADD COLUMN IF NOT EXISTS bank_details        TEXT,
    ADD COLUMN IF NOT EXISTS mixeiro_status      TEXT DEFAULT 'none'
        CHECK (mixeiro_status IN ('none', 'applied', 'active', 'rejected')),
    ADD COLUMN IF NOT EXISTS mixeiro_verified    BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS legal_name          TEXT;

-- ============================================================
-- Drop the old role constraint and replace it (removes 'intermediary')
-- ============================================================
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('buyer', 'seller', 'admin'));

-- Migrate any stale intermediary rows to buyer
UPDATE public.profiles SET role = 'buyer' WHERE role = 'intermediary';

-- ============================================================
-- seller_profiles join table (optional — app falls back to profiles columns)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seller_profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_name        TEXT,
    legal_name       TEXT,
    bank_details     TEXT,
    id_document_url  TEXT,
    address          TEXT,
    seller_status    TEXT DEFAULT 'pending'
        CHECK (seller_status IN ('pending', 'active', 'suspended', 'rejected')),
    verification_level TEXT DEFAULT 'basic'
        CHECK (verification_level IN ('basic', 'verified', 'premium')),
    mixeiro_status   TEXT DEFAULT 'none'
        CHECK (mixeiro_status IN ('none', 'applied', 'active', 'rejected')),
    mixeiro_verified BOOLEAN DEFAULT false,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can read own seller profile" ON public.seller_profiles;
CREATE POLICY "Sellers can read own seller profile" ON public.seller_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers can update own seller profile" ON public.seller_profiles;
CREATE POLICY "Sellers can update own seller profile" ON public.seller_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers can insert own seller profile" ON public.seller_profiles;
CREATE POLICY "Sellers can insert own seller profile" ON public.seller_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all seller profiles" ON public.seller_profiles;
CREATE POLICY "Admins can manage all seller profiles" ON public.seller_profiles
    FOR ALL USING (public.is_admin());

-- Grants
GRANT ALL ON public.seller_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.seller_profiles TO authenticated;
