-- Revoke public access to get_email_by_cnpj to prevent anonymous email enumeration via CNPJ.
-- The function remains usable by service_role (used by the lookup-email-by-cnpj edge function and by send-reset-code).
REVOKE EXECUTE ON FUNCTION public.get_email_by_cnpj(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_email_by_cnpj(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_by_cnpj(text) FROM PUBLIC;