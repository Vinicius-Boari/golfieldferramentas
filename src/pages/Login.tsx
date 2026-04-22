import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import { formatCNPJ, validateCNPJ } from "@/lib/cnpj";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!cnpj.trim()) e.cnpj = "Informe o CNPJ";
    else if (!validateCNPJ(cnpj)) e.cnpj = "CNPJ inválido";
    if (!password) e.password = "Informe a senha";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner("");
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Buscar e-mail vinculado ao CNPJ
      const { data: email, error: rpcError } = await supabase.rpc("get_email_by_cnpj", {
        _cnpj: cnpj,
      });

      if (rpcError) throw rpcError;
      if (!email) {
        setBanner("CNPJ ou senha incorretos. Verifique seus dados e tente novamente.");
        setLoading(false);
        return;
      }

      // 2. Autenticar com e-mail + senha
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email as string,
        password,
      });

      if (signInError) {
        setBanner("CNPJ ou senha incorretos. Verifique seus dados e tente novamente.");
        setLoading(false);
        return;
      }

      toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setBanner("Erro ao realizar login. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Acesse sua conta" subtitle="Área exclusiva para clientes">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

        {/* CNPJ */}
        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-foreground mb-1.5">CNPJ</label>
          <input
            id="cnpj"
            type="text"
            inputMode="numeric"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            onBlur={() => { if (cnpj && !validateCNPJ(cnpj)) setErrors(prev => ({ ...prev, cnpj: "CNPJ inválido" })); else setErrors(prev => { const { cnpj: _, ...rest } = prev; return rest; }); }}
            placeholder="XX.XXX.XXX/XXXX-XX"
            className={`w-full px-4 py-3 rounded-xl bg-secondary/60 border text-foreground placeholder:text-muted-foreground text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              errors.cnpj ? "border-destructive" : "border-border/50 focus:border-primary/60"
            }`}
          />
          {errors.cnpj && <p className="text-destructive text-xs mt-1">{errors.cnpj}</p>}
        </div>

        {/* Password */}
        <PasswordInput
          id="password"
          label="Senha"
          value={password}
          onChange={setPassword}
          error={errors.password}
          onBlur={() => { if (!password) setErrors(prev => ({ ...prev, password: "Informe a senha" })); else setErrors(prev => { const { password: _, ...rest } = prev; return rest; }); }}
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary/40"
            />
            Lembrar meu acesso
          </label>
          <Link to="/esqueci-senha" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Esqueci minha senha
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-golfield w-full justify-center disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              Entrando...
            </span>
          ) : "Entrar"}
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground pt-2">
          Ainda não tem cadastro?{" "}
          <Link to="/cadastro" className="text-primary hover:text-primary/80 transition-colors font-medium">
            Realize seu cadastro
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
