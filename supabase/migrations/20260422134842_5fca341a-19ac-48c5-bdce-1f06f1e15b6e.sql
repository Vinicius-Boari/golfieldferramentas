CREATE OR REPLACE FUNCTION public.get_email_by_cnpj(_cnpj text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles
  WHERE regexp_replace(cnpj, '\D', '', 'g') = regexp_replace(_cnpj, '\D', '', 'g')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_cnpj(text) TO anon, authenticated;