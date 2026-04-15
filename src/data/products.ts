export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  minQty: number;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "todos", name: "Todos", icon: "🔧" },
  { id: "alicates", name: "Alicates", icon: "🔧" },
  { id: "brocas", name: "Brocas", icon: "🔩" },
  { id: "discos", name: "Discos", icon: "⚙️" },
  { id: "chaves", name: "Chaves", icon: "🔑" },
  { id: "trenas", name: "Trenas", icon: "📏" },
  { id: "torneiras", name: "Torneiras e Registros", icon: "🚿" },
  { id: "duchas", name: "Duchas", icon: "💧" },
  { id: "grampeadores", name: "Grampeadores", icon: "📌" },
  { id: "soquetes", name: "Jogo de Soquetes", icon: "🔧" },
  { id: "martelos", name: "Martelos", icon: "🔨" },
  { id: "serras", name: "Serras", icon: "🪚" },
  { id: "estiletes", name: "Estiletes", icon: "✂️" },
  { id: "fitas", name: "Fitas", icon: "🎗️" },
  { id: "balancas", name: "Balanças", icon: "⚖️" },
  { id: "outros", name: "Outros", icon: "📦" },
];

export const products: Product[] = [
  { id: 1, name: "ALICATE DE BICO 6\"", price: 14.16, category: "alicates", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_52701-300x300.PNG", minQty: 12, badge: "Mais Vendido" },
  { id: 2, name: "ALICATE UNIVERSAL 8\"", price: 16.50, category: "alicates", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_52701-300x300.PNG", minQty: 12 },
  { id: 3, name: "ALICATE DE PRESSÃO CROMADO 10PL", price: 20.80, category: "alicates", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_52701-300x300.PNG", minQty: 6 },
  { id: 4, name: "BROCA CONCRETO CURTA 12MM X150MM", price: 5.56, category: "brocas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_55801-300x300.PNG", minQty: 1, badge: "Novidade" },
  { id: 5, name: "BROCA CONCRETO LONGA 6X330MM", price: 3.85, category: "brocas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_55801-300x300.PNG", minQty: 100 },
  { id: 6, name: "BROCA CONCRETO 4MM X75MM", price: 1.18, category: "brocas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_55801-300x300.PNG", minQty: 100 },
  { id: 7, name: "DISCO TUNGSTÊNIO PARA MADEIRA", price: 13.02, category: "discos", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 12, badge: "Mais Vendido" },
  { id: 8, name: "DISCO PARA VIDRO 110MM", price: 15.54, category: "discos", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_20101-300x300.JPG", minQty: 12 },
  { id: 9, name: "DISCO CORTE FINO 4.1/2\"", price: 4.20, category: "discos", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_20101-300x300.JPG", minQty: 25 },
  { id: 10, name: "TRENA EMBORRACHADA 5X25MM 3 TRAVAS", price: 10.72, category: "trenas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_5901-300x300.JPG", minQty: 12, badge: "Mais Vendido" },
  { id: 11, name: "TRENA EMBORRACHADA 3M X16MM", price: 6.50, category: "trenas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_5901-300x300.JPG", minQty: 24 },
  { id: 12, name: "TRENA EMBORRACHADA 7.5M X25MM", price: 14.90, category: "trenas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_5901-300x300.JPG", minQty: 6 },
  { id: 13, name: "TORNEIRA COZINHA PAREDE CROMADA (CRUZETA)", price: 21.53, category: "torneiras", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_34801-300x300.JPG", minQty: 4 },
  { id: 14, name: "TORNEIRA ESFERA 1/2\"", price: 9.46, category: "torneiras", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_8001-300x300.JPG", minQty: 20, badge: "Mais Vendido" },
  { id: 15, name: "REGISTRO ESFERA 3/4\"", price: 13.66, category: "torneiras", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_8901-300x300.JPG", minQty: 12, badge: "Mais Vendido" },
  { id: 16, name: "VÁLVULA CROMADA COZINHAS", price: 9.04, category: "torneiras", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_57001-300x300.PNG", minQty: 16, badge: "Novidade" },
  { id: 17, name: "GATILHO DA DUCHA COM EMBALAGEM G2 C3", price: 12.30, category: "duchas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_53701-300x300.PNG", minQty: 20 },
  { id: 18, name: "DUCHA HIGIÊNICA CROMADA", price: 18.50, category: "duchas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_53701-300x300.PNG", minQty: 10 },
  { id: 19, name: "JG PONTA E SOQUETE 41PCS PROFIELD G1 C1", price: 12.00, category: "soquetes", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_32201-300x300.JPG", minQty: 48, badge: "Novidade" },
  { id: 20, name: "GRAMPEADOR MANUAL 4-14MM", price: 28.46, category: "grampeadores", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_32201-300x300.JPG", minQty: 6 },
  { id: 21, name: "BALANÇA DIGITAL PARA COZINHA 10KG", price: 13.02, category: "balancas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_55101-300x300.PNG", minQty: 24, badge: "Novidade" },
  { id: 22, name: "BALANÇA DIGITAL PARA COZINHA 5KG", price: 14.11, category: "balancas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_55101-300x300.PNG", minQty: 40 },
  { id: 23, name: "MARTELO UNHA 25MM CABO MADEIRA", price: 15.80, category: "martelos", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 12 },
  { id: 24, name: "MARTELO BOLA 300G", price: 18.20, category: "martelos", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 6 },
  { id: 25, name: "ARAME LISO RECOZIDO", price: 14.25, category: "outros", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 20 },
  { id: 26, name: "BANQUETA DOBRÁVEL 150KG 45CM", price: 42.00, category: "outros", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 8 },
  { id: 27, name: "ESTILETE LARGO 18MM", price: 3.50, category: "estiletes", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 50 },
  { id: 28, name: "FITA ISOLANTE 19MM X 10M", price: 2.80, category: "fitas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 100 },
  { id: 29, name: "FITA VEDA ROSCA 18MM X 25M", price: 3.20, category: "fitas", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_3601-300x300.JPG", minQty: 60 },
  { id: 30, name: "SERRA COPO 65MM BIMETAL", price: 22.50, category: "serras", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_20101-300x300.JPG", minQty: 6 },
  { id: 31, name: "CHAVE DE FENDA 3/16 X 5\"", price: 5.80, category: "chaves", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_32201-300x300.JPG", minQty: 24 },
  { id: 32, name: "CHAVE PHILLIPS 1/4 X 6\"", price: 6.20, category: "chaves", image: "https://www.vendasgolfield.com.br/image/cache/data/eftr/Img_ftr_rp_32201-300x300.JPG", minQty: 24 },
];
