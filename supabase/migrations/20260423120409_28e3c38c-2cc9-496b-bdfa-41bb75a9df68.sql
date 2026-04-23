CREATE TABLE public.assistant_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assistant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assistant config is publicly readable"
  ON public.assistant_config FOR SELECT
  USING (true);

CREATE POLICY "Admins and owners can insert assistant config"
  ON public.assistant_config FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can update assistant config"
  ON public.assistant_config FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Admins and owners can delete assistant config"
  ON public.assistant_config FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE TRIGGER update_assistant_config_updated_at
  BEFORE UPDATE ON public.assistant_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();