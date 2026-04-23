CREATE TABLE IF NOT EXISTS public.splash_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.splash_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Splash config is publicly readable"
ON public.splash_config FOR SELECT
USING (true);

CREATE POLICY "Admins and owners can insert splash config"
ON public.splash_config FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can update splash config"
ON public.splash_config FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can delete splash config"
ON public.splash_config FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE TRIGGER splash_config_updated_at
BEFORE UPDATE ON public.splash_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();