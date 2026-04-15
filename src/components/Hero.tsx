import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

import toolWrench from "@/assets/tool-wrench.png";
import toolHammer from "@/assets/tool-hammer.png";
import toolScrewdriver from "@/assets/tool-screwdriver.png";
import toolPliers from "@/assets/tool-pliers.png";
import toolTape from "@/assets/tool-tape.png";
import toolDrillbit from "@/assets/tool-drillbit.png";

/* ========== FLOATING TOOL VISUAL ========== */
const FloatingToolVisual = ({ scrollScale }: { scrollScale: any }) => {
  const tools = [
    { src: toolWrench, alt: "Chave inglesa", size: "w-44 h-44 md:w-56 md:h-56", pos: "relative z-10", float: { y: [0, -18, 0] }, rotate3d: { rotateY: [0, 25, -18, 0], rotateX: [-8, 10, -8] }, dur: 12, floatDur: 5 },
    { src: toolHammer, alt: "Martelo", size: "w-28 h-28 md:w-36 md:h-36", pos: "absolute -top-2 right-2 z-[5]", float: { y: [0, -20, 0], x: [0, 10, 0], rotate: [-8, 8, -8] }, rotate3d: { rotateY: [-12, 22, -12], rotateX: [6, -8, 6] }, dur: 14, floatDur: 7, delay: 1 },
    { src: toolScrewdriver, alt: "Chave de fenda", size: "w-24 h-32 md:w-32 md:h-40", pos: "absolute bottom-0 -left-2 z-[5]", float: { y: [0, 16, 0], x: [0, -8, 0], rotate: [12, -6, 12] }, rotate3d: { rotateY: [15, -25, 15], rotateX: [-6, 10, -6] }, dur: 13, floatDur: 8, delay: 2 },
    { src: toolPliers, alt: "Alicate", size: "w-28 h-28 md:w-36 md:h-36", pos: "absolute top-6 -left-4 z-[5]", float: { y: [0, -14, 0], x: [0, -10, 0], rotate: [-12, 4, -12] }, rotate3d: { rotateY: [-18, 15, -18], rotateX: [10, -10, 10] }, dur: 15, floatDur: 7.5, delay: 3 },
    { src: toolTape, alt: "Trena", size: "w-24 h-24 md:w-32 md:h-32", pos: "absolute bottom-4 right-0 z-[5]", float: { y: [0, 18, 0], x: [0, 8, 0], rotate: [6, -10, 6] }, rotate3d: { rotateY: [10, -20, 10], rotateX: [-8, 8, -8] }, dur: 11, floatDur: 6.5, delay: 1.5 },
    { src: toolDrillbit, alt: "Broca", size: "w-16 h-32 md:w-20 md:h-40", pos: "absolute top-1/2 -translate-y-1/2 -right-6 z-[4]", float: { y: [0, -12, 0], rotate: [20, 35, 20] }, rotate3d: { rotateY: [-8, 18, -8], rotateX: [5, -12, 5] }, dur: 16, floatDur: 9, delay: 4 },
  ];

  return (
    <motion.div style={{ scale: scrollScale }} className="relative w-full h-full flex items-center justify-center min-h-[500px]">
      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.06, 0.16, 0.06] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-primary rounded-full blur-[140px]"
      />
      <motion.div
        animate={{ scale: [1.2, 0.85, 1.2], opacity: [0.03, 0.1, 0.03] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute w-72 h-72 bg-gold rounded-full blur-[120px] translate-x-16 translate-y-12"
      />

      {/* Rotating orbital rings */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute w-[420px] h-[420px]">
        <div className="absolute inset-0 rounded-full border border-border/8" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/25" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold/20" />
      </motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute w-[300px] h-[300px]">
        <div className="absolute inset-0 rounded-full border border-primary/[0.05]" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/20 blur-[1px]" />
      </motion.div>

      {/* Realistic tool images */}
      {tools.map((tool, i) => (
        <motion.div
          key={tool.alt}
          animate={tool.rotate3d}
          transition={{ duration: tool.dur, repeat: Infinity, ease: "easeInOut", delay: tool.delay || 0 }}
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
          className={tool.pos}
        >
          <motion.div
            animate={tool.float}
            transition={{ duration: tool.floatDur, repeat: Infinity, ease: "easeInOut", delay: (tool.delay || 0) * 0.5 }}
          >
            <img
              src={tool.src}
              alt={tool.alt}
              className={`${tool.size} object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]`}
              width={512}
              height={512}
              {...(i === 0 ? {} : { loading: "lazy" as const })}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`p${i}`}
          animate={{
            y: [0, -30 - i * 10, 0],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            top: `${20 + i * 12}%`,
            left: `${15 + i * 13}%`,
          }}
        />
      ))}
    </motion.div>
  );
};

/* ========== HERO COMPONENT ========== */
const Hero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const toolScale = useTransform(scrollY, [0, 300, 600], [1, 1.18, 0.82]);

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 opacity-[0.02]"
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="mb-12"
            >
              <div className="relative inline-block group">
                <motion.div
                  animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 bg-gradient-to-br from-primary/15 via-gold/10 to-primary/15 rounded-[2rem] blur-[40px]"
                />
                <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/20 via-transparent to-gold/15 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <img src="/images/golfield-logo.jpeg" alt="Golfield" className="relative h-32 md:h-44 lg:h-52 w-auto min-w-[280px] md:min-w-[360px] lg:min-w-[420px] rounded-2xl object-contain shadow-2xl shadow-primary/10 bg-card/40 p-3 md:p-4 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
              <span className="section-badge">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}><Wrench size={12} /></motion.span>
                Orçamentos por Atacado
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.92] mb-8 tracking-tight"
            >
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="block text-foreground">Ferramentas</motion.span>
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.45 }} className="block text-gradient-gold mt-1">Premium</motion.span>
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="block text-muted-foreground text-3xl md:text-4xl lg:text-4xl xl:text-5xl mt-3 font-medium">para Profissionais</motion.span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="space-y-4 mb-10">
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Centenas de produtos com preços exclusivos de atacado. Monte seu orçamento online e receba atendimento personalizado.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium text-primary"
              >
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                Pedido mínimo para orçamento: R$ 2.000,00
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-wrap gap-4">
              <motion.a href="#produtos" className="btn-golfield text-base" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Zap size={18} /> Ver Produtos <ArrowRight size={18} />
              </motion.a>
              <motion.a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="btn-outline-golfield text-base" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <WhatsAppIcon size={18} /> Falar com Vendedor
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="hidden lg:flex items-center justify-center min-h-[500px]"
          >
            <FloatingToolVisual scrollScale={toolScale} />
          </motion.div>
        </div>

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
              whileHover={{ y: -4, borderColor: "hsl(0, 78%, 52%)" }}
              className="stat-card flex items-center gap-4"
            >
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="p-2.5 rounded-xl bg-primary/10">
                <item.icon size={18} className="text-primary" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
