import { Phone, Mail, Instagram, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border gradient-dark">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="font-display text-3xl font-bold mb-4">
              <span className="text-primary">GOL</span>FIELD
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-6">
              Ferramentas premium com preços de atacado. Distribuímos para todo o Brasil com qualidade garantida e atendimento personalizado. Sua satisfação é nossa prioridade.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/golfield.ferramentas" target="_blank" rel="noopener noreferrer"
                className="p-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <a href="tel:1195940-9051" className="hover:text-foreground transition-colors">(11) 95940-9051</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a href="mailto:contato@golfield.com.br" className="hover:text-foreground transition-colors">contato@golfield.com.br</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <span>São Paulo - SP, Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-primary flex-shrink-0" />
                <span>Seg a Sex: 7h às 18h</span>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Alicates", "Brocas", "Discos", "Chaves", "Trenas", "Torneiras", "Martelos", "Serras"].map(cat => (
                <li key={cat}>
                  <a href="#produtos" className="hover:text-primary transition-colors">{cat}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Golfield. Todos os direitos reservados.</p>
          <p>Os valores são exclusivos para compras por atacado.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
