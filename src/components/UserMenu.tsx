import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getInitials } from "@/hooks/useProfile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const UserMenu = () => {
  const { isAuthenticated, loading } = useAuth();
  const { data: profile } = useProfile();
  const { t } = useTranslation();

  if (loading) {
    // Render a placeholder so layout doesn't shift
    return (
      <div className="p-2 sm:p-2.5 rounded-xl inline-flex">
        <div className="w-5 h-5 rounded-full bg-secondary/40 animate-pulse" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isAuthenticated ? (
        <motion.div
          key="avatar"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/perfil"
                className="relative p-1 sm:p-1.5 rounded-full inline-flex group"
                aria-label={t("user.profile")}
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/70 shadow-md shadow-primary/20 transition-all duration-300 group-hover:border-primary"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.nome_responsavel || t("user.profileAlt")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold">
                      {getInitials(profile?.nome_responsavel)}
                    </div>
                  )}
                </motion.div>
                {/* Online indicator */}
                <span className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 block w-2.5 h-2.5 rounded-full bg-[hsl(142,70%,45%)] ring-2 ring-background" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {profile?.nome_responsavel || t("user.profile")}
            </TooltipContent>
          </Tooltip>
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Link
            to="/login"
            aria-label={t("user.login")}
            className="p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 inline-flex"
          >
            <UserCircle2 size={20} className="text-primary-foreground" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserMenu;
