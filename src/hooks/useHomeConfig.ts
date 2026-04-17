import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomeSection {
  id: string;
  enabled: boolean;
  order: number;
}

export interface HeroVideoConfig {
  enabled: boolean;
  url: string;
  loop: boolean;
  muted: boolean;
  overlayOpacity: number; // 0..0.8
}

export interface HeroConfig {
  logoImage: string;
  badgeText: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  minOrderText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  stats: { label: string; desc: string }[];
}

export interface TrustBadgesConfig {
  items: { text: string }[];
}

export interface ProductsSectionConfig {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  disclaimerText: string;
  showAllButtonText: string;
}

export interface CtaSectionConfig {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface AboutSectionConfig {
  badge: string;
  title: string;
  titleHighlight: string;
  paragraph1: string;
  paragraph2: string;
  features: { title: string; desc: string }[];
}

export interface FooterConfig {
  description: string;
  phone: string;
  email: string;
  location: string;
  hours: string;
  instagramUrl: string;
  whatsappUrl: string;
  categories: string[];
}

export interface WhatsAppMessageConfig {
  enabled: boolean;
  template: string;
}

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  allowAdminAccess: boolean;
}

export interface QuoteAccessConfig {
  requireLoginForWhatsApp: boolean;
}

export interface MobileExperienceConfig {
  /** When true, animations and videos are shown on mobile/tablet. When false, they are disabled on mobile/tablet only (desktop unaffected). */
  enableAnimationsAndVideos: boolean;
}

export interface SystemSettingsConfig {
  whatsappMessage: WhatsAppMessageConfig;
  maintenance: MaintenanceConfig;
  quoteAccess: QuoteAccessConfig;
  mobileExperience: MobileExperienceConfig;
}

export interface AppearanceConfig {
  /** Global site background color in HEX format, e.g. "#5C5C5C". */
  backgroundColor: string;
}

export const DEFAULT_BACKGROUND_COLOR = "#5C5C5C";

export interface HomeConfig {
  sections: HomeSection[];
  hero: HeroConfig;
  heroVideo: HeroVideoConfig;
  trustBadges: TrustBadgesConfig;
  productsSection: ProductsSectionConfig;
  ctaSection: CtaSectionConfig;
  aboutSection: AboutSectionConfig;
  footer: FooterConfig;
  systemSettings: SystemSettingsConfig;
  appearance: AppearanceConfig;
}

export const DEFAULT_WHATSAPP_TEMPLATE = `Olá! Meu nome é {name}.

Gostaria de fazer um orçamento dos seguintes produtos:

{products}

*Subtotal: {subtotal}*
*Total: {total}*

Meus dados de contato:
• Telefone: {phone}
• Email: {email}

Data: {date}`;

