import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { formatCNPJ, validateCNPJ } from "@/lib/cnpj";

const EXPIRY_SECONDS = 300; // 5 min

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");

  // Step 2
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(EXPIRY_SECONDS);
  const [codeError, setCodeError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState(false);

  // Timer
  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Step 1 submit
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner("");
    const errs: Record<string, string> = {};
    if (!cnpj) errs.cnpj = "Informe o CNPJ";
    else if (!validateCNPJ(cnpj)) errs.cnpj = "CNPJ inválido";
    if (!email) errs.email = "Informe o e-mail";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "E-mail inválido";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(EXPIRY_SECONDS);
    }, 1500);
  };

  // Code input
  const handleCodeChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setCodeError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }, [code]);

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) newCode[i] = pasted[i] || "";
    setCode(newCode);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 2 submit
  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const full = code.join("");
    if (full.length !== 6) { setCodeError("Informe o código completo"); return; }
    if (timer <= 0) { setCodeError("O código expirou. Solicite um novo."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate success
      setStep(3);
    }, 1200);
  };

  const resendCode = () => {
    setCode(["", "", "", "", "", ""]);
    setTimer(EXPIRY_SECONDS);
    setCodeError("");
    inputRefs.current[0]?.focus();
  };

  // Step 3 submit
  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = "Informe a nova senha";
    else if (newPassword.length < 8) errs.newPassword = "Mínimo 8 caracteres";
    else if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) errs.newPassword = "Deve conter letras e números";
    if (!confirmPassword) errs.confirmPassword = "Confirme a senha";
    else if (confirmPassword !== newPassword) errs.confirmPassword = "As senhas não coincidem";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(true);
      setTimeout(() => navigate("/login"), 3000);
    }, 1500);
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            s === step ? "bg-primary text-primary-foreground" : s < step ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
          }`}>
            {s < step ? "✓" : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-green-500" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
      errors[field] ? "border-destructive" : "border-border/50 focus:border-primary/60"
    }`;

  const titles = ["Recuperar senha", "Verificar código", "Nova senha"];
  const subtitles = [
    "Informe o CNPJ e e-mail cadastrado",
    "Insira o código de 6 dígitos enviado para seu e-mail",
    "Crie uma nova senha para sua conta",
  ];

  if (successMsg) {
    return (
      <AuthLayout title="Senha redefinida!" subtitle="">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-green-500" size={36} />
          </div>
          <p className="text-muted-foreground text-sm">Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes...</p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={titles[step - 1]} subtitle={subtitles[step - 1]}>
      {stepIndicator}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleStep1} className="space-y-5" noValidate>
            {banner && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{banner}</span>
              </div>
            )}
            <div>
              <label htmlFor="fp-cnpj" className="block text-sm font-medium text-foreground mb-1.5">CNPJ</label>
              <input id="fp-cnpj" inputMode="numeric" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} onBlur={() => { if (cnpj && !validateCNPJ(cnpj)) setErrors(p => ({ ...p, cnpj: "CNPJ inválido" })); else setErrors(p => { const { cnpj: _, ...r } = p; return r; }); }} placeholder="XX.XXX.XXX/XXXX-XX" className={inputClass("cnpj")} />
              {errors.cnpj && <p className="text-destructive text-xs mt-1">{errors.cnpj}</p>}
            </div>
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-foreground mb-1.5">E-mail cadastrado</label>
              <input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => { if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErrors(p => ({ ...p, email: "E-mail inválido" })); else setErrors(p => { const { email: _, ...r } = p; return r; }); }} placeholder="email@empresa.com.br" className={inputClass("email")} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
              {loading ? "Enviando..." : "Enviar código de verificação"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Voltar ao login
              </Link>
            </p>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleStep2} className="space-y-6" noValidate>
            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-secondary/60 border text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                    codeError ? "border-destructive" : "border-border/50 focus:border-primary/60"
                  }`}
                  aria-label={`Dígito ${i + 1}`}
                />
              ))}
            </div>
            {codeError && <p className="text-destructive text-xs text-center">{codeError}</p>}

            <div className="text-center text-sm text-muted-foreground">
              {timer > 0 ? (
                <span>O código expira em <span className="text-foreground font-medium">{formatTime(timer)}</span></span>
              ) : (
                <button type="button" onClick={resendCode} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Reenviar código
                </button>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
              {loading ? "Verificando..." : "Verificar código"}
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleStep3} className="space-y-5" noValidate>
            <PasswordInput id="newPassword" label="Nova senha" value={newPassword} onChange={setNewPassword} error={pwErrors.newPassword} onBlur={() => { if (newPassword && (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword))) setPwErrors(p => ({ ...p, newPassword: "Mín. 8 caracteres com letras e números" })); else setPwErrors(p => { const { newPassword: _, ...r } = p; return r; }); }} />
            <PasswordStrength password={newPassword} />
            <PasswordInput id="confirmPassword" label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} error={pwErrors.confirmPassword} onBlur={() => { if (confirmPassword && confirmPassword !== newPassword) setPwErrors(p => ({ ...p, confirmPassword: "As senhas não coincidem" })); else setPwErrors(p => { const { confirmPassword: _, ...r } = p; return r; }); }} />
            <button type="submit" disabled={loading} className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
