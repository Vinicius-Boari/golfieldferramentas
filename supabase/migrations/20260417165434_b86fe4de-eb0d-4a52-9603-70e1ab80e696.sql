
CREATE TABLE public.visual_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id TEXT NOT NULL UNIQUE,
  styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visual_overrides ENABLE ROW LEVEL SECURITY;

-- Public read access (overrides are applied to the public site)
CREATE POLICY "Visual overrides are viewable by everyone"
ON public.visual_overrides
FOR SELECT
USING (true);

-- Only admins/owners can insert
CREATE POLICY "Admins can insert visual overrides"
ON public.visual_overrides
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

-- Only admins/owners can update
CREATE POLICY "Admins can update visual overrides"
ON public.visual_overrides
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

-- Only admins/owners can delete
CREATE POLICY "Admins can delete visual overrides"
ON public.visual_overrides
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'owner'::app_role)
);

-- Trigger to update updated_at on row update
CREATE TRIGGER visual_overrides_set_updated_at
BEFORE UPDATE ON public.visual_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for instant updates on the public site after admin saves
ALTER PUBLICATION supabase_realtime ADD TABLE public.visual_overrides;
