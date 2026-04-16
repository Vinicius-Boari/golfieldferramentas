
-- Drop and recreate policies for home_config to include owner
DROP POLICY IF EXISTS "Admins can delete home config" ON public.home_config;
DROP POLICY IF EXISTS "Admins can insert home config" ON public.home_config;
DROP POLICY IF EXISTS "Admins can update home config" ON public.home_config;

CREATE POLICY "Admins and owners can delete home config" ON public.home_config
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can insert home config" ON public.home_config
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can update home config" ON public.home_config
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Drop and recreate policies for products to include owner
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Admins and owners can manage products" ON public.products
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Drop and recreate policies for user_roles to include owner
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins and owners can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));
