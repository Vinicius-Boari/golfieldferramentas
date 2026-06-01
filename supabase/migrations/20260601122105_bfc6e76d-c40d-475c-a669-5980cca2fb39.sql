-- 1. Create a private schema for security functions
CREATE SCHEMA IF NOT EXISTS auth_utils;

-- 2. Create the functions in the new schema
CREATE OR REPLACE FUNCTION auth_utils.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION auth_utils.is_owner(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = 'owner'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION auth_utils.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, cnpj, inscricao_estadual, razao_social, nome_fantasia, segmento, nome_responsavel, cargo, email, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'inscricao_estadual', ''),
    COALESCE(NEW.raw_user_meta_data->>'razao_social', ''),
    COALESCE(NEW.raw_user_meta_data->>'nome_fantasia', ''),
    COALESCE(NEW.raw_user_meta_data->>'segmento', ''),
    COALESCE(NEW.raw_user_meta_data->>'nome_responsavel', ''),
    COALESCE(NEW.raw_user_meta_data->>'cargo', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefone', '')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION auth_utils.protect_owner_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.role::text = 'owner') THEN
    IF NOT (SELECT auth_utils.is_owner(auth.uid())) THEN
      RAISE EXCEPTION 'Only the owner can assign the owner role';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Update the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth_utils.handle_new_user();

-- 4. Update the trigger on public.user_roles
DROP TRIGGER IF EXISTS ensure_owner_privilege ON public.user_roles;
CREATE TRIGGER ensure_owner_privilege
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION auth_utils.protect_owner_role();

-- 5. Update RLS Policies
-- First drop all of them
DROP POLICY IF EXISTS "Admins and owners can delete home config" ON public.home_config;
DROP POLICY IF EXISTS "Admins and owners can insert home config" ON public.home_config;
DROP POLICY IF EXISTS "Admins and owners can update home config" ON public.home_config;
DROP POLICY IF EXISTS "Admins and owners can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins and owners can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and owners can insert coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins and owners can update coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins and owners can delete coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins and owners can read all usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "Admins can insert visual overrides" ON public.visual_overrides;
DROP POLICY IF EXISTS "Admins can update visual overrides" ON public.visual_overrides;
DROP POLICY IF EXISTS "Admins can delete visual overrides" ON public.visual_overrides;
DROP POLICY IF EXISTS "Admins and owners can view all ai usage" ON public.ai_usage_log;
DROP POLICY IF EXISTS "Admins and owners can read ai settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Admins and owners can update ai settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Admins and owners can insert splash config" ON public.splash_config;
DROP POLICY IF EXISTS "Admins and owners can update splash config" ON public.splash_config;
DROP POLICY IF EXISTS "Admins and owners can delete splash config" ON public.splash_config;
DROP POLICY IF EXISTS "Admins and owners can insert assistant config" ON public.assistant_config;
DROP POLICY IF EXISTS "Admins and owners can update assistant config" ON public.assistant_config;
DROP POLICY IF EXISTS "Admins and owners can delete assistant config" ON public.assistant_config;

-- Storage drops
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can upload hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can update hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can delete hero videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload maintenance images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update maintenance images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete maintenance images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can delete product images" ON storage.objects;

-- Now recreate them
CREATE POLICY "Admins and owners can delete home config" ON public.home_config FOR DELETE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can insert home config" ON public.home_config FOR INSERT TO authenticated WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can update home config" ON public.home_config FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can manage products" ON public.products FOR ALL TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())) WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can manage roles" ON public.user_roles FOR ALL TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())) WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can insert coupons" ON public.coupons FOR INSERT TO authenticated WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can update coupons" ON public.coupons FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())) WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can delete coupons" ON public.coupons FOR DELETE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can read all usage" ON public.coupon_usage FOR SELECT TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()) OR (auth.uid() = user_id));
CREATE POLICY "Admins can insert visual overrides" ON public.visual_overrides FOR INSERT TO authenticated WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.has_role(auth.uid(), 'owner'::public.app_role));
CREATE POLICY "Admins can update visual overrides" ON public.visual_overrides FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.has_role(auth.uid(), 'owner'::public.app_role));
CREATE POLICY "Admins can delete visual overrides" ON public.visual_overrides FOR DELETE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.has_role(auth.uid(), 'owner'::public.app_role));
CREATE POLICY "Admins and owners can view all ai usage" ON public.ai_usage_log FOR SELECT TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can read ai settings" ON public.ai_settings FOR SELECT TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can update ai settings" ON public.ai_settings FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can insert splash config" ON public.splash_config FOR INSERT TO authenticated WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can update splash config" ON public.splash_config FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can delete splash config" ON public.splash_config FOR DELETE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can insert assistant config" ON public.assistant_config FOR INSERT TO authenticated WITH CHECK (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can update assistant config" ON public.assistant_config FOR UPDATE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));
CREATE POLICY "Admins and owners can delete assistant config" ON public.assistant_config FOR DELETE TO authenticated USING (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid()));

-- Storage policies recreation
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'product-images'::text) AND auth_utils.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'product-images'::text) AND auth_utils.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'product-images'::text) AND auth_utils.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins and owners can upload hero videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'hero-videos'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins and owners can update hero videos" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'hero-videos'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins and owners can delete hero videos" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'hero-videos'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins can upload maintenance images" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'maintenance-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins can update maintenance images" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'maintenance-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins can delete maintenance images" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'maintenance-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins and owners can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'product-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins and owners can update product images" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'product-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));
CREATE POLICY "Admins and owners can delete product images" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'product-images'::text) AND (auth_utils.has_role(auth.uid(), 'admin'::public.app_role) OR auth_utils.is_owner(auth.uid())));

-- 6. Clean up: Drop the functions from public schema with CASCADE to ensure all dependencies are handled
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.protect_owner_role() CASCADE;
