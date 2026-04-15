import { motion } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 gradient-dark" />
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,50%) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Wrench size={14} />
              Site Exclusivo para Orçamentos por Atacado
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold leading-[0.95] mb-6"
          >
            Ferramentas
            <br />
            <span className="text-gradient-gold">Premium</span>
            <br />
            para Profissionais
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8 leading-relaxed"
          >
            Centenas de produtos com preços exclusivos de atacado. 
            Monte seu orçamento online e receba atendimento personalizado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <a href="#produtos" className="btn-golfield text-base">
              Ver Produtos
              <ArrowRight size={18} />
            </a>
            <a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="btn-outline-golfield text-base">
              Falar com Vendedor
            </a>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-2xl"
        >
          {[
            { icon: Shield, label: "Qualidade Garantida", desc: "Produtos certificados" },
            { icon: Truck, label: "Envio Nacional", desc: "Para todo o Brasil" },
            { icon: Wrench, label: "+400 Produtos", desc: "Catálogo completo" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="p-2 rounded-lg gradient-primary">
                <item.icon size={18} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
