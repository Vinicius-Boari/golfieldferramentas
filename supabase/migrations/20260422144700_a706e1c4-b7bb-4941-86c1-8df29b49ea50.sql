
-- Tabela 1: log de cada uso da IA (para o contador)
CREATE TABLE public.ai_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature TEXT NOT NULL, -- 'chat' | 'image' | 'edit' | 'prompt'
  model TEXT,
  estimated_cost_usd NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_log_created_at ON public.ai_usage_log(created_at DESC);
CREATE INDEX idx_ai_usage_log_user_id ON public.ai_usage_log(user_id);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Admins e owners podem ver tudo; usuários veem só os seus
CREATE POLICY "Admins and owners can view all ai usage"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

CREATE POLICY "Users can view own ai usage"
  ON public.ai_usage_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserts vêm apenas das edge functions (service_role); bloqueamos client-side
CREATE POLICY "Service role can insert ai usage"
  ON public.ai_usage_log FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- Tabela 2: configuração global do AI Studio (1 linha)
CREATE TABLE public.ai_settings (
  id INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  monthly_budget_usd NUMERIC NOT NULL DEFAULT 1.00,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  CONSTRAINT singleton_ai_settings CHECK (id = 1)
);

INSERT INTO public.ai_settings (id, enabled, monthly_budget_usd) VALUES (1, true, 1.00);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Qualquer admin autenticado pode ler (precisa pra UI saber se está ligado)
CREATE POLICY "Admins and owners can read ai settings"
  ON public.ai_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Apenas admins/owners podem alterar
CREATE POLICY "Admins and owners can update ai settings"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER trg_ai_settings_updated_at
  BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
