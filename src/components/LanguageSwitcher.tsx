import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentCode = (i18n.resolvedLanguage || i18n.language || "pt").split("-")[0];
  const current = SUPPORTED_LANGUAGES.find(l => l.code === currentCode) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    document.documentElement.lang = currentCode;
  }, [currentCode]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const change = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
      >
        <Globe size={18} className="text-primary-foreground" />
        <span className="hidden sm:inline text-xs font-semibold uppercase text-primary-foreground">
          {current.code}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border/60 bg-card shadow-2xl shadow-background/60 backdrop-blur-md overflow-hidden z-[60]"
          >
            {SUPPORTED_LANGUAGES.map(lang => {
              const active = lang.code === currentCode;
              return (
                <li key={lang.code}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => change(lang.code)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {active && <Check size={14} className="text-primary" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
