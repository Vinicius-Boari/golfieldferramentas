import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-4 sm:px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <Link to="/" className="inline-block">
            <img
              src="/images/golfield-logo.jpeg"
              alt="Golfield"
              className="h-10 md:h-12 rounded-lg object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="glass-card rounded-2xl p-5 sm:p-6 md:p-10">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm mt-2">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </motion.div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/30">
        © {new Date().getFullYear()} Golfield. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default AuthLayout;
