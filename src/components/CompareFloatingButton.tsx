import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCompare } from "@/context/CompareContext";

const CompareFloatingButton = () => {
  const { items, setIsOpen } = useCompare();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 80, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-card border-2 border-primary shadow-2xl shadow-primary/30 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          aria-label={t("compare.floatingAria", { count: items.length })}
        >
          <div className="relative">
            <Scale size={20} />
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {items.length}
            </span>
          </div>
          <span className="text-sm font-semibold hidden sm:inline">{t("compare.floatingLabel")}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default CompareFloatingButton;
