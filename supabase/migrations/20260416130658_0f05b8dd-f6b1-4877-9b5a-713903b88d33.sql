
-- Table to store home page configuration as JSON
CREATE TABLE public.home_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public page)
CREATE POLICY "Home config is publicly readable"
  ON public.home_config FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert home config"
  ON public.home_config FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update home config"
  ON public.home_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete home config"
  ON public.home_config FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_home_config_updated_at
  BEFORE UPDATE ON public.home_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