export const defaultHomeConfig: HomeConfig = {
  sections: [
    { id: "hero", enabled: true, order: 0 },
    { id: "trustBadges", enabled: true, order: 1 },
    { id: "products", enabled: true, order: 2 },
    { id: "cta", enabled: true, order: 3 },
    { id: "about", enabled: true, order: 4 },
    { id: "footer", enabled: true, order: 5 },
  ],
  hero: {
    logoImage: "/images/bb415772-a3bf-433b-bd51-77e20e6dbf5f.png",
    badgeText: "Orçamentos por Atacado",
    titleLine1: "Ferramentas",
    titleLine2: "Premium",
    titleLine3: "para Profissionais",
    description: "Centenas de produtos com preços exclusivos de atacado. Monte seu orçamento online e receba atendimento personalizado.",
    minOrderText: "Pedido mínimo para orçamento: R$ 2.000,00",
    ctaButtonText: "Ver Produtos",
    ctaButtonLink: "#produtos",
    secondaryButtonText: "Falar com Vendedor",
    secondaryButtonLink: "https://wa.me/5511959409051",
    stats: [
      { label: "Qualidade Garantida", desc: "Produtos certificados" },
      { label: "Envio Nacional", desc: "Para todo o Brasil" },
      { label: "Catálogo completo", desc: "Centenas de produtos" },
    ],
  },
  heroVideo: {
    enabled: false,
    url: "",
    loop: true,
    muted: true,
    overlayOpacity: 0.55,
  },
  trustBadges: {
    items: [
      { text: "Avaliação 5 estrelas" },
      { text: "+1000 clientes atendidos" },
      { text: "Qualidade profissional" },
    ],
  },
  productsSection: {
    badge: "Catálogo Completo",
    title: "Nossos",
    titleHighlight: "Produtos",
    subtitle: "Selecione uma categoria ou busque pelo nome do produto",
    disclaimerText: "Os valores são exclusivos para compras por atacado. Entre em contato para mais informações.",
    showAllButtonText: "Ver todos os produtos",
  },
  ctaSection: {
    title: "Pronto para comprar no atacado?",
    description: "Monte seu orçamento com os melhores produtos da Golfield e fale com nosso time para receber atendimento personalizado.",
    buttonText: "Explorar catálogo",
    buttonLink: "#produtos",
  },
  aboutSection: {
    badge: "Sobre a Golfield",
    title: "Soluções em ferramentas com foco em",
    titleHighlight: "atacado profissional",
    paragraph1: "A Golfield atende clientes de todo o Brasil com uma linha completa de ferramentas e acessórios para profissionais, lojistas e empresas que buscam qualidade, preço competitivo e atendimento ágil.",
    paragraph2: "Trabalhamos com um catálogo variado e condições especiais para compras em volume, sempre com suporte dedicado para ajudar na composição do melhor orçamento para seu negócio.",
    features: [
      { title: "Experiência", desc: "Atendimento consultivo para vendas B2B" },
      { title: "Cobertura Nacional", desc: "Distribuição para clientes em todo o Brasil" },
      { title: "Curadoria", desc: "Seleção de produtos com foco em giro e qualidade" },
      { title: "Parceria", desc: "Relação próxima para gerar recorrência e confiança" },
    ],
  },
  footer: {
    description: "Ferramentas premium com preços de atacado. Distribuímos para todo o Brasil com qualidade garantida e atendimento personalizado.",
    phone: "(11) 95940-9051",
    email: "paula.profield@hotmail.com",
    location: "São Paulo - SP, Brasil",
    hours: "Seg a Sex: 7h às 18h",
    instagramUrl: "https://www.instagram.com/golfield.ferramentas/",
    whatsappUrl: "https://wa.me/5511959409051",
    categories: ["Alicates", "Brocas", "Discos", "Chaves", "Trenas", "Torneiras", "Martelos", "Serras"],
  },
  systemSettings: {
    whatsappMessage: {
      enabled: false,
      template: DEFAULT_WHATSAPP_TEMPLATE,
    },
    maintenance: {
      enabled: false,
      title: "Estamos em manutenção",
      description: "Estamos fazendo melhorias no sistema. Voltaremos em breve!",
      imageUrl: "",
      allowAdminAccess: true,
    },
    quoteAccess: {
      requireLoginForWhatsApp: true,
    },
    mobileExperience: {
      enableAnimationsAndVideos: true,
    },
  },
  appearance: {
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
  },
};

export const useHomeConfig = () => {
  return useQuery({
    queryKey: ["home-config"],
    queryFn: async (): Promise<HomeConfig> => {
      const { data, error } = await supabase
        .from("home_config")
        .select("config")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return defaultHomeConfig;

      const saved = (data.config as unknown as Partial<HomeConfig>) ?? {};
      return {
        ...defaultHomeConfig,
        ...saved,
        hero: { ...defaultHomeConfig.hero, ...(saved.hero ?? {}) },
        heroVideo: { ...defaultHomeConfig.heroVideo, ...(saved.heroVideo ?? {}) },
        trustBadges: { ...defaultHomeConfig.trustBadges, ...(saved.trustBadges ?? {}) },
        productsSection: { ...defaultHomeConfig.productsSection, ...(saved.productsSection ?? {}) },
        ctaSection: { ...defaultHomeConfig.ctaSection, ...(saved.ctaSection ?? {}) },
        aboutSection: { ...defaultHomeConfig.aboutSection, ...(saved.aboutSection ?? {}) },
        footer: { ...defaultHomeConfig.footer, ...(saved.footer ?? {}) },
        systemSettings: {
          whatsappMessage: {
            ...defaultHomeConfig.systemSettings.whatsappMessage,
            ...(saved.systemSettings?.whatsappMessage ?? {}),
          },
          maintenance: {
            ...defaultHomeConfig.systemSettings.maintenance,
            ...(saved.systemSettings?.maintenance ?? {}),
          },
          quoteAccess: {
            ...defaultHomeConfig.systemSettings.quoteAccess,
            ...(saved.systemSettings?.quoteAccess ?? {}),
          },
          mobileExperience: {
            ...defaultHomeConfig.systemSettings.mobileExperience,
            ...(saved.systemSettings?.mobileExperience ?? {}),
          },
        },
        appearance: {
          ...defaultHomeConfig.appearance,
          ...(saved.appearance ?? {}),
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSaveHomeConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: HomeConfig) => {
      // Check if a row exists
      const { data: existing } = await supabase
        .from("home_config")
        .select("id")
        .limit(1)
        .maybeSingle();

      const jsonConfig = JSON.parse(JSON.stringify(config));
      if (existing) {
        const { error } = await supabase
          .from("home_config")
          .update({ config: jsonConfig })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("home_config")
          .insert([{ config: jsonConfig }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-config"] });
    },
  });
};
