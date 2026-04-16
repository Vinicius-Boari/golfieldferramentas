import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { formatCNPJ, validateCNPJ, formatPhone } from "@/lib/cnpj";

const SEGMENTS = [
  "Construção Civil", "Indústria", "Comércio de Ferragens", "Manutenção Industrial",
  "Serralheria", "Marcenaria", "Elétrica", "Hidráulica", "Outro",
];

const Register = () => {
  const [form, setForm] = useState({
    cnpj: "", inscricaoEstadual: "", razaoSocial: "", nomeFantasia: "", segmento: "",
    nomeResponsavel: "", cargo: "", email: "", telefone: "",
    senha: "", confirmarSenha: "", termos: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validateField = (field: string): string => {
    const v = form[field as keyof typeof form];
    switch (field) {
      case "cnpj": return !v ? "Informe o CNPJ" : !validateCNPJ(v as string) ? "CNPJ inválido" : "";
      case "inscricaoEstadual": return !v ? "Informe a Inscrição Estadual (IE)" : "";
      case "razaoSocial": return !v ? "Informe a Razão Social" : "";
      case "nomeResponsavel": return !v ? "Informe o nome do responsável" : "";
      case "cargo": return !v ? "Informe o cargo" : "";
      case "email": return !v ? "Informe o e-mail" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string) ? "E-mail inválido" : "";
      case "telefone": return !v ? "Informe o telefone" : (v as string).replace(/\D/g, "").length < 10 ? "Telefone inválido" : "";
      case "senha": return !v ? "Informe a senha" : (v as string).length < 8 ? "Mínimo 8 caracteres" : !/[a-zA-Z]/.test(v as string) || !/\d/.test(v as string) ? "Deve conter letras e números" : "";
      case "confirmarSenha": return !v ? "Confirme a senha" : v !== form.senha ? "As senhas não coincidem" : "";
      case "termos": return !v ? "Aceite os termos" : "";
      default: return "";
    }
  };

  const handleBlur = (field: string) => {
    const err = validateField(field);
    setErrors((prev) => err ? { ...prev, [field]: err } : (() => { const { [field]: _, ...rest } = prev; return rest; })());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = ["cnpj", "razaoSocial", "nomeResponsavel", "cargo", "email", "telefone", "senha", "confirmarSenha", "termos"];
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => { const err = validateField(f); if (err) newErrors[f] = err; });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 2000);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
      errors[field] ? "border-destructive" : "border-border/50 focus:border-primary/60"
    }`;

  if (success) {
    return (
      <AuthLayout title="Cadastro enviado!" subtitle="">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="text-green-500" size={36} />
          </div>
          <p className="text-muted-foreground text-sm">
            Seu cadastro foi enviado com sucesso. Nossa equipe irá analisar seus dados e entraremos em contato em breve.
          </p>
          <Link to="/login" className="btn-golfield inline-flex">Voltar ao Login</Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Solicite seu acesso" subtitle="Preencha os dados da sua empresa para criar uma conta B2B">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* CNPJ */}
        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-foreground mb-1.5">CNPJ *</label>
          <input id="cnpj" inputMode="numeric" value={form.cnpj} onChange={(e) => set("cnpj", formatCNPJ(e.target.value))} onBlur={() => handleBlur("cnpj")} placeholder="XX.XXX.XXX/XXXX-XX" className={inputClass("cnpj")} />
          {errors.cnpj && <p className="text-destructive text-xs mt-1">{errors.cnpj}</p>}
        </div>

        {/* Razão Social + Nome Fantasia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="razaoSocial" className="block text-sm font-medium text-foreground mb-1.5">Razão Social *</label>
            <input id="razaoSocial" value={form.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} onBlur={() => handleBlur("razaoSocial")} placeholder="Nome legal da empresa" className={inputClass("razaoSocial")} />
            {errors.razaoSocial && <p className="text-destructive text-xs mt-1">{errors.razaoSocial}</p>}
          </div>
          <div>
            <label htmlFor="nomeFantasia" className="block text-sm font-medium text-foreground mb-1.5">Nome Fantasia</label>
            <input id="nomeFantasia" value={form.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} placeholder="Nome comercial (opcional)" className={inputClass("nomeFantasia")} />
          </div>
        </div>

        {/* Segmento */}
        <div>
          <label htmlFor="segmento" className="block text-sm font-medium text-foreground mb-1.5">Segmento / Ramo de Atividade</label>
          <select id="segmento" value={form.segmento} onChange={(e) => set("segmento", e.target.value)} className={inputClass("segmento") + " appearance-none"}>
            <option value="">Selecione...</option>
            {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Responsável */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-foreground mb-1.5">Nome do Responsável *</label>
            <input id="nomeResponsavel" value={form.nomeResponsavel} onChange={(e) => set("nomeResponsavel", e.target.value)} onBlur={() => handleBlur("nomeResponsavel")} placeholder="Nome completo" className={inputClass("nomeResponsavel")} />
            {errors.nomeResponsavel && <p className="text-destructive text-xs mt-1">{errors.nomeResponsavel}</p>}
          </div>
          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-foreground mb-1.5">Cargo *</label>
            <input id="cargo" value={form.cargo} onChange={(e) => set("cargo", e.target.value)} onBlur={() => handleBlur("cargo")} placeholder="Ex: Gerente de Compras" className={inputClass("cargo")} />
            {errors.cargo && <p className="text-destructive text-xs mt-1">{errors.cargo}</p>}
          </div>
        </div>

        {/* Email + Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">E-mail Corporativo *</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={() => handleBlur("email")} placeholder="email@empresa.com.br" className={inputClass("email")} />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-foreground mb-1.5">Telefone / WhatsApp *</label>
            <input id="telefone" inputMode="numeric" value={form.telefone} onChange={(e) => set("telefone", formatPhone(e.target.value))} onBlur={() => handleBlur("telefone")} placeholder="(11) 99999-9999" className={inputClass("telefone")} />
            {errors.telefone && <p className="text-destructive text-xs mt-1">{errors.telefone}</p>}
          </div>
        </div>

        {/* Senha */}
        <PasswordInput id="senha" label="Senha *" value={form.senha} onChange={(v) => set("senha", v)} error={errors.senha} onBlur={() => handleBlur("senha")} />
        <PasswordStrength password={form.senha} />

        {/* Confirmar Senha */}
        <PasswordInput id="confirmarSenha" label="Confirmar Senha *" value={form.confirmarSenha} onChange={(v) => set("confirmarSenha", v)} error={errors.confirmarSenha} onBlur={() => handleBlur("confirmarSenha")} />

        {/* Termos */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer text-sm text-muted-foreground">
            <input type="checkbox" checked={form.termos} onChange={(e) => set("termos", e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border bg-secondary text-primary focus:ring-primary/40" />
            <span>
              Concordo com os{" "}
              <a href="#" className="text-primary hover:underline">Termos de Uso</a> e{" "}
              <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
            </span>
          </label>
          {errors.termos && <p className="text-destructive text-xs mt-1">{errors.termos}</p>}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              Enviando...
            </span>
          ) : "Solicitar cadastro"}
        </button>

        <p className="text-center text-sm text-muted-foreground pt-1">
          Já tem cadastro?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Fazer login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
