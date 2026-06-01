-- Revoke public execution from security-sensitive functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_email_by_cnpj(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_owner_role() FROM PUBLIC, anon, authenticated;

-- Grant execute to appropriate roles
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_email_by_cnpj(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.protect_owner_role() TO service_role;

-- Ensure all functions have search_path set (some might have been missed)
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.is_owner(uuid) SET search_path = public;
ALTER FUNCTION public.get_email_by_cnpj(text) SET search_path = public;
ALTER FUNCTION public.protect_owner_role() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
