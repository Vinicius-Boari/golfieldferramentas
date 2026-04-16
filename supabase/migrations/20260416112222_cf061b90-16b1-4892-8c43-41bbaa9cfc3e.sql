
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL DEFAULT '',
  inscricao_estadual TEXT DEFAULT '',
  razao_social TEXT NOT NULL DEFAULT '',
  nome_fantasia TEXT DEFAULT '',
  segmento TEXT DEFAULT '',
  nome_responsavel TEXT NOT NULL DEFAULT '',
  cargo TEXT DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, cnpj, inscricao_estadual, razao_social, nome_fantasia, segmento, nome_responsavel, cargo, email, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'cnpj', ''),
    COALESCE(NEW.raw_user_meta_data->>'inscricao_estadual', ''),
    COALESCE(NEW.raw_user_meta_data->>'razao_social', ''),
    COALESCE(NEW.raw_user_meta_data->>'nome_fantasia', ''),
    COALESCE(NEW.raw_user_meta_data->>'segmento', ''),
    COALESCE(NEW.raw_user_meta_data->>'nome_responsavel', ''),
    COALESCE(NEW.raw_user_meta_data->>'cargo', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'telefone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
