import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const Footer = () => {
  return (
    <footer className="border-t border-border gradient-dark relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container mx-auto px-4 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <img src="/images/golfield-logo.jpeg" alt="Golfield" className="h-16 rounded-xl border-2 border-primary/20 shadow-lg shadow-primary/10 object-contain mb-4" />
            <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
              Ferramentas premium com preços de atacado. Distribuímos para todo o Brasil com qualidade garantida e atendimento personalizado. Sua satisfação é nossa prioridade.
            </p>
            <div className="flex gap-3">
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
              <motion.a
                href="https://wa.me/5511959409051"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-secondary hover:bg-[hsl(142,70%,45%)] hover:text-primary-foreground transition-all duration-300"
                title="WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Contato */}
          <motion.div variants={itemVariants}>
            <h3 className="font-display text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors group">
                  <Phone size={14} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  (11) 95940-9051
                </a>
              </li>
              <li>
                <a href="mailto:paula.profield@hotmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors group">
                  <Mail size={14} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  paula.profield@hotmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <span>São Paulo - SP, Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-primary flex-shrink-0" />
                <span>Seg a Sex: 7h às 18h</span>
              </li>
            </ul>
          </motion.div>

          {/* Categorias */}
          <motion.div variants={itemVariants}>
            <h3 className="font-display text-lg font-bold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Alicates", "Brocas", "Discos", "Chaves", "Trenas", "Torneiras", "Martelos", "Serras"].map((cat, i) => (
                <motion.li
                  key={cat}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#produtos" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span className="text-primary/40">›</span> {cat}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
        >
          <p>© {new Date().getFullYear()} Golfield. Todos os direitos reservados.</p>
          <p>Os valores são exclusivos para compras por atacado.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
