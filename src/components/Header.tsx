import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Menu, X, Mail, ChevronRight, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useHomeConfig, DEFAULT_HEADER_BACKGROUND_COLOR } from "@/hooks/useHomeConfig";

const InstagramIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: config } = useHomeConfig();
  const headerBg = config?.appearance?.headerBackgroundColor || DEFAULT_HEADER_BACKGROUND_COLOR;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Build a slightly transparent version of the header color for the
  // "scrolled" state, preserving the previous backdrop-blur effect.
  const hexToRgba = (hex: string, alpha: number) => {
    const m = /^#([0-9A-Fa-f]{6})$/.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  };
  const headerBgScrolled = hexToRgba(headerBg, 0.85);

  return (
    <>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden sm:block bg-card/80 border-b border-border/50 py-2"
      >
        <div className="container mx-auto px-4 flex items-center justify-between text-muted-foreground text-xs gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors min-w-0">
              <WhatsAppIcon size={12} className="text-primary-foreground shrink-0" />
              <span className="text-primary-foreground truncate">(11) 95940-9051</span>
            </a>
            <span className="hidden lg:inline text-border">|</span>
            <a href="mailto:paula.profield@hotmail.com" className="hidden lg:flex items-center gap-1.5 hover:text-foreground transition-colors min-w-0">
              <Mail size={12} className="text-primary-foreground shrink-0" />
              <span className="text-primary-foreground truncate">paula.profield@hotmail.com</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <span className="text-primary-foreground">Seg a Sex 7h às 18h</span>
            <span className="text-border">|</span>
            <a href="https://www.instagram.com/golfield.ferramentas/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <InstagramIcon size={12} className="text-primary-foreground bg-secondary" />
              <span className="text-primary-foreground">@golfield.ferramentas</span>
            </a>
          </div>
        </div>
      </motion.div>

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "shadow-2xl shadow-background/80 border-b border-border/30 backdrop-blur-md"
            : "backdrop-blur-sm"
        }`}
        style={{ backgroundColor: scrolled ? headerBgScrolled : headerBg }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <motion.a
              href="/"
              className="flex-shrink-0 group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src="/images/golfield-logo.jpeg"
                alt="Golfield"
                className="h-11 sm:h-12 md:h-14 rounded-lg object-contain transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10"
              />
            </motion.a>

            <nav className="hidden md:flex items-center gap-6">
              {[
                { label: "Sobre Nós", target: "sobre" },
                { label: "Contato", target: "contato" },
              ].map((item) => (
                <motion.button
                  key={item.target}
                  onClick={() => {
                    const el = document.getElementById(item.target);
                    if (el) {
                      const offset = 80;
                      const top = el.getBoundingClientRect().top + window.scrollY - offset;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  whileHover={{ y: -1 }}
                  className="text-sm font-medium transition-colors duration-300 text-primary-foreground"
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>

            <div className="hidden md:flex flex-1 max-w-lg relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Buscar ferramentas..."
                className="search-input pl-11 text-sm"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <motion.a
                href="https://www.instagram.com/golfield.ferramentas/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
              >
                <InstagramIcon size={18} className="text-primary-foreground bg-secondary" />
              </motion.a>

              <motion.a
                href="https://wa.me/5511959409051"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex p-2.5 rounded-xl text-muted-foreground hover:text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%,0.08)] transition-all duration-300"
              >
                <WhatsAppIcon size={18} className="text-primary-foreground" />
              </motion.a>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/login"
                  className="p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 inline-flex"
                >
                  <UserCircle2 size={20} className="text-primary-foreground" />
                </Link>
              </motion.div>

              <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
              >
                <ShoppingCart size={20} className="text-primary-foreground" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              <button
                className="md:hidden p-2 sm:p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menu"
              >
                <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="md:hidden mt-3 overflow-hidden"
              >
                <div className="space-y-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar ferramentas..."
                      className="search-input pl-11 text-sm"
                      value={searchQuery}
                      onChange={e => onSearchChange(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    {[
                      { label: "Sobre Nós", target: "sobre" },
                      { label: "Contato", target: "contato" },
                    ].map((item) => (
                      <button
                        key={item.target}
                        onClick={() => {
                          const el = document.getElementById(item.target);
                          if (el) {
                            const offset = 80;
                            const top = el.getBoundingClientRect().top + window.scrollY - offset;
                            window.scrollTo({ top, behavior: "smooth" });
                          }
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors p-3 rounded-xl hover:bg-secondary"
                      >
                        <span>{item.label}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                    <a href="mailto:paula.profield@hotmail.com" className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors p-3 rounded-xl hover:bg-secondary">
                      <span className="flex items-center gap-2 min-w-0"><Mail size={14} className="shrink-0" /> <span className="truncate">paula.profield@hotmail.com</span></span>
                      <ChevronRight size={14} />
                    </a>
                    <a href="https://www.instagram.com/golfield.ferramentas/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors p-3 rounded-xl hover:bg-secondary">
                      <span className="flex items-center gap-2"><InstagramIcon size={14} /> @golfield.ferramentas</span>
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
