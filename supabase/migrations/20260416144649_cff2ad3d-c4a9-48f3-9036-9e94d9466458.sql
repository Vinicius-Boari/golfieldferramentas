
-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_discount NUMERIC DEFAULT NULL,
  min_order_value NUMERIC NOT NULL DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL,
  per_user_limit INTEGER DEFAULT 1,
  times_used INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'categories')),
  product_ids TEXT[] DEFAULT '{}',
  category_ids TEXT[] DEFAULT '{}',
  exclude_product_ids TEXT[] DEFAULT '{}',
  exclude_category_ids TEXT[] DEFAULT '{}',
  logged_in_only BOOLEAN NOT NULL DEFAULT false,
  first_purchase_only BOOLEAN NOT NULL DEFAULT false,
  cumulative BOOLEAN NOT NULL DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_coupon_code UNIQUE (code)
);

-- Create coupon_usage table
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_total NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Anyone can read active coupons" ON public.coupons
FOR SELECT TO public USING (true);

CREATE POLICY "Admins and owners can insert coupons" ON public.coupons
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can update coupons" ON public.coupons
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can delete coupons" ON public.coupons
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Coupon usage policies
CREATE POLICY "Authenticated users can insert usage" ON public.coupon_usage
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and owners can read all usage" ON public.coupon_usage
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()) OR auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for coupons
ALTER PUBLICATION supabase_realtime ADD TABLE public.coupons;
