import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingCart, Phone, Menu, X, Mail } from "lucide-react";
import { useCart } from "@/context/CartContext";

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="gradient-primary py-2"
      >
        <div className="container mx-auto px-4 flex items-center justify-between text-primary-foreground text-sm">
          <div className="flex items-center gap-4">
            <a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group">
              <WhatsAppIcon size={14} />
              <span className="font-medium group-hover:underline">(11) 95940-9051</span>
            </a>
            <span className="hidden sm:inline opacity-50">|</span>
            <a href="mailto:paula.profield@hotmail.com" className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Mail size={14} />
              <span>paula.profield@hotmail.com</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="opacity-80">Seg a Sex 7h às 18h</span>
            <span className="opacity-50">|</span>
            <a href="https://www.instagram.com/golfield.ferramentas/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group">
              <InstagramIcon size={14} />
              <span className="group-hover:underline">@golfield.ferramentas</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Main header */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className={`sticky top-0 z-50 border-b border-border transition-all duration-500 ${
          scrolled ? "glass shadow-lg shadow-background/50" : "bg-card/95 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/images/golfield-logo.jpeg" alt="Golfield" className="h-16 md:h-20 rounded-lg shadow-md" />
            </motion.a>

            {/* Search */}
            <motion.div
              className="hidden md:flex flex-1 max-w-xl relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Buscar ferramentas, produtos..."
                className="search-input pl-11"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <motion.a
                href="https://www.instagram.com/golfield.ferramentas/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-secondary hover:bg-gradient-to-br hover:from-[hsl(340,80%,50%)] hover:to-[hsl(30,90%,55%)] hover:text-primary-foreground transition-all duration-300"
                title="Siga-nos no Instagram"
              >
                <InstagramIcon size={20} />
              </motion.a>

              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/5511959409051"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-secondary hover:bg-[hsl(142,70%,45%)] hover:text-primary-foreground transition-all duration-300"
                title="Fale conosco pelo WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </motion.a>

              {/* Cart */}
              <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-[11px] font-bold text-primary-foreground"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              <button
                className="md:hidden p-3 rounded-xl bg-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile search + links */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="md:hidden mt-4 overflow-hidden space-y-3"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar ferramentas..."
                    className="search-input pl-11"
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <a href="mailto:paula.profield@hotmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2">
                    <Mail size={14} /> paula.profield@hotmail.com
                  </a>
                  <a href="https://www.instagram.com/golfield.ferramentas/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2">
                    <InstagramIcon size={14} /> @golfield.ferramentas
                  </a>
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
