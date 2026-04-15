import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

  return (
    <motion.section style={{ opacity, scale }} className="relative overflow-hidden py-24 md:py-36 lg:py-44">
      {/* Layered background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(220,10%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,10%,50%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary rounded-full blur-[200px]"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-gold rounded-full blur-[180px]"
      />

      {/* Subtle floating lines */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-[10%] w-64 h-64 hidden lg:block"
      >
        <div className="absolute inset-0 border border-border/20 rounded-full" />
        <div className="absolute inset-8 border border-border/10 rounded-full" />
      </motion.div>

      <motion.div style={{ y: parallaxY }} className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Logo with refined glow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-6 bg-primary/5 rounded-3xl blur-3xl" />
              <img
                src="/images/golfield-logo.jpeg"
                alt="Golfield"
                className="relative h-20 md:h-28 rounded-2xl object-contain shadow-2xl shadow-background/50"
              />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <span className="section-badge">
              <Wrench size={12} />
              Orçamentos por Atacado
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92] mb-8 tracking-tight"
          >
            <span className="block text-foreground">Ferramentas</span>
            <span className="block text-gradient-gold mt-1">Premium</span>
            <span className="block text-muted-foreground text-3xl md:text-4xl lg:text-5xl mt-3 font-medium">
              para Profissionais
            </span>
          </motion.h1>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4 mb-10"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Centenas de produtos com preços exclusivos de atacado.
              Monte seu orçamento online e receba atendimento personalizado.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Pedido mínimo para orçamento: R$ 2.000,00
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <motion.a
              href="#produtos"
              className="btn-golfield text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap size={18} />
              Ver Produtos
              <ArrowRight size={18} />
            </motion.a>
            <motion.a
              href="https://wa.me/5511959409051"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-golfield text-base"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <WhatsAppIcon size={18} />
              Falar com Vendedor
            </motion.a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-2xl"
        >
          {[
            { icon: Shield, label: "Qualidade Garantida", desc: "Produtos certificados" },
            { icon: Truck, label: "Envio Nacional", desc: "Para todo o Brasil" },
            { icon: Package, label: `${products.length} Produtos`, desc: "Catálogo completo" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.12 }}
              className="stat-card flex items-center gap-4"
            >
              <div className="p-2.5 rounded-xl bg-primary/10">
                <item.icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </motion.section>
  );
};

export default Hero;
