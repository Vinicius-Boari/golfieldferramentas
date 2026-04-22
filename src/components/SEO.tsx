import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const DEFAULT_TITLE = "Golfield Ferramentas — Atacado de Ferramentas Premium";
const DEFAULT_DESC = "Atacado de ferramentas premium para profissionais. Alicates, martelos, brocas, chaves, discos e muito mais com preços de atacado. Pedido mínimo R$ 2.000,00.";
const DEFAULT_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/Cpa4tBlUhVYvW8sOMudlKnqcaY03/social-images/social-1776250712727-GolField_logo.webp";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "https://vendasgolfield.com.br";

const SEO = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | Golfield Ferramentas` : DEFAULT_TITLE;
  const url = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Golfield Ferramentas" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

// Helpers para gerar JSON-LD
export const buildOrganizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Golfield Ferramentas",
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  description: DEFAULT_DESC,
  sameAs: [
    "https://www.instagram.com/golfield.ferramentas/",
    "https://wa.me/5511959409051",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-11-95940-9051",
    contactType: "sales",
    areaServed: "BR",
    availableLanguage: ["Portuguese"],
  },
});

export const buildWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Golfield Ferramentas",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildProductJsonLd = (p: { id: string | number; name: string; price: number; image: string; category: string; description?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  image: p.image,
  description: p.description || `${p.name} — atacado para profissionais.`,
  category: p.category,
  brand: { "@type": "Brand", name: "Golfield" },
  offers: {
    "@type": "Offer",
    url: SITE_URL,
    priceCurrency: "BRL",
    price: p.price.toFixed(2),
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Golfield Ferramentas" },
  },
});

export const buildItemListJsonLd = (products: { id: string | number; name: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: products.slice(0, 30).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: SITE_URL,
  })),
});
