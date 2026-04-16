import { useState, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/context/CartContext";
import { products } from "@/data/products";
import ToolsBackground3D from "@/components/ToolsBackground3D";
import { Sparkles, TrendingUp, Star, Search, Calendar, Globe, Lightbulb, ArrowRight } from "lucide-react";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const fadeSlideRight = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [showAll, setShowAll] = useState(false);
  const { scrollYProgress } = useScroll();
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "todos" || p.category.toLowerCase().replace(/ /g, '-').replace(/ã/g, 'a').replace(/á/g, 'a').replace(/ê/g, 'e').replace(/í/g, 'i').replace(/â/g, 'a').replace(/ú/g, 'u').replace(/ó/g, 'o') === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const isHomepage = activeCategory === "todos" && searchQuery === "" && !showAll;
  const displayProducts = isHomepage ? filteredProducts.slice(0, 20) : filteredProducts;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <ToolsBackground3D />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Hero />

      {/* Trust bar */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-10 border-b border-border/30 relative overflow-hidden"
      >
        <motion.div
          style={{ y: bgParallax, backgroundImage: `radial-gradient(circle, hsl(0,78%,52%) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
          className="absolute inset-0 opacity-[0.015]"
        />
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 text-sm">
            {[
              { icon: Star, text: "Avaliação 5 estrelas" },
              { icon: TrendingUp, text: "+1000 clientes atendidos" },
              { icon: Sparkles, text: "Qualidade profissional" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeSlideUp}
                whileHover={{ scale: 1.08, y: -2 }}
                className="flex items-center gap-3 text-muted-foreground group cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors"
                >
                  <item.icon size={16} className="text-primary/70 group-hover:text-primary transition-colors" />
                </motion.div>
                <span className="group-hover:text-foreground transition-colors">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Section */}
      <section id="produtos" className="py-28 relative">
        {/* Background decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-primary rounded-full blur-[200px]"
        />

        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={scaleIn} className="section-badge mb-6 inline-flex">Catálogo Completo</motion.span>
            <motion.h2 variants={fadeSlideUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Nossos{" "}
              <span className="text-gradient-gold">Produtos</span>
            </motion.h2>
            <motion.p variants={fadeSlideUp} className="text-muted-foreground max-w-md mx-auto text-base">
              Selecione uma categoria ou busque pelo nome do produto
            </motion.p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="max-w-lg mx-auto mb-8"
          >
            <div className="relative group">
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input pl-12 relative"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </motion.div>

          <div className="mt-12">
            <AnimatePresence mode="wait">
              {displayProducts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="text-center py-24 text-muted-foreground"
                >
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                  </motion.div>
                  <p className="text-2xl font-semibold mb-2">Nenhum produto encontrado</p>
                  <p className="text-sm">Tente outra busca ou categoria</p>
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategory + searchQuery}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  {displayProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {isHomepage && filteredProducts.length > 20 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-14"
              >
                <motion.button
                  onClick={() => setShowAll(true)}
                  whileHover={{ scale: 1.06, y: -3, boxShadow: "0 15px 40px -10px hsl(0,78%,52%,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-outline-golfield"
                >
                  Ver todos os {filteredProducts.length} produtos
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight size={16} />
                  </motion.span>
                </motion.button>
              </motion.div>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-muted-foreground mt-16"
          >
            Os valores são exclusivos para compras por atacado. Entre em contato para mais informações.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,100%) 1px, transparent 0)`, backgroundSize: '24px 24px' }}
        />
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(45deg, transparent 30%, hsl(0,0%,100%,0.15) 50%, transparent 70%)", backgroundSize: "200% 200%" }}
        />
        {/* Animated floating shapes */}
        <motion.div animate={{ y: [0, -30, 0], rotate: [0, 90, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[15%] w-16 h-16 border border-primary-foreground/10 rounded-xl"
        />
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -60, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-20 right-[20%] w-10 h-10 border border-primary-foreground/10 rounded-full"
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-primary-foreground mb-5 tracking-tight"
            >
              Precisa de um Orçamento?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/70 max-w-lg mx-auto mb-10 text-lg"
            >
              Monte seu pedido online ou fale diretamente com nossos vendedores pelo WhatsApp
            </motion.p>
            <motion.a
              href="https://wa.me/5511959409051"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08, y: -4, boxShadow: "0 25px 60px -15px hsl(0,0%,0%,0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-10 py-5 bg-background text-foreground rounded-2xl font-bold text-lg shadow-2xl transition-all"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="hsl(142,70%,45%)">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com Vendedor
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-32 bg-card/20 relative overflow-hidden">
        {/* Decorative bg glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.02, 0.06, 0.02] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[200px]"
        />

        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.span variants={scaleIn} className="section-badge mb-6 inline-flex">Sobre Nós</motion.span>
            <motion.h2 variants={fadeSlideUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Nossa <span className="text-gradient-gold">Missão</span>
            </motion.h2>
            <motion.p variants={fadeSlideUp} className="text-lg text-primary font-medium">Inovação global, confiança local</motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-28"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Globe, text: "Escolher a Golfield é ter a certeza de que você está utilizando ferramentas que são referência nos mercados mais exigentes do mundo. Somos o elo de confiança entre a inovação global e a necessidade local de eficiência e robustez." },
                { icon: Lightbulb, text: "Nosso compromisso é entregar para você e sua empresa os melhores equipamentos do mercado, unindo tecnologia de ponta e design. Trabalhamos com ferramentas manuais, elétricas, sistemas de fixação, materiais abrasivos e produtos para construção e manutenção industrial." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeSlideRight}
                  whileHover={{ y: -6, borderColor: "hsl(0,78%,52%,0.3)", boxShadow: "0 20px 50px -15px hsl(0,0%,0%,0.3)" }}
                  className="stat-card p-8 transition-all duration-500"
                >
                  <motion.div whileHover={{ rotate: 360, scale: 1.15 }} transition={{ duration: 0.6 }} className="p-3 rounded-xl bg-primary/10 inline-flex mb-6">
                    <item.icon className="text-primary" size={26} />
                  </motion.div>
                  <p className="text-muted-foreground leading-relaxed text-sm">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trajetória */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={scaleIn} className="section-badge mb-6 inline-flex">Nossa Trajetória</motion.span>
            <motion.h3 variants={fadeSlideUp} className="text-3xl md:text-5xl font-bold tracking-tight">
              Uma História de Crescimento
            </motion.h3>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto"
          >
            {[
              { year: "2004", title: "FUNDAÇÃO", desc: "Início das operações em São Paulo, com foco em importação de ferramentas de qualidade." },
              { year: "2010", title: "EXPANSÃO NACIONAL", desc: "Consolidação da marca GolField e expansão para atendimento em todo o Brasil." },
              { year: "2023", title: "LINHA GOL-HOME", desc: "Lançamento da marca Gol-Home para o segmento de hidráulica e utilidades domésticas." },
              { year: "2026", title: "FEICON", desc: "Participação na maior feira da construção civil da América Latina, apresentando inovações." },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeSlideUp}
                whileHover={{ y: -8, borderColor: "hsl(0,78%,52%,0.4)", scale: 1.02 }}
                className="stat-card p-7 group cursor-default transition-all duration-500"
              >
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Calendar className="text-primary/40 group-hover:text-primary transition-colors mb-4" size={22} />
                </motion.div>
                <motion.h4
                  className="text-4xl font-bold text-primary tracking-tight mb-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.year}
                </motion.h4>
                <p className="font-semibold text-xs tracking-wider uppercase mb-3 text-foreground/80">{item.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
};

const Index = () => (
  <CartProvider>
    <IndexContent />
  </CartProvider>
);

export default Index;
