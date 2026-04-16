import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CODE_EXPIRY_SECONDS = 600; // 10 min
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — request code
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2 — verify code
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [expiryTimer, setExpiryTimer] = useState(CODE_EXPIRY_SECONDS);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN_SECONDS);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 — set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [successDone, setSuccessDone] = useState(false);

  // Expiry countdown
  useEffect(() => {
    if (step !== 2 || expiryTimer <= 0) return;
    const t = setInterval(() => setExpiryTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [step, expiryTimer]);

  // Resend cooldown countdown
  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [step, resendTimer]);

  // Auto-focus first OTP input on step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // ─── Step 1: send code ───────────────────────────────────────────────
  const sendCode = async (isResend = false) => {
    setBanner("");
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Informe o e-mail");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("E-mail inválido");
      return;
    }

    setLoading(true);
    try {
      // signInWithOtp with shouldCreateUser:false sends a 6-digit OTP only to existing users.
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });

      if (error) {
        // Generic message to avoid leaking which emails exist (security best practice).
        // But still inform user clearly that they should check inbox.
        if (/rate|limit|too many/i.test(error.message)) {
          setBanner("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        } else if (/not.*found|signups not allowed|invalid/i.test(error.message)) {
          setBanner("Não foi possível enviar o código. Verifique se o e-mail está cadastrado.");
        } else {
          setBanner("Não foi possível enviar o código no momento. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      if (isResend) {
        toast.success("Novo código enviado para seu e-mail.");
      } else {
        toast.success("Código enviado! Verifique sua caixa de entrada.");
      }
      // Reset step-2 state
      setCode(["", "", "", "", "", ""]);
      setCodeError("");
      setExpiryTimer(CODE_EXPIRY_SECONDS);
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      setAttemptsLeft(MAX_ATTEMPTS);
      setStep(2);
    } catch {
      setBanner("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    sendCode(false);
  };

  // ─── Step 2: verify code ─────────────────────────────────────────────
  const handleCodeChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setCode((prev) => {
      const next = [...prev];
      next[index] = value.slice(-1);
      return next;
    });
    setCodeError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }, []);

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setCode(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setCodeError("Informe os 6 dígitos do código");
      return;
    }
    if (expiryTimer <= 0) {
      setCodeError("O código expirou. Solicite um novo.");
      return;
    }
    if (attemptsLeft <= 0) {
      setCodeError("Limite de tentativas atingido. Solicite um novo código.");
      return;
    }

    setLoading(true);
    setCodeError("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
        type: "email",
      });

      if (error) {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        if (/expired/i.test(error.message)) {
          setCodeError("Código expirado. Solicite um novo.");
        } else if (remaining <= 0) {
          setCodeError("Código incorreto. Limite de tentativas atingido.");
        } else {
          setCodeError(`Código incorreto. Você tem mais ${remaining} ${remaining === 1 ? "tentativa" : "tentativas"}.`);
        }
        setLoading(false);
        return;
      }

      // Success — user is now authenticated, move to password step
      setStep(3);
    } catch {
      setCodeError("Erro ao validar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    sendCode(true);
  };

  // ─── Step 3: set new password ────────────────────────────────────────
  const validatePassword = (pw: string): string | null => {
    if (!pw) return "Informe a nova senha";
    if (pw.length < 8) return "Mínimo 8 caracteres";
    if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Deve conter letras e números";
    return null;
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const pwErr = validatePassword(newPassword);
    if (pwErr) errs.newPassword = pwErr;
    if (!confirmPassword) errs.confirmPassword = "Confirme a nova senha";
    else if (confirmPassword !== newPassword) errs.confirmPassword = "As senhas não coincidem";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        if (/same.*password|different/i.test(error.message)) {
          setPwErrors({ newPassword: "A nova senha deve ser diferente da anterior" });
        } else if (/weak|short/i.test(error.message)) {
          setPwErrors({ newPassword: "Senha muito fraca. Tente uma mais forte." });
        } else {
          toast.error("Não foi possível atualizar a senha. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      // Sign out so user must log in with the new password explicitly
      await supabase.auth.signOut();
      setSuccessDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  // ─── UI: progress indicator ──────────────────────────────────────────
  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              s === step
                ? "bg-primary text-primary-foreground"
                : s < step
                ? "bg-primary/80 text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {s < step ? "✓" : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-primary/80" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );

  const titles = ["Recuperar senha", "Verificar código", "Nova senha"];
  const subtitles = [
    "Informe o e-mail cadastrado para receber o código",
    `Digite o código de 6 dígitos enviado para ${email}`,
    "Crie uma nova senha segura para sua conta",
  ];

  // ─── Success screen ──────────────────────────────────────────────────
  if (successDone) {
    return (
      <AuthLayout title="Senha redefinida!" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="text-primary" size={36} />
          </div>
          <p className="text-muted-foreground text-sm">
            Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...
          </p>
          <Link to="/login" className="btn-golfield inline-flex justify-center">
            Ir para o login agora
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={titles[step - 1]} subtitle={subtitles[step - 1]}>
      {stepIndicator}

      <AnimatePresence mode="wait">
        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <motion.form
            key="s1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleStep1Submit}
            className="space-y-5"
            noValidate
          >
            {banner && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{banner}</span>
              </div>
            )}
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-foreground mb-1.5">
                E-mail cadastrado
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => {
                  if (email && !validateEmail(email)) setEmailError("E-mail inválido");
                }}
                placeholder="email@empresa.com.br"
                className={`w-full px-4 py-3 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  emailError ? "border-destructive" : "border-border/50 focus:border-primary/60"
                }`}
              />
              {emailError && <p className="text-destructive text-xs mt-1">{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Enviando código..." : "Enviar código de verificação"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Voltar ao login
              </Link>
            </p>
          </motion.form>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <motion.form
            key="s2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleStep2Submit}
            className="space-y-6"
            noValidate
          >
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground -mt-2">
              <Mail size={14} />
              <span>Confira sua caixa de entrada e spam</span>
            </div>

            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className={`w-11 h-14 sm:w-12 text-center text-xl font-bold rounded-xl bg-secondary/60 border text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    codeError ? "border-destructive" : "border-border/50 focus:border-primary/60"
                  }`}
                  aria-label={`Dígito ${i + 1}`}
                  disabled={loading || expiryTimer <= 0}
                />
              ))}
            </div>
            {codeError && <p className="text-destructive text-xs text-center">{codeError}</p>}

            <div className="text-center text-sm text-muted-foreground space-y-1">
              {expiryTimer > 0 ? (
                <p>
                  O código expira em{" "}
                  <span className="text-foreground font-medium tabular-nums">{formatTime(expiryTimer)}</span>
                </p>
              ) : (
                <p className="text-destructive">Código expirado. Solicite um novo.</p>
              )}
              <p className="text-xs">
                {resendTimer > 0 ? (
                  <span>
                    Reenviar código em <span className="tabular-nums">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                  >
                    Reenviar código
                  </button>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || expiryTimer <= 0 || attemptsLeft <= 0}
              className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setCode(["", "", "", "", "", ""]);
                  setCodeError("");
                }}
                className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Usar outro e-mail
              </button>
            </p>
          </motion.form>
        )}

        {/* ─── STEP 3 ─── */}
        {step === 3 && (
          <motion.form
            key="s3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleStep3Submit}
            className="space-y-5"
            noValidate
          >
            <PasswordInput
              id="newPassword"
              label="Nova senha"
              value={newPassword}
              onChange={(v) => {
                setNewPassword(v);
                if (pwErrors.newPassword) setPwErrors((p) => ({ ...p, newPassword: "" }));
              }}
              error={pwErrors.newPassword}
              onBlur={() => {
                const err = validatePassword(newPassword);
                if (err) setPwErrors((p) => ({ ...p, newPassword: err }));
              }}
            />
            <PasswordStrength password={newPassword} />
            <PasswordInput
              id="confirmPassword"
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                if (pwErrors.confirmPassword) setPwErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              error={pwErrors.confirmPassword}
              onBlur={() => {
                if (confirmPassword && confirmPassword !== newPassword)
                  setPwErrors((p) => ({ ...p, confirmPassword: "As senhas não coincidem" }));
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
