import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Phone, Menu, X, Instagram } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="gradient-primary py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-primary-foreground text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:1195940-9051" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone size={14} />
              <span className="font-medium">(11) 95940-9051</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="opacity-80">Atendimento: Seg a Sex 7h às 18h</span>
            <a href="https://instagram.com/golfield.ferramentas" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Instagram size={14} />
              <span>@golfield.ferramentas</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider">
                <span className="text-primary">GOL</span>
                <span className="text-foreground">FIELD</span>
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Ferramentas Premium</p>
            </a>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Buscar ferramentas, produtos..."
                className="search-input pl-11"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
              >
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center text-[11px] font-bold text-primary-foreground"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
              <button
                className="md:hidden p-3 rounded-xl bg-secondary"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 overflow-hidden"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;
