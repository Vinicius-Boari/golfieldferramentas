import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, LogIn, Loader2 } from "lucide-react";
import { useHomeConfig } from "@/hooks/useHomeConfig";
import { useAdmin } from "@/hooks/useAdmin";

interface Props {
  children: React.ReactNode;
}

const ALWAYS_ALLOWED_PREFIXES = ["/admin", "/login"];

const MaintenanceGate = ({ children }: Props) => {
  const { data: config, isLoading } = useHomeConfig();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [adminCheckTimedOut, setAdminCheckTimedOut] = useState(false);

  // Avoid blocking forever if admin check stalls
  useEffect(() => {
    if (!adminLoading) return;
    const t = window.setTimeout(() => setAdminCheckTimedOut(true), 4000);
    return () => window.clearTimeout(t);
  }, [adminLoading]);

  const maintenance = config?.systemSettings?.maintenance;
  const enabled = !!maintenance?.enabled;

  const isAllowedRoute = ALWAYS_ALLOWED_PREFIXES.some(p => location.pathname.startsWith(p));

  // While loading config or checking admin status, render children to avoid flicker
  if (isLoading) return <>{children}</>;

  if (!enabled) return <>{children}</>;

  // Admin route always passes through (so admin can log in and disable)
  if (isAllowedRoute) return <>{children}</>;

  // If admin access allowed and user is admin, let them through
  if (maintenance?.allowAdminAccess) {
    if (adminLoading && !adminCheckTimedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      );
    }
    if (isAdmin) return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative overflow-hidden">
      {/* background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-xl w-full text-center space-y-6"
      >
        {maintenance?.imageUrl ? (
          <img
            src={maintenance.imageUrl}
            alt="Manutenção"
            className="mx-auto max-h-56 w-auto object-contain rounded-2xl"
          />
        ) : (
          <motion.div
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Wrench size={36} className="text-primary" />
          </motion.div>
        )}

        <div className="space-y-3">
          <span className="section-badge inline-flex">Em manutenção</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {maintenance?.title || "Estamos em manutenção"}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mx-auto whitespace-pre-line">
            {maintenance?.description || "Voltamos em breve."}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors backdrop-blur-sm"
          >
            <LogIn size={14} />
            Acesso administrativo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenanceGate;
