import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileMotionEnabled } from "@/hooks/useMobileMotion";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

import toolWrench from "@/assets/tool-wrench.webp";
import toolHammer from "@/assets/tool-hammer.webp";
import toolScrewdriver from "@/assets/tool-screwdriver.webp";
import toolPliers from "@/assets/tool-pliers.webp";
import toolTape from "@/assets/tool-tape.webp";
import toolDrillbit from "@/assets/tool-drillbit.webp";

export const FloatingToolVisual = ({ scrollScale }: { scrollScale?: any }) => {
  const tools = [
    // Center cluster
    { src: toolWrench, alt: "Chave inglesa", size: "w-44 h-44 md:w-56 md:h-56", pos: "relative z-10", float: { y: [0, -18, 0], rotate: [0, 8, -6, 0] }, dur: 9, delay: 0 },
    { src: toolHammer, alt: "Martelo", size: "w-28 h-28 md:w-36 md:h-36", pos: "absolute -top-2 right-2 z-[5]", float: { y: [0, -20, 0], x: [0, 10, 0], rotate: [-8, 8, -8] }, dur: 11, delay: 1 },
    { src: toolScrewdriver, alt: "Chave de fenda", size: "w-24 h-32 md:w-32 md:h-40", pos: "absolute bottom-0 -left-2 z-[5]", float: { y: [0, 16, 0], x: [0, -8, 0], rotate: [12, -6, 12] }, dur: 12, delay: 2 },
    { src: toolPliers, alt: "Alicate", size: "w-28 h-28 md:w-36 md:h-36", pos: "absolute top-6 -left-4 z-[5]", float: { y: [0, -14, 0], x: [0, -10, 0], rotate: [-12, 4, -12] }, dur: 10, delay: 3 },
    { src: toolTape, alt: "Trena", size: "w-24 h-24 md:w-32 md:h-32", pos: "absolute bottom-4 right-0 z-[5]", float: { y: [0, 18, 0], x: [0, 8, 0], rotate: [6, -10, 6] }, dur: 11, delay: 1.5 },
    { src: toolDrillbit, alt: "Broca", size: "w-16 h-32 md:w-20 md:h-40", pos: "absolute top-1/2 -translate-y-1/2 -right-6 z-[4]", float: { y: [0, -12, 0], rotate: [20, 32, 20] }, dur: 13, delay: 4 },
    // Extra spread tools
    { src: toolWrench, alt: "Chave inglesa 2", size: "w-20 h-20 md:w-28 md:h-28", pos: "absolute -top-16 left-[15%] z-[3]", float: { y: [0, -22, 0], x: [0, 6, 0], rotate: [10, -15, 10] }, dur: 14, delay: 0.5 },
    { src: toolHammer, alt: "Martelo 2", size: "w-20 h-20 md:w-28 md:h-28", pos: "absolute -bottom-12 right-[18%] z-[3]", float: { y: [0, 14, 0], x: [0, -7, 0], rotate: [-6, 12, -6] }, dur: 12, delay: 2.5 },
    { src: toolPliers, alt: "Alicate 2", size: "w-16 h-16 md:w-24 md:h-24", pos: "absolute top-[10%] right-[25%] z-[3]", float: { y: [0, -16, 0], x: [0, 12, 0], rotate: [-8, 8, -8] }, dur: 13, delay: 1.8 },
    { src: toolScrewdriver, alt: "Chave de fenda 2", size: "w-14 h-20 md:w-20 md:h-28", pos: "absolute bottom-[15%] left-[20%] z-[3]", float: { y: [0, 20, 0], rotate: [-15, 5, -15] }, dur: 12, delay: 3.5 },
    { src: toolTape, alt: "Trena 2", size: "w-16 h-16 md:w-24 md:h-24", pos: "absolute -top-8 right-[5%] z-[3]", float: { y: [0, -14, 0], x: [0, -10, 0], rotate: [8, -8, 8] }, dur: 13, delay: 0.8 },
    { src: toolDrillbit, alt: "Broca 2", size: "w-12 h-24 md:w-16 md:h-32", pos: "absolute bottom-[5%] right-[35%] z-[3]", float: { y: [0, -10, 0], rotate: [15, 28, 15] }, dur: 15, delay: 4.5 },
  ];

  return (
    <motion.div style={{ scale: scrollScale }} className="relative w-full h-full flex items-center justify-center min-h-[500px]" >
      {/* Static gradient blobs (no per-frame blur recompute) */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-72 h-72 bg-gold/[0.06] rounded-full blur-[120px] translate-x-16 translate-y-12 pointer-events-none" />

      {/* Decorative rings — single rotation, GPU-friendly */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[420px] h-[420px] pointer-events-none will-change-transform"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="absolute inset-0 rounded-full border border-border/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/25" />
      </motion.div>

      {tools.map((tool, i) => (
        <motion.div
          key={tool.alt}
          animate={tool.float}
          transition={{ duration: tool.dur, repeat: Infinity, ease: "easeInOut", delay: tool.delay || 0 }}
          className={`${tool.pos} will-change-transform`}
          style={{ transform: "translateZ(0)" }}
        >
          <img
            src={tool.src}
            alt={tool.alt}
            className={`${tool.size} object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]`}
            width={512}
            height={512}
            {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const, decoding: "async" as const })}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

interface HeroProps {
  config?: {
    logoImage?: string;
    badgeText?: string;
    titleLine1?: string;
    titleLine2?: string;
    titleLine3?: string;
    description?: string;
    minOrderText?: string;
    ctaButtonText?: string;
    ctaButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    stats?: { label: string; desc: string }[];
  };
  videoConfig?: {
    enabled?: boolean;
    url?: string;
    loop?: boolean;
    muted?: boolean;
    overlayOpacity?: number;
    overlayEnabled?: boolean;
    overlayColor?: string;
  };
  /** Solid background color (HEX) for the Hero section. */
  backgroundColor?: string;
  /** Gradient transition overlay between Hero and the next section. */
  sectionTransition?: {
    enabled?: boolean;
    fromColor?: string;
    toColor?: string;
    direction?: "vertical" | "inverted";
    height?: number;
    intensity?: number;
  };
}

const Hero = ({ config, videoConfig, backgroundColor, sectionTransition }: HeroProps) => {
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();
  const motionEnabled = useMobileMotionEnabled();
  const parallaxY = useTransform(scrollY, [0, 600], [0, isMobile ? 40 : 120]);
  const toolScale = useTransform(scrollY, [0, 300, 600], [1, 1.18, 0.82]);
  const [videoFailed, setVideoFailed] = React.useState(false);

  // On mobile with motion disabled, never render the decorative hero video.
  const showVideo = !!(videoConfig?.enabled && videoConfig?.url && !videoFailed && motionEnabled);
  const overlayEnabled = videoConfig?.overlayEnabled !== false;
  const overlay = Math.min(1, Math.max(0, videoConfig?.overlayOpacity ?? 0.55));
  const overlayColor = videoConfig?.overlayColor || "#000000";
  const heroBg = backgroundColor || "#1E1E1E";

  return (
    <section
      data-edit-id="hero.section"
      className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 md:py-32 lg:py-40"
      style={{ backgroundColor: heroBg }}
    >
      {/* Solid Hero background — fully independent of the global site background.
          Uses an inline style with setProperty('important') so it always wins
          over any global rule (Tailwind utilities, theme tokens, etc.). */}
      <div
        className="absolute inset-0"
        ref={(el) => {
          if (el) el.style.setProperty("background-color", heroBg, "important");
        }}
      />

      {showVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ backgroundColor: heroBg }}
          aria-hidden="true"
        >
          <motion.video
            key={videoConfig!.url}
            src={videoConfig!.url}
            autoPlay
            muted={videoConfig?.muted !== false}
            loop={videoConfig?.loop !== false}
            playsInline
            preload="metadata"
            poster={config?.logoImage}
            data-decorative="true"
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          {overlayEnabled && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: overlayColor, opacity: overlay }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </motion.div>
      )}

      <div className={`absolute inset-0 opacity-[0.02] ${showVideo ? "hidden" : ""}`}
        style={{
          backgroundImage: `linear-gradient(hsl(220,10%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,10%,50%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
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
        <div className="max-w-3xl mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="mb-8 md:mb-12"
            >
              <div className="relative group w-fit max-w-full">
                <motion.div
                  animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-5 md:-inset-8 bg-gradient-to-br from-primary/15 via-gold/10 to-primary/15 rounded-[2rem] blur-[40px]"
                />
                <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/20 via-transparent to-gold/15 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <img data-edit-id="hero.logo" src={config?.logoImage || "/images/bb415772-a3bf-433b-bd51-77e20e6dbf5f.png"} alt="Golfield" className="relative h-28 sm:h-32 md:h-52 lg:h-64 w-auto max-w-full rounded-2xl object-contain shadow-2xl shadow-primary/10 bg-card/40 p-3 sm:p-4 md:p-6 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-6 md:mb-8">
              <span data-edit-id="hero.badge" className="section-badge max-w-full">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}><Wrench size={12} /></motion.span>
                {config?.badgeText || "Orçamentos por Atacado"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.92] mb-6 md:mb-8 tracking-tight"
              data-edit-id="hero.title"
            >
              <motion.span data-edit-id="hero.title.line1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="block text-foreground">{config?.titleLine1 || "Ferramentas"}</motion.span>
              <motion.span data-edit-id="hero.title.line2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.45 }} className="block text-gradient-gold mt-1">{config?.titleLine2 || "Premium"}</motion.span>
              <motion.span data-edit-id="hero.title.line3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="block text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl mt-3 font-medium">{config?.titleLine3 || "para Profissionais"}</motion.span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="space-y-4 mb-8 md:mb-10">
              <p data-edit-id="hero.description" className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                {config?.description || "Centenas de produtos com preços exclusivos de atacado. Monte seu orçamento online e receba atendimento personalizado."}
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="inline-flex max-w-full items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium text-primary"
                data-edit-id="hero.minOrder"
              >
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="truncate sm:text-wrap">{config?.minOrderText || "Pedido mínimo para orçamento: R$ 2.000,00"}</span>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.a data-edit-id="hero.cta.primary" href={config?.ctaButtonLink || "#produtos"} className="gradient-border-animated btn-golfield text-base justify-center" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Zap size={18} /> {config?.ctaButtonText || "Ver Produtos"} <ArrowRight size={18} />
              </motion.a>
              <motion.a data-edit-id="hero.cta.secondary" href={config?.secondaryButtonLink || "https://wa.me/5511959409051"} target="_blank" rel="noopener noreferrer" className="gradient-border-animated gradient-border-thin btn-outline-golfield text-base justify-center" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <WhatsAppIcon size={18} /> {config?.secondaryButtonText || "Falar com Vendedor"}
              </motion.a>
            </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-16 md:mt-20 max-w-2xl"
          data-edit-id="hero.stats"
        >
          {(config?.stats ?? [
            { label: "Qualidade Garantida", desc: "Produtos certificados" },
            { label: "Envio Nacional", desc: "Para todo o Brasil" },
            { label: `${products.length} Produtos`, desc: "Catálogo completo" },
          ]).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.12 }}
              whileHover={{ y: -4, borderColor: "hsl(0, 78%, 52%)" }}
              className="stat-card flex items-center gap-4"
            >
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="p-2.5 rounded-xl bg-primary/10">
                {[Shield, Truck, Package][i % 3] && (() => { const Icon = [Shield, Truck, Package][i % 3]; return <Icon size={18} className="text-primary" />; })()}
              </motion.div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {(() => {
        const st = sectionTransition;
        if (st?.enabled === false) return null;
        const from = st?.fromColor || "#000000";
        const to = st?.toColor || "#5C5C5C";
        const height = Math.max(0, st?.height ?? 96);
        const intensity = Math.min(1, Math.max(0, st?.intensity ?? 1));
        const dir = st?.direction === "inverted" ? "to top" : "to bottom";
        return (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
            style={{
              height: `${height}px`,
              backgroundImage: `linear-gradient(${dir}, ${from} 0%, ${to} 100%)`,
              opacity: intensity,
            }}
          />
        );
      })()}
    </section>
  );
};

export default Hero;
