import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* 3D floating tool visual with scroll-based scale */
const FloatingToolVisual = ({ scrollScale }: { scrollScale: any }) => (
  <motion.div style={{ scale: scrollScale }} className="relative w-full h-full flex items-center justify-center">
    {/* Glow backdrop */}
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.22, 0.1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-80 h-80 bg-primary rounded-full blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.05, 0.12, 0.05] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute w-60 h-60 bg-gold rounded-full blur-[100px] translate-x-10 translate-y-10"
    />

    {/* Rotating outer ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute w-[340px] h-[340px]"
    >
      <div className="absolute inset-0 rounded-full border border-border/10" />
      <div className="absolute inset-4 rounded-full border border-dashed border-border/[0.06]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold/25" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/20" />
    </motion.div>

    {/* Counter-rotating inner ring */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute w-[240px] h-[240px]"
    >
      <div className="absolute inset-0 rounded-full border border-primary/[0.08]" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/20 blur-[1px]" />
    </motion.div>

    {/* Main wrench - upright, 3D perspective rotation */}
    <motion.div
      animate={{
        rotateY: [0, 20, -15, 0],
        rotateX: [-8, 8, -8],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="relative z-10"
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260" className="drop-shadow-2xl">
          <defs>
            <linearGradient id="metalBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(215, 20%, 72%)" />
              <stop offset="30%" stopColor="hsl(215, 18%, 55%)" />
              <stop offset="70%" stopColor="hsl(215, 15%, 42%)" />
              <stop offset="100%" stopColor="hsl(215, 12%, 32%)" />
            </linearGradient>
            <linearGradient id="metalHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(215, 20%, 85%)" stopOpacity="0.5" />
              <stop offset="30%" stopColor="hsl(215, 20%, 85%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="hsl(215, 20%, 85%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="metalEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(215, 12%, 30%)" />
              <stop offset="100%" stopColor="hsl(215, 18%, 50%)" />
            </linearGradient>
            <linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 70%, 40%)" />
              <stop offset="50%" stopColor="hsl(0, 78%, 52%)" />
              <stop offset="100%" stopColor="hsl(0, 70%, 40%)" />
            </linearGradient>
            <filter id="mainShadow">
              <feDropShadow dx="4" dy="8" stdDeviation="12" floodColor="hsl(0,0%,0%)" floodOpacity="0.45"/>
            </filter>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Wrench handle - vertical/upright */}
          <rect x="115" y="80" width="30" height="140" rx="5" fill="url(#metalBody)" filter="url(#mainShadow)" />
          {/* Handle left edge bevel */}
          <rect x="115" y="80" width="4" height="140" rx="2" fill="url(#metalEdge)" opacity="0.6" />
          {/* Handle shine */}
          <rect x="120" y="82" width="8" height="136" rx="4" fill="url(#metalHighlight)" />

          {/* Red rubber grip */}
          <rect x="113" y="165" width="34" height="50" rx="6" fill="url(#gripGrad)" />
          <rect x="116" y="168" width="28" height="44" rx="4" fill="url(#gripGrad)" opacity="0.9" />
          {/* Grip texture lines */}
          {[0,1,2,3,4,5,6,7].map(i => (
            <rect key={i} x="118" y={172 + i * 5} width="24" height="1.5" rx="0.75" fill="hsl(0,60%,35%)" opacity="0.4" />
          ))}
          {/* Grip highlight */}
          <rect x="119" y="168" width="6" height="44" rx="3" fill="hsl(0,78%,65%)" opacity="0.2" />

          {/* Wrench head - open jaw */}
          <path d="M100 80 L100 30 Q100 18 112 15 L118 14 L118 50 L115 80Z" fill="url(#metalBody)" filter="url(#mainShadow)" />
          <path d="M160 80 L160 30 Q160 18 148 15 L142 14 L142 50 L145 80Z" fill="url(#metalBody)" filter="url(#mainShadow)" />
          {/* Jaw inner faces */}
          <rect x="118" y="14" width="24" height="66" fill="hsl(220,20%,4%)" />
          {/* Jaw top edges */}
          <rect x="100" y="28" width="18" height="3" rx="1.5" fill="hsl(215,18%,60%)" opacity="0.3" />
          <rect x="142" y="28" width="18" height="3" rx="1.5" fill="hsl(215,18%,60%)" opacity="0.3" />
          {/* Head bevel highlights */}
          <rect x="100" y="30" width="3" height="50" rx="1.5" fill="hsl(215,20%,70%)" opacity="0.3" />
          <rect x="157" y="30" width="3" height="50" rx="1.5" fill="hsl(215,12%,35%)" opacity="0.3" />
          {/* Head shine */}
          <rect x="103" y="32" width="5" height="45" rx="2.5" fill="url(#metalHighlight)" opacity="0.6" />
          <rect x="148" y="32" width="5" height="45" rx="2.5" fill="url(#metalHighlight)" opacity="0.4" />

          {/* Size marking on head */}
          <text x="130" y="78" textAnchor="middle" fontSize="7" fill="hsl(215,10%,55%)" fontFamily="Inter, sans-serif" fontWeight="600">24mm</text>
        </svg>
      </motion.div>
    </motion.div>

    {/* Floating glass cards with tool icons */}
    <motion.div
      animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className="absolute top-4 right-4 p-3.5 rounded-2xl glass-card shadow-xl"
    >
      <Shield size={22} className="text-primary/70" />
    </motion.div>

    <motion.div
      animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      className="absolute bottom-8 left-4 p-3.5 rounded-2xl glass-card shadow-xl"
    >
      <Package size={22} className="text-gold/70" />
    </motion.div>

    <motion.div
      animate={{ y: [0, -8, 0], x: [0, -4, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      className="absolute top-16 left-12 p-3 rounded-2xl glass-card shadow-xl"
    >
      <Wrench size={18} className="text-foreground/40" />
    </motion.div>
  </motion.div>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const toolScale = useTransform(scrollY, [0, 300, 600], [1, 1.15, 0.85]);

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
            <FloatingToolVisual scrollScale={toolScale} />
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
