
-- 1) Criar perfis faltantes para usuários existentes que não possuem registro em profiles
INSERT INTO public.profiles (user_id, cnpj, razao_social, nome_responsavel, email, telefone, nome_fantasia, segmento, cargo, inscricao_estadual)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'cnpj', ''),
  COALESCE(u.raw_user_meta_data->>'razao_social', ''),
  COALESCE(u.raw_user_meta_data->>'nome_responsavel', SPLIT_PART(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'email', u.email, ''),
  COALESCE(u.raw_user_meta_data->>'telefone', ''),
  COALESCE(u.raw_user_meta_data->>'nome_fantasia', ''),
  COALESCE(u.raw_user_meta_data->>'segmento', ''),
  COALESCE(u.raw_user_meta_data->>'cargo', ''),
  COALESCE(u.raw_user_meta_data->>'inscricao_estadual', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 2) Garantir que o trigger handle_new_user esteja anexado em auth.users (caso não exista)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
