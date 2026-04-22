import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface IconProps { size?: number; className?: string }

const InstagramIcon = forwardRef<SVGSVGElement, IconProps>(({ size = 20, className }, ref) => (
  <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
));
InstagramIcon.displayName = "InstagramIcon";

const WhatsAppIcon = forwardRef<SVGSVGElement, IconProps>(({ size = 20, className }, ref) => (
  <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
));
WhatsAppIcon.displayName = "WhatsAppIcon";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

interface FooterProps {
  config?: {
    description?: string;
    phone?: string;
    email?: string;
    location?: string;
    hours?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    categories?: string[];
  };
}

const Footer = ({ config }: FooterProps) => {
  const desc = config?.description || "Ferramentas premium com preços de atacado. Distribuímos para todo o Brasil com qualidade garantida e atendimento personalizado.";
  const phone = config?.phone || "(11) 95940-9051";
  const email = config?.email || "paula.profield@hotmail.com";
  const location = config?.location || "São Paulo - SP, Brasil";
  const hours = config?.hours || "Seg a Sex: 7h às 18h";
  const igUrl = config?.instagramUrl || "https://www.instagram.com/golfield.ferramentas/";
  const waUrl = config?.whatsappUrl || "https://wa.me/5511959409051";
  const cats = config?.categories || ["Alicates", "Brocas", "Discos", "Chaves", "Trenas", "Torneiras", "Martelos", "Serras"];
  const waPhone = waUrl.includes("wa.me") ? waUrl : "https://wa.me/5511959409051";

  return (
    <footer id="contato" data-edit-id="footer.section" className="relative border-t border-border/50 bg-card/30">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="container mx-auto px-4 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <img
              src="/images/golfield-logo.jpeg"
              alt="Golfield"
              className="h-14 rounded-xl object-contain mb-5"
              data-edit-id="footer.logo"
            />
            <p data-edit-id="footer.description" className="text-sm leading-relaxed max-w-sm mb-6 text-primary-foreground">
              {desc}
            </p>
            <div className="flex gap-2">
              <motion.a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-all duration-300 text-primary-foreground"
              >
                <InstagramIcon size={18} />
              </motion.a>
              <motion.a
                href={waPhone}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-all duration-300 text-primary-foreground"
              >
                <WhatsAppIcon size={18} className="text-primary-foreground" />
              </motion.a>
            </div>
          </motion.div>

          {/* Contato */}
          <motion.div variants={itemVariants} className="md:col-span-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-5 text-primary-foreground">Contato</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href={waPhone} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors group text-primary-foreground">
                  <Phone size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-3 transition-colors group text-primary-foreground">
                  <Mail size={14} className="text-primary/60 group-hover:text-primary transition-colors" />
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-primary/60 flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground">{location}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={14} className="text-primary/60 flex-shrink-0" />
                <span className="text-primary-foreground">{hours}</span>
              </li>
            </ul>
          </motion.div>

          {/* Categorias */}
          <motion.div variants={itemVariants} className="md:col-span-3">
            <h3 className="text-sm font-semibold tracking-wider uppercase mb-5 text-primary-foreground">Categorias</h3>
            <ul className="space-y-2.5 text-sm">
              {cats.map((cat) => (
                <li key={cat}>
                  <a href="#produtos" className="flex items-center gap-1.5 transition-colors group text-primary-foreground">
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground"
        >
          <p className="text-primary-foreground">© {new Date().getFullYear()} Golfield. Todos os direitos reservados.</p>
          <Link to="/admin/login" className="transition-colors cursor-pointer text-[10px] text-primary-foreground">
            Painel
          </Link>
          <p className="text-primary-foreground">Os valores são exclusivos para compras por atacado.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
