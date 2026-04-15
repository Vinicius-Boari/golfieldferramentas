import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* 3D-style floating tool illustration using pure SVG/CSS */
const FloatingToolVisual = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Glow backdrop */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-72 h-72 bg-primary rounded-full blur-[100px]"
    />

    {/* Main wrench - 3D perspective */}
    <motion.div
      animate={{
        rotateY: [0, 15, -10, 0],
        rotateX: [-5, 5, -5],
        rotateZ: [-5, 0, -5],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="220" height="220" viewBox="0 0 200 200" className="drop-shadow-2xl">
          {/* Wrench body */}
          <defs>
            <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(220, 15%, 65%)" />
              <stop offset="50%" stopColor="hsl(220, 15%, 45%)" />
              <stop offset="100%" stopColor="hsl(220, 15%, 30%)" />
            </linearGradient>
            <linearGradient id="wrenchShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(220, 10%, 80%)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="hsl(220, 10%, 90%)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(220, 10%, 80%)" stopOpacity="0" />
            </linearGradient>
            <filter id="wrenchShadow">
              <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="hsl(0, 0%, 0%)" floodOpacity="0.4"/>
            </filter>
          </defs>
          {/* Handle */}
          <rect x="70" y="60" width="20" height="110" rx="6" fill="url(#wrenchGrad)" filter="url(#wrenchShadow)" transform="rotate(-30 100 100)" />
          {/* Handle grip lines */}
          <rect x="73" y="120" width="14" height="2" rx="1" fill="hsl(220,10%,55%)" transform="rotate(-30 100 100)" opacity="0.5" />
          <rect x="73" y="128" width="14" height="2" rx="1" fill="hsl(220,10%,55%)" transform="rotate(-30 100 100)" opacity="0.5" />
          <rect x="73" y="136" width="14" height="2" rx="1" fill="hsl(220,10%,55%)" transform="rotate(-30 100 100)" opacity="0.5" />
          {/* Head - open end */}
          <path d="M60 45 L55 25 Q80 10 105 25 L100 45 Q80 55 60 45Z" fill="url(#wrenchGrad)" filter="url(#wrenchShadow)" transform="rotate(-30 100 100)" />
          {/* Jaw opening */}
          <path d="M68 35 L72 20 Q80 15 88 20 L92 35 Q80 42 68 35Z" fill="hsl(220, 20%, 4%)" transform="rotate(-30 100 100)" />
          {/* Shine */}
          <rect x="72" y="60" width="6" height="90" rx="3" fill="url(#wrenchShine)" transform="rotate(-30 100 100)" />
        </svg>
      </motion.div>
    </motion.div>

    {/* Orbiting elements */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute w-64 h-64"
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/40"
      />
      <motion.div
        animate={{ scale: [1.2, 0.8, 1.2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gold/30"
      />
    </motion.div>

    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute w-80 h-80 border border-border/10 rounded-full"
    />

    {/* Small floating tool icons */}
    <motion.div
      animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-8 right-8 p-3 rounded-xl glass-card"
    >
      <Shield size={20} className="text-primary/60" />
    </motion.div>

    <motion.div
      animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-12 left-8 p-3 rounded-xl glass-card"
    >
      <Package size={20} className="text-gold/60" />
    </motion.div>
  </div>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
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

      <motion.div style={{ y: parallaxY }} className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text content */}
          <div>
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.92] mb-8 tracking-tight"
            >
              <span className="block text-foreground">Ferramentas</span>
              <span className="block text-gradient-gold mt-1">Premium</span>
              <span className="block text-muted-foreground text-3xl md:text-4xl lg:text-4xl xl:text-5xl mt-3 font-medium">
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

          {/* Right: 3D Tool Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="hidden lg:flex items-center justify-center min-h-[420px]"
          >
            <FloatingToolVisual />
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
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
