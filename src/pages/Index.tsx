import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Hero, { FloatingToolVisual } from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useHomeConfig } from "@/hooks/useHomeConfig";
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

const trustIcons = [Star, TrendingUp, Sparkles];
const aboutIcons = [Calendar, Globe, Lightbulb, Sparkles];

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [showAll, setShowAll] = useState(false);
  const { scrollYProgress } = useScroll();
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const { data: dbProducts = [], isLoading } = useProducts();
  const { data: config } = useHomeConfig();

  const products = useMemo(() => dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    category: p.category,
    minQty: p.min_qty,
    mediaType: (p.media_type ?? "image") as "image" | "video",
    videoLoop: (p as any).video_loop ?? true,
    videoAudio: (p as any).video_audio ?? false,
  })), [dbProducts]);

  const normalizeCategory = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch = q === "" || p.name.toLowerCase().includes(q);
      const cat = (p.category ?? "").toString();
      const matchesCategory = activeCategory === "todos" || normalizeCategory(cat) === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, products]);

  // Reset "show all" when filters change so list updates predictably
  useEffect(() => {
    setShowAll(false);
  }, [activeCategory, searchQuery]);

  const isHomepage = activeCategory === "todos" && searchQuery.trim() === "" && !showAll;
  const displayProducts = isHomepage ? filteredProducts.slice(0, 20) : filteredProducts;

  // Section visibility and ordering
  const sections = config?.sections ?? [];
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const isSectionEnabled = (id: string) => sections.find(s => s.id === id)?.enabled !== false;

  const pc = config?.productsSection;
  const cta = config?.ctaSection;
  const about = config?.aboutSection;

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero":
        return isSectionEnabled("hero") ? <Hero config={config?.hero} videoConfig={config?.heroVideo} backgroundColor={config?.appearance?.heroBackgroundColor} sectionTransition={config?.appearance?.sectionTransition} /> : null;

      case "trustBadges":
        return isSectionEnabled("trustBadges") ? (
          <motion.section
            key="trustBadges"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="py-8 sm:py-10 border-b border-border/30 relative overflow-hidden"
          >
            <motion.div
              style={{ y: bgParallax, backgroundImage: `radial-gradient(circle, hsl(0,78%,52%) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
              className="absolute inset-0 opacity-[0.015]"
            />
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 lg:gap-12 text-sm">
                {(config?.trustBadges?.items ?? []).map((item, i) => {
                  const Icon = trustIcons[i % trustIcons.length];
                  return (
                    <motion.div key={i} variants={fadeSlideUp} whileHover={{ scale: 1.08, y: -2 }}
                      className="flex items-center gap-3 text-muted-foreground group cursor-default">
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                        className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Icon size={16} className="text-primary/70 group-hover:text-primary transition-colors" />
                      </motion.div>
                      <span className="group-hover:text-foreground transition-colors text-center sm:text-left">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        ) : null;

      case "products":
        return isSectionEnabled("products") ? (
          <section key="products" id="produtos" className="py-16 sm:py-20 lg:py-28 relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.05, 0.02] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-primary rounded-full blur-[200px]"
            />
            <div className="container mx-auto px-4">
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
                <motion.span variants={scaleIn} className="section-badge mb-6 inline-flex">{pc?.badge}</motion.span>
                <motion.h2 variants={fadeSlideUp} className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4">
                  {pc?.title}{" "}<span className="text-gradient-gold">{pc?.titleHighlight}</span>
                </motion.h2>
                <motion.p variants={fadeSlideUp} className="text-muted-foreground max-w-md mx-auto text-base px-2">{pc?.subtitle}</motion.p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }} className="max-w-lg mx-auto mb-8">
                <div className="relative group">
                  <motion.div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                  <input type="text" placeholder="Buscar ferramentas..." value={searchQuery} onChange={e => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim() !== "") {
                      const el = document.getElementById("produtos");
                      if (el) {
                        const offset = -250;
                        const top = el.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    }
                  }} className="search-input pl-12 relative" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.4 }}>
                <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
              </motion.div>

              <div className="mt-10 sm:mt-12">
                <AnimatePresence mode="wait">
                  {displayProducts.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} className="text-center py-20 sm:py-24 text-muted-foreground">
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}><Search size={48} className="mx-auto mb-4 opacity-20" /></motion.div>
                      <p className="text-2xl font-semibold mb-2">Nenhum produto encontrado</p>
                      <p className="text-sm">Tente outra busca ou categoria</p>
                    </motion.div>
                  ) : (
                    <motion.div key={activeCategory + searchQuery} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {displayProducts.map((product, i) => (<ProductCard key={product.id} product={product} index={i} />))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isHomepage && filteredProducts.length > 20 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12 sm:mt-14">
                    <motion.button onClick={() => setShowAll(true)} whileHover={{ scale: 1.06, y: -3, boxShadow: "0 15px 40px -10px hsl(0,78%,52%,0.3)" }} whileTap={{ scale: 0.97 }} className="gradient-border-animated gradient-border-thin btn-outline-golfield">
                      {pc?.showAllButtonText || "Ver todos os"} {filteredProducts.length} produtos
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight size={16} /></motion.span>
                    </motion.button>
                  </motion.div>
                )}
              </div>

              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="text-center text-xs text-muted-foreground mt-12 sm:mt-16">{pc?.disclaimerText}</motion.p>
            </div>
          </section>
        ) : null;

      case "cta":
        return isSectionEnabled("cta") ? (
          <section key="cta" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,100%) 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
            <motion.div animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }} transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(45deg, transparent 30%, hsl(0,0%,100%,0.15) 50%, transparent 70%)", backgroundSize: "200% 200%" }} />
            <motion.div animate={{ y: [0, -30, 0], rotate: [0, 90, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-[15%] w-16 h-16 border border-primary-foreground/10 rounded-xl hidden sm:block" />
            <motion.div animate={{ y: [0, 20, 0], rotate: [0, -60, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute bottom-20 right-[20%] w-10 h-10 border border-primary-foreground/10 rounded-full hidden sm:block" />

            {/* Floating tools — decorative */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="hidden md:block absolute inset-0 pointer-events-none opacity-90 mix-blend-screen"
              aria-hidden="true"
            >
              <FloatingToolVisual />
            </motion.div>
            <div className="container mx-auto px-4 relative z-10 text-center">
              <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.7 }}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight mb-6">{cta?.title}</motion.h2>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}
                  className="text-primary-foreground/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 px-2">{cta?.description}</motion.p>
                <motion.a href={cta?.buttonLink} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.96 }}
                  className="gradient-border-animated inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-6 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-primary shadow-2xl shadow-background/25">
                  <span className="inline-flex items-center gap-2">{cta?.buttonText}<ArrowRight size={18} /></span>
                </motion.a>
              </motion.div>
            </div>
          </section>
        ) : null;

      case "about":
        return isSectionEnabled("about") ? (
          <section key="about" id="sobre" className="py-16 sm:py-20 md:py-24 relative">
            <div className="container mx-auto px-4">
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
                <motion.div variants={fadeSlideRight}>
                  <span className="section-badge mb-6 inline-flex">{about?.badge}</span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                    {about?.title} <span className="text-gradient-gold">{about?.titleHighlight}</span>
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">{about?.paragraph1}</p>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8">{about?.paragraph2}</p>
                </motion.div>
                <motion.div variants={fadeSlideUp} className="grid sm:grid-cols-2 gap-4">
                  {(about?.features ?? []).map((item, i) => {
                    const Icon = aboutIcons[i % aboutIcons.length];
                    return (
                      <motion.div key={i} whileHover={{ y: -6 }} className="stat-card">
                        <div className="p-2.5 rounded-xl bg-primary/10 w-fit mb-4"><Icon size={18} className="text-primary" /></div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            </div>
          </section>
        ) : null;

      case "footer":
        return isSectionEnabled("footer") ? <Footer key="footer" config={config?.footer} /> : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {sortedSections.map(section => (
        <div key={section.id}>{renderSection(section.id)}</div>
      ))}
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
