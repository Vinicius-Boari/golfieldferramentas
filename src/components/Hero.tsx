import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* Floating SVG tool component */
const FloatingTool = ({ children, delay, duration, yRange, xRange, rotateRange, className }: {
  children: React.ReactNode; delay: number; duration: number;
  yRange: [number, number, number]; xRange: [number, number, number];
  rotateRange: [number, number, number]; className?: string;
}) => (
  <motion.div
    animate={{ y: yRange, x: xRange, rotate: rotateRange }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/* Hammer SVG */
const HammerSVG = ({ size = 90 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
    <defs>
      <linearGradient id="hammerMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,18%,65%)" /><stop offset="100%" stopColor="hsl(215,15%,38%)" />
      </linearGradient>
      <linearGradient id="hammerWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(25,60%,35%)" /><stop offset="50%" stopColor="hsl(25,55%,45%)" /><stop offset="100%" stopColor="hsl(25,60%,35%)" />
      </linearGradient>
    </defs>
    {/* Handle */}
    <rect x="45" y="40" width="10" height="55" rx="3" fill="url(#hammerWood)" />
    <rect x="47" y="42" width="3" height="50" rx="1.5" fill="hsl(25,50%,55%)" opacity="0.3" />
    {/* Head */}
    <rect x="25" y="22" width="50" height="22" rx="4" fill="url(#hammerMetal)" />
    <rect x="25" y="22" width="50" height="3" rx="1.5" fill="hsl(215,20%,75%)" opacity="0.4" />
    {/* Claw */}
    <path d="M25 28 L18 18 Q16 14 20 12" stroke="url(#hammerMetal)" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

/* Screwdriver SVG */
const ScrewdriverSVG = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
    <defs>
      <linearGradient id="sdMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,18%,70%)" /><stop offset="100%" stopColor="hsl(215,15%,42%)" />
      </linearGradient>
      <linearGradient id="sdGrip" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(45,80%,45%)" /><stop offset="50%" stopColor="hsl(45,85%,55%)" /><stop offset="100%" stopColor="hsl(45,80%,45%)" />
      </linearGradient>
    </defs>
    {/* Blade */}
    <rect x="46" y="8" width="8" height="45" rx="2" fill="url(#sdMetal)" />
    <rect x="48" y="10" width="3" height="40" rx="1.5" fill="hsl(215,20%,80%)" opacity="0.3" />
    {/* Tip */}
    <path d="M46 8 L50 2 L54 8Z" fill="hsl(215,15%,50%)" />
    {/* Handle */}
    <rect x="42" y="53" width="16" height="40" rx="6" fill="url(#sdGrip)" />
    <rect x="44" y="56" width="4" height="34" rx="2" fill="hsl(45,80%,65%)" opacity="0.25" />
    {/* Handle lines */}
    {[0,1,2,3,4].map(i => (
      <rect key={i} x="44" y={60 + i * 6} width="12" height="1.5" rx="0.75" fill="hsl(45,70%,38%)" opacity="0.3" />
    ))}
  </svg>
);

/* Pliers SVG */
const PliersSVG = ({ size = 95 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
    <defs>
      <linearGradient id="plierMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,18%,68%)" /><stop offset="100%" stopColor="hsl(215,15%,35%)" />
      </linearGradient>
      <linearGradient id="plierGrip" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(0,70%,38%)" /><stop offset="50%" stopColor="hsl(0,78%,50%)" /><stop offset="100%" stopColor="hsl(0,70%,38%)" />
      </linearGradient>
    </defs>
    {/* Left jaw */}
    <path d="M38 10 Q30 20 35 35 L45 45" stroke="url(#plierMetal)" strokeWidth="7" fill="none" strokeLinecap="round" />
    {/* Right jaw */}
    <path d="M62 10 Q70 20 65 35 L55 45" stroke="url(#plierMetal)" strokeWidth="7" fill="none" strokeLinecap="round" />
    {/* Pivot */}
    <circle cx="50" cy="42" r="5" fill="hsl(215,15%,50%)" />
    <circle cx="50" cy="42" r="2.5" fill="hsl(215,15%,60%)" />
    {/* Left handle */}
    <rect x="34" y="45" width="12" height="48" rx="5" fill="url(#plierGrip)" transform="rotate(-8 40 70)" />
    {/* Right handle */}
    <rect x="54" y="45" width="12" height="48" rx="5" fill="url(#plierGrip)" transform="rotate(8 60 70)" />
    {/* Grip lines left */}
    {[0,1,2,3].map(i => (
      <rect key={`l${i}`} x="36" y={55 + i * 7} width="8" height="1.5" rx="0.75" fill="hsl(0,60%,35%)" opacity="0.35" transform="rotate(-8 40 70)" />
    ))}
  </svg>
);

/* Saw SVG */
const SawSVG = ({ size = 85 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xl">
    <defs>
      <linearGradient id="sawBlade" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,18%,68%)" /><stop offset="100%" stopColor="hsl(215,15%,40%)" />
      </linearGradient>
    </defs>
    {/* Blade */}
    <path d="M15 35 L85 35 L85 50 L15 50Z" fill="url(#sawBlade)" />
    {/* Teeth */}
    {Array.from({ length: 14 }).map((_, i) => (
      <path key={i} d={`M${17 + i * 5} 50 L${19.5 + i * 5} 55 L${22 + i * 5} 50`} fill="url(#sawBlade)" />
    ))}
    {/* Blade shine */}
    <rect x="15" y="36" width="70" height="3" rx="1.5" fill="hsl(215,20%,80%)" opacity="0.3" />
    {/* Handle */}
    <path d="M10 25 Q8 30 10 35 L10 50 Q8 55 12 58 L30 58 L30 52 L20 50 L20 35 L30 33 L30 25Z" fill="hsl(25,55%,40%)" />
    <path d="M12 28 L18 28 L18 52 L14 54 L12 52Z" fill="hsl(25,50%,50%)" opacity="0.3" />
  </svg>
);

/* Main wrench SVG */
const WrenchSVG = () => (
  <svg width="180" height="180" viewBox="0 0 260 260" className="drop-shadow-2xl">
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
      <linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(0, 70%, 40%)" />
        <stop offset="50%" stopColor="hsl(0, 78%, 52%)" />
        <stop offset="100%" stopColor="hsl(0, 70%, 40%)" />
      </linearGradient>
      <filter id="mainShadow">
        <feDropShadow dx="3" dy="6" stdDeviation="10" floodColor="hsl(0,0%,0%)" floodOpacity="0.4"/>
      </filter>
    </defs>
    <rect x="115" y="80" width="30" height="140" rx="5" fill="url(#metalBody)" filter="url(#mainShadow)" />
    <rect x="120" y="82" width="8" height="136" rx="4" fill="url(#metalHighlight)" />
    <rect x="113" y="165" width="34" height="50" rx="6" fill="url(#gripGrad)" />
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x="118" y={172 + i * 5} width="24" height="1.5" rx="0.75" fill="hsl(0,60%,35%)" opacity="0.4" />
    ))}
    <rect x="119" y="168" width="6" height="44" rx="3" fill="hsl(0,78%,65%)" opacity="0.2" />
    <path d="M100 80 L100 30 Q100 18 112 15 L118 14 L118 50 L115 80Z" fill="url(#metalBody)" filter="url(#mainShadow)" />
    <path d="M160 80 L160 30 Q160 18 148 15 L142 14 L142 50 L145 80Z" fill="url(#metalBody)" filter="url(#mainShadow)" />
    <rect x="118" y="14" width="24" height="66" fill="hsl(220,20%,4%)" />
    <rect x="103" y="32" width="5" height="45" rx="2.5" fill="url(#metalHighlight)" opacity="0.6" />
    <rect x="148" y="32" width="5" height="45" rx="2.5" fill="url(#metalHighlight)" opacity="0.4" />
    <text x="130" y="78" textAnchor="middle" fontSize="7" fill="hsl(215,10%,55%)" fontFamily="Inter, sans-serif" fontWeight="600">24mm</text>
  </svg>
);

/* 3D floating tools visual with scroll-based scale */
const FloatingToolVisual = ({ scrollScale }: { scrollScale: any }) => (
  <motion.div style={{ scale: scrollScale }} className="relative w-full h-full flex items-center justify-center min-h-[450px]">
    {/* Glow backdrop */}
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-80 h-80 bg-primary rounded-full blur-[120px]"
    />
    <motion.div
      animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.04, 0.1, 0.04] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute w-60 h-60 bg-gold rounded-full blur-[100px] translate-x-10 translate-y-10"
    />

    {/* Rotating outer ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      className="absolute w-[380px] h-[380px]"
    >
      <div className="absolute inset-0 rounded-full border border-border/10" />
      <div className="absolute inset-5 rounded-full border border-dashed border-border/[0.05]" />
    </motion.div>

    {/* Counter-rotating inner ring */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute w-[260px] h-[260px]"
    >
      <div className="absolute inset-0 rounded-full border border-primary/[0.06]" />
    </motion.div>

    {/* CENTER: Main wrench */}
    <motion.div
      animate={{ rotateY: [0, 18, -12, 0], rotateX: [-6, 6, -6] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="relative z-10"
    >
      <FloatingTool delay={0} duration={5} yRange={[0, -14, 0]} xRange={[0, 0, 0]} rotateRange={[0, 0, 0]}>
        <WrenchSVG />
      </FloatingTool>
    </motion.div>

    {/* TOP-RIGHT: Hammer */}
    <motion.div
      animate={{ rotateY: [-10, 15, -10], rotateX: [5, -5, 5] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="absolute top-2 right-8 z-[5]"
    >
      <FloatingTool delay={0.5} duration={6} yRange={[0, -16, 0]} xRange={[0, 8, 0]} rotateRange={[-10, 10, -10]}>
        <HammerSVG size={85} />
      </FloatingTool>
    </motion.div>

    {/* BOTTOM-LEFT: Screwdriver */}
    <motion.div
      animate={{ rotateY: [10, -20, 10], rotateX: [-5, 8, -5] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="absolute bottom-4 left-4 z-[5]"
    >
      <FloatingTool delay={1} duration={7} yRange={[0, 12, 0]} xRange={[0, -6, 0]} rotateRange={[15, -5, 15]}>
        <ScrewdriverSVG size={80} />
      </FloatingTool>
    </motion.div>

    {/* TOP-LEFT: Pliers */}
    <motion.div
      animate={{ rotateY: [-15, 10, -15], rotateX: [8, -8, 8] }}
      transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="absolute top-12 left-6 z-[5]"
    >
      <FloatingTool delay={1.5} duration={6.5} yRange={[0, -10, 0]} xRange={[0, -8, 0]} rotateRange={[-15, 5, -15]}>
        <PliersSVG size={75} />
      </FloatingTool>
    </motion.div>

    {/* BOTTOM-RIGHT: Saw */}
    <motion.div
      animate={{ rotateY: [12, -18, 12], rotateX: [-6, 6, -6] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="absolute bottom-10 right-4 z-[5]"
    >
      <FloatingTool delay={2} duration={5.5} yRange={[0, 14, 0]} xRange={[0, 6, 0]} rotateRange={[8, -12, 8]}>
        <SawSVG size={80} />
      </FloatingTool>
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
