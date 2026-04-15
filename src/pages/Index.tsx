import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/context/CartContext";
import { products } from "@/data/products";

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "todos" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Hero />

      {/* Products Section */}
      <section id="produtos" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-3">
              Nossos <span className="text-primary">Produtos</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Selecione uma categoria ou busque pelo nome do produto
            </p>
          </motion.div>

          <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

          <div className="mt-8">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="font-display text-2xl mb-2">Nenhum produto encontrado</p>
                <p className="text-sm">Tente outra busca ou categoria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-muted-foreground mt-12"
          >
            Os valores são exclusivos para compras por atacado. Entre em contato para mais informações.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(0,0%,100%) 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Precisa de um Orçamento?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
              Monte seu pedido online ou fale diretamente com nossos vendedores pelo WhatsApp
            </p>
            <a
              href="https://wa.me/5511959409051"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-background text-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform duration-300"
            >
              💬 Falar com Vendedor
            </a>
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
