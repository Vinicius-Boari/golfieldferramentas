import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { supabase } from "@/integrations/supabase/client";

/**
 * `/redefinir-senha`
 *
 * Página de destino do link enviado por e-mail via
 * `supabase.auth.resetPasswordForEmail`.
 *
 * Comportamento:
 * - Quando o usuário clica no link do e-mail, o Supabase processa o token de
 *   recuperação automaticamente (via `detectSessionInUrl: true` no client) e
 *   dispara um evento `PASSWORD_RECOVERY`. Aqui escutamos esse evento para
 *   liberar o formulário.
 * - Caso a página seja aberta sem um token válido (ex.: link expirado ou
 *   acesso direto), exibimos uma mensagem instruindo o usuário a solicitar um
 *   novo link.
 * - Após salvar a nova senha, exibimos um aviso de sucesso e redirecionamos
 *   para `/login` em 3 s.
 */
const ResetPassword = () => {
  const navigate = useNavigate();

  // null = ainda verificando; true = sessão de recovery válida; false = inválida.
  const [isRecoveryReady, setIsRecoveryReady] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Detecta se há uma sessão de recuperação ativa.
  useEffect(() => {
    let mounted = true;

    // 1) Listener — captura PASSWORD_RECOVERY emitido pelo Supabase ao
    //    processar o hash do link de e-mail. Importante: registrar ANTES de
    //    chamar getSession() para não perder o evento.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryReady(true);
        return;
      }
      // Se já houver sessão válida (ex.: o evento foi emitido antes do
      // listener), liberamos o formulário também.
      if (event === "SIGNED_IN" && session) {
        setIsRecoveryReady(true);
      }
    });

    // 2) Fallback — após pequeno delay, checa se já existe sessão. Se não
    //    houver e nenhum evento PASSWORD_RECOVERY foi disparado, marcamos
    //    como link inválido / expirado.
    const timeout = setTimeout(async () => {
      if (!mounted) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && isRecoveryReady === null) {
        setIsRecoveryReady(Boolean(session));
      }
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = "Informe a nova senha";
    else if (newPassword.length < 8) e.newPassword = "Mínimo de 8 caracteres";
    if (!confirmPassword) e.confirmPassword = "Confirme a nova senha";
    else if (confirmPassword !== newPassword) e.confirmPassword = "As senhas não coincidem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner("");
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      // Encerra a sessão de recovery e redireciona para o login após 3 s.
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setBanner(err?.message || "Não foi possível redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Estados de tela
  // ────────────────────────────────────────────────────────────────────────

  // Verificando o link…
  if (isRecoveryReady === null) {
    return (
      <AuthLayout title="Verificando link" subtitle="Aguarde um instante…">
        <div className="flex justify-center py-6">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      </AuthLayout>
    );
  }

  // Link inválido / expirado.
  if (isRecoveryReady === false) {
    return (
      <AuthLayout title="Link inválido ou expirado" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="text-destructive" size={32} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este link de redefinição não é mais válido. Pode ter expirado ou já
            ter sido utilizado. Solicite um novo link para continuar.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/esqueci-senha" className="btn-golfield w-full justify-center">
              Solicitar novo link
            </Link>
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Voltar para o login
            </Link>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  // Sucesso — redireciona em 3 s.
  if (success) {
    return (
      <AuthLayout title="Senha redefinida com sucesso!" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-500" size={36} />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sua senha foi atualizada. Você será redirecionado para o login em
            instantes…
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  // Formulário principal — definir nova senha.
  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Defina uma senha forte para proteger sua conta"
    >
      <AnimatePresence mode="wait">
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{banner}</span>
            </motion.div>
          )}

          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
            <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-primary" />
            <span>
              Use no mínimo 8 caracteres. Recomendamos misturar letras, números
              e símbolos para maior segurança.
            </span>
          </div>

          <PasswordInput
            id="newPassword"
            label="Nova senha"
            value={newPassword}
            onChange={(v) => { setNewPassword(v); if (errors.newPassword) setErrors(p => { const { newPassword: _, ...r } = p; return r; }); }}
            error={errors.newPassword}
            onBlur={() => {
              if (newPassword && newPassword.length < 8) {
                setErrors(p => ({ ...p, newPassword: "Mínimo de 8 caracteres" }));
              }
            }}
          />
          <PasswordStrength password={newPassword} />

          <PasswordInput
            id="confirmPassword"
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); if (errors.confirmPassword) setErrors(p => { const { confirmPassword: _, ...r } = p; return r; }); }}
            error={errors.confirmPassword}
            onBlur={() => {
              if (confirmPassword && confirmPassword !== newPassword) {
                setErrors(p => ({ ...p, confirmPassword: "As senhas não coincidem" }));
              }
            }}
          />

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
                Salvando...
              </span>
            ) : (
              "Salvar nova senha"
            )}
          </button>
        </motion.form>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetPassword;
