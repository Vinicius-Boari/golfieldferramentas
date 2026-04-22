CREATE TABLE public.password_reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  cnpj text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_expires ON public.password_reset_codes(expires_at);

ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- No client policies — only edge functions (service role) access this table.