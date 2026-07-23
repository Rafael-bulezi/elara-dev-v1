-- ============================================================
-- ELARA AUTH & PROFILE FIXES (005)
-- Fixes the auth flow: allows new users to insert their own profile
-- and ensures the profile trigger works for all providers.
-- ============================================================

-- 1. Allow authenticated users to INSERT their own profile
--    (needed when the trigger fires and the app also tries to create/upsert)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Allow service_role to insert profiles (needed for the trigger to work)
--    The handle_new_user trigger runs as SECURITY DEFINER so this is already
--    covered, but being explicit prevents edge cases.
GRANT INSERT ON public.profiles TO service_role;
GRANT INSERT ON public.profiles TO authenticated;

-- 3. Fix the handle_new_user trigger to handle duplicate key gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Usuário'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        email     = COALESCE(EXCLUDED.email, public.profiles.email),
        phone     = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
        role      = CASE 
                      WHEN public.profiles.role = 'buyer' THEN COALESCE(EXCLUDED.role, 'buyer')
                      ELSE public.profiles.role  -- never downgrade admins/sellers
                    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Also fire on Google OAuth (UPDATE to auth.users when email confirmed)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.handle_new_user();

-- 5. Allow admins to read ALL profiles (needed for AdminView)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin() OR true);  -- public.profiles already readable by everyone per policy 001

-- 6. Allow admins to update ALL profiles (needed for role management)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

-- 7. Fix admin_flags RLS so the admin bootstrap works
--    First admin needs to insert into admin_flags without already being admin
DROP POLICY IF EXISTS "Service role can manage admin flags" ON public.admin_flags;
CREATE POLICY "Service role can manage admin flags" ON public.admin_flags
    FOR ALL USING (true) WITH CHECK (true);

-- 8. Ensure anon users can read approved products (for the homepage)
DROP POLICY IF EXISTS "Approved products are viewable by everyone" ON public.products;
CREATE POLICY "Approved products are viewable by everyone" ON public.products
    FOR SELECT USING (status = 'approved' OR auth.uid() = seller_id OR public.is_admin());

-- 9. Admin can read ALL products (pending, rejected, etc.)
DROP POLICY IF EXISTS "Admins can read all products" ON public.products;
CREATE POLICY "Admins can read all products" ON public.products
    FOR SELECT USING (public.is_admin());

-- 10. Grant anon and authenticated users to read profiles
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;

-- 11. Ensure search RPC is accessible to anon (for product browsing without login)
GRANT EXECUTE ON FUNCTION public.search_products TO anon;

-- ============================================================
-- BOOTSTRAP: Set 7dark7cloud7@gmail.com as super admin
-- Run this AFTER the user has signed up at least once.
-- This is idempotent — safe to run multiple times.
-- ============================================================
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM public.profiles WHERE email = '7dark7cloud7@gmail.com';
    
    IF v_admin_id IS NOT NULL THEN
        -- Update role to admin
        UPDATE public.profiles SET role = 'admin' WHERE id = v_admin_id;
        
        -- Insert admin flag
        INSERT INTO public.admin_flags (user_id, is_super_admin)
        VALUES (v_admin_id, true)
        ON CONFLICT (user_id) DO UPDATE SET is_super_admin = true;
        
        RAISE NOTICE 'Admin bootstrapped: %', v_admin_id;
    ELSE
        RAISE NOTICE 'Admin user not found — sign up first with 7dark7cloud7@gmail.com, then re-run this migration.';
    END IF;
END;
$$;
