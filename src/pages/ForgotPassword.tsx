import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { supabase } from "@/integrations/supabase/client";

/**
 * "Esqueci minha senha" — fluxo via link mágico do Supabase Auth.
 *
 * Diferente de versões antigas deste componente, NÃO usamos código OTP de 6
 * dígitos: chamamos diretamente `supabase.auth.resetPasswordForEmail`, que
 * envia um link seguro para o e-mail informado. O link aponta para
 * `/redefinir-senha`, onde o usuário define a nova senha.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Informe o e-mail cadastrado");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("E-mail inválido");
      return;
    }
    setLoading(true);
    try {
      // Por segurança, sempre exibimos a mesma confirmação,
      // mesmo que o e-mail não exista (evita enumeração de usuários).
      await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setSent(true);
    } catch (err: any) {
      // Mesmo em erro, não revelamos detalhes para evitar enumeração.
      console.error("[ForgotPassword] resetPasswordForEmail error:", err);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Verifique seu e-mail" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="text-primary" size={32} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              Enviamos um link de redefinição
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviamos um link de redefinição de senha para{" "}
              <span className="text-foreground font-medium break-all">{email.trim().toLowerCase()}</span>.
              Clique no link recebido para criar uma nova senha.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Não esqueça de verificar a caixa de spam ou lixo eletrônico.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/login"
              className="btn-golfield w-full justify-center"
            >
              <ArrowLeft size={16} /> Voltar para o login
            </Link>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Não recebeu? Tentar com outro e-mail
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para você criar uma nova senha"
    >
      <AnimatePresence mode="wait">
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div>
            <label htmlFor="fp-email" className="block text-sm font-medium text-foreground mb-1.5">
              E-mail cadastrado
            </label>
            <input
              id="fp-email"
              type="email"
              value={email}
              autoComplete="email"
              autoFocus
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="email@empresa.com.br"
              className={`w-full px-4 py-3 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                error ? "border-destructive" : "border-border/50 focus:border-primary/60"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Enviando...
              </span>
            ) : (
              <>
                <Mail size={16} /> Enviar link de redefinição
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Voltar ao login
            </Link>
          </p>
        </motion.form>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
