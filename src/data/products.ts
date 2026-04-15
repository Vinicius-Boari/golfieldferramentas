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

const IMG = "https://www.vendasgolfield.com.br/image/cache/data/eftr/";

export const categories: Category[] = [
  { id: "todos", name: "Todos", icon: "🔧" },
  { id: "alicates", name: "Alicates", icon: "🔧" },
  { id: "brocas", name: "Brocas", icon: "🔩" },
  { id: "brocas_sds", name: "Brocas SDS", icon: "🔩" },
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
  { id: "aplicadores", name: "Aplicadores", icon: "🔫" },
  { id: "bombas", name: "Bombas de Ar", icon: "💨" },
  { id: "bits", name: "Bits e Pontas", icon: "🔩" },
  { id: "cintas", name: "Cintas", icon: "🪢" },
  { id: "outros", name: "Outros", icon: "📦" },
];

export const products: Product[] = [
  // === ALICATES ===
  { id: 1, name: "ALICATE DE BICO 6\"", price: 14.16, category: "alicates", image: `${IMG}Img_ftr_rp_52701-300x300.PNG`, minQty: 6, badge: "Mais Vendido" },
  { id: 2, name: "ALICATE BOMBA D'AGUA 10PL", price: 26.43, category: "alicates", image: `${IMG}Img_ftr_rp_401-300x300.JPG`, minQty: 6 },
  { id: 3, name: "ALICATE BOMBA D'AGUA 12\"", price: 37.08, category: "alicates", image: `${IMG}Img_ftr_rp_501-300x300.JPG`, minQty: 6 },
  { id: 4, name: "ALICATE UNIVERSAL 8\"", price: 16.50, category: "alicates", image: `${IMG}Img_ftr_rp_52701-300x300.PNG`, minQty: 12 },
  { id: 5, name: "ALICATE DE PRESSÃO CROMADO 10PL", price: 20.80, category: "alicates", image: "/images/alicate-pressao.png", minQty: 6 },

  // === APLICADORES ===
  { id: 6, name: "APLICADOR DE SILICONE 12\" 580G", price: 37.08, category: "aplicadores", image: `${IMG}Img_ftr_rp_56201-300x300.PNG`, minQty: 10 },
  { id: 7, name: "APLICADOR DE SILICONE 9\" 490G", price: 20.80, category: "aplicadores", image: `${IMG}Img_ftr_rp_1401-300x300.JPG`, minQty: 12 },

  // === ARCOS / SERRAS ===
  { id: 8, name: "ARCO DE SERRA CROMADO 8-12PL", price: 18.09, category: "serras", image: `${IMG}Img_ftr_rp_2301-300x300.JPG`, minQty: 12 },
  { id: 9, name: "SERRA COPO 65MM BIMETAL", price: 22.50, category: "serras", image: `${IMG}Img_ftr_rp_20101-300x300.JPG`, minQty: 6 },

  // === BOMBAS DE AR ===
  { id: 10, name: "BOMBA DE AR COM PEDAL", price: 30.75, category: "bombas", image: `${IMG}Img_ftr_rp_1001-300x300.JPG`, minQty: 20 },
  { id: 11, name: "BOMBA DE AR VERTICAL 38X500MM", price: 37.99, category: "bombas", image: `${IMG}Img_ftr_rp_1101-300x300.JPG`, minQty: 20 },

  // === BROCAS CONCRETO ===
  { id: 12, name: "BROCA CONCRETO 4MM X75MM", price: 1.18, category: "brocas", image: `${IMG}Img_ftr_rp_30801-300x300.JPG`, minQty: 100 },
  { id: 13, name: "BROCA PARA CONCRETO CURTA 5MM X 100MM", price: 1.74, category: "brocas", image: `${IMG}Img_ftr_rp_2501-300x300.JPG`, minQty: 100 },
  { id: 14, name: "BROCA PARA CONCRETO CURTA 10MM X 120MM", price: 3.89, category: "brocas", image: `${IMG}Img_ftr_rp_2701-300x300.JPG`, minQty: 100 },
  { id: 15, name: "BROCA CONCRETO CURTA 12MM X150MM", price: 5.56, category: "brocas", image: `${IMG}Img_ftr_rp_55801-300x300.PNG`, minQty: 1, badge: "Novidade" },
  { id: 16, name: "BROCA CONCRETO LONGA 6X330MM", price: 3.85, category: "brocas", image: `${IMG}Img_ftr_rp_29701-300x300.JPG`, minQty: 100 },
  { id: 17, name: "BROCA CONCRETO LONGA 10MMX330MM", price: 7.36, category: "brocas", image: `${IMG}Img_ftr_rp_19801-300x300.JPG`, minQty: 100 },
  { id: 18, name: "BROCA DE AÇO RÁPIDO 4,5MM", price: 19.60, category: "brocas", image: `${IMG}Img_ftr_rp_15601-300x300.JPG`, minQty: 10 },
  { id: 19, name: "BROCA CÔNICA CHANFRADA DIAMANTADA 50MM", price: 43.31, category: "brocas", image: `${IMG}Img_ftr_rp_30601-300x300.JPG`, minQty: 15 },
  { id: 20, name: "BROCA CÔNICA CHANFRADA DIAMANTADA 60MM", price: 63.91, category: "brocas", image: `${IMG}Img_ftr_rp_30701-300x300.JPG`, minQty: 15 },
  { id: 21, name: "JOGO BROCA AÇO RAPIDO 10MM COM 5PÇ", price: 44.25, category: "brocas", image: `${IMG}Img_ftr_rp_16501-300x300.JPG`, minQty: 10 },

  // === BROCAS SDS ===
  { id: 22, name: "BROCA SDS 5*160", price: 3.56, category: "brocas_sds", image: `${IMG}Img_ftr_rp_28101-300x300.JPG`, minQty: 500 },
  { id: 23, name: "BROCA SDS 5*210", price: 4.29, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26401-300x300.JPG`, minQty: 250 },
  { id: 24, name: "BROCA SDS 7*160", price: 3.78, category: "brocas_sds", image: `${IMG}Img_ftr_rp_28301-300x300.JPG`, minQty: 500 },
  { id: 25, name: "BROCA SDS 7*210", price: 4.70, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26601-300x300.JPG`, minQty: 250 },
  { id: 26, name: "BROCA SDS 8*210", price: 4.81, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26701-300x300.JPG`, minQty: 250 },
  { id: 27, name: "BROCA SDS 10*210", price: 5.07, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26801-300x300.JPG`, minQty: 250 },
  { id: 28, name: "BROCA SDS 11*160", price: 4.50, category: "brocas_sds", image: `${IMG}Img_ftr_rp_25601-300x300.JPG`, minQty: 250 },
  { id: 29, name: "BROCA SDS 16*160", price: 7.87, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26001-300x300.JPG`, minQty: 200 },
  { id: 30, name: "BROCA SDS 16*210", price: 9.20, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27201-300x300.JPG`, minQty: 200 },
  { id: 31, name: "BROCA SDS 18*160", price: 12.43, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26101-300x300.JPG`, minQty: 200 },
  { id: 32, name: "BROCA SDS 18*210", price: 11.66, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27301-300x300.JPG`, minQty: 125 },
  { id: 33, name: "BROCA SDS 20*160", price: 13.39, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26201-300x300.JPG`, minQty: 200 },
  { id: 34, name: "BROCA SDS 20*210", price: 14.44, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27401-300x300.JPG`, minQty: 125 },

  // === CHAVES ===
  { id: 35, name: "CHAVE DE FENDA 3/16 X 5\"", price: 5.80, category: "chaves", image: `${IMG}Img_ftr_rp_15401-300x300.JPG`, minQty: 24 },
  { id: 36, name: "CHAVE PHILLIPS 1/4 X 6\"", price: 6.20, category: "chaves", image: `${IMG}Img_ftr_rp_32201-300x300.JPG`, minQty: 24 },
  { id: 37, name: "CHAVE BIELA 8MM", price: 8.68, category: "chaves", image: `${IMG}Img_ftr_rp_28401-300x300.JPG`, minQty: 6 },
  { id: 38, name: "CHAVE BIELA 9MM", price: 9.04, category: "chaves", image: `${IMG}Img_ftr_rp_28501-300x300.JPG`, minQty: 6 },
  { id: 39, name: "CHAVE BIELA 10MM", price: 9.59, category: "chaves", image: `${IMG}Img_ftr_rp_28601-300x300.JPG`, minQty: 6 },
  { id: 40, name: "CHAVE BIELA 18MM", price: 19.54, category: "chaves", image: `${IMG}Img_ftr_rp_29401-300x300.JPG`, minQty: 6 },
  { id: 41, name: "CHAVE INGLESA 8\"", price: 17.13, category: "chaves", image: `${IMG}Img_ftr_rp_52801-300x300.PNG`, minQty: 6 },
  { id: 42, name: "CHAVE INGLESA 10\"", price: 24.42, category: "chaves", image: `${IMG}Img_ftr_rp_3001-300x300.JPEG`, minQty: 6 },

  // === CINTAS ===
  { id: 43, name: "CINTA COM CATRACA 9MX50MM 3.000KG", price: 47.94, category: "cintas", image: `${IMG}Img_ftr_rp_3101-300x300.JPG`, minQty: 10 },

  // === DISCOS ===
  { id: 44, name: "DISCO TUNGSTÊNIO PARA MADEIRA", price: 13.02, category: "discos", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 10, badge: "Mais Vendido" },
  { id: 45, name: "DISCO TUNGSTÊNIO PARA METAL 115X22MM", price: 26.14, category: "discos", image: `${IMG}Img_ftr_rp_53301-300x300.PNG`, minQty: 10 },
  { id: 46, name: "DISCO PARA VIDRO 110MM", price: 15.54, category: "discos", image: `${IMG}Img_ftr_rp_20101-300x300.JPG`, minQty: 12 },
  { id: 47, name: "DISCO CORTE FINO 4.1/2\"", price: 4.20, category: "discos", image: `${IMG}Img_ftr_rp_20101-300x300.JPG`, minQty: 25 },
  { id: 48, name: "DISCO DE CORTE MADEIRA 110mm 36 DENTES", price: 8.86, category: "discos", image: `${IMG}Img_ftr_rp_53001-300x300.PNG`, minQty: 20 },
  { id: 49, name: "DISCO DE CORTE MADEIRA 180MM 40D", price: 18.17, category: "discos", image: `${IMG}Img_ftr_rp_19901-300x300.PNG`, minQty: 10 },
  { id: 50, name: "DISCO DE CORTE MADEIRA 180MM 60D", price: 22.76, category: "discos", image: `${IMG}Img_ftr_rp_20001-300x300.PNG`, minQty: 10 },

  // === TRENAS ===
  { id: 51, name: "TRENA EMBORRACHADA 3M X16MM", price: 6.50, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 24 },
  { id: 52, name: "TRENA EMBORRACHADA 5X25MM 3 TRAVAS", price: 10.72, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 12, badge: "Mais Vendido" },
  { id: 53, name: "TRENA EMBORRACHADA 7.5M X25MM", price: 14.90, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 6 },

  // === TORNEIRAS E REGISTROS ===
  { id: 54, name: "TORNEIRA COZINHA PAREDE CROMADA (CRUZETA)", price: 21.53, category: "torneiras", image: `${IMG}Img_ftr_rp_34801-300x300.JPG`, minQty: 4 },
  { id: 55, name: "TORNEIRA ESFERA 1/2\"", price: 9.46, category: "torneiras", image: `${IMG}Img_ftr_rp_8001-300x300.JPG`, minQty: 20, badge: "Mais Vendido" },
  { id: 56, name: "REGISTRO ESFERA 3/4\"", price: 13.66, category: "torneiras", image: `${IMG}Img_ftr_rp_8901-300x300.JPG`, minQty: 12, badge: "Mais Vendido" },
  { id: 57, name: "VÁLVULA CROMADA COZINHAS", price: 9.04, category: "torneiras", image: `${IMG}Img_ftr_rp_57001-300x300.PNG`, minQty: 16, badge: "Novidade" },

  // === DUCHAS ===
  { id: 58, name: "GATILHO DA DUCHA COM EMBALAGEM G2 C3", price: 12.30, category: "duchas", image: `${IMG}Img_ftr_rp_53701-300x300.PNG`, minQty: 20 },
  { id: 59, name: "DUCHA HIGIÊNICA BLISTER", price: 33.91, category: "duchas", image: `${IMG}Img_ftr_rp_9501-300x300.JPG`, minQty: 20 },

  // === FITAS ===
  { id: 60, name: "FITA DE VEDAÇÃO DE ROSCA 10M X 18MM", price: 1.01, category: "fitas", image: `${IMG}Img_ftr_rp_14401-300x300.JPG`, minQty: 10 },
  { id: 61, name: "FITA ISOLANTE 0,15MMX19MMX10M", price: 2.05, category: "fitas", image: `${IMG}Img_ftr_rp_15101-300x300.JPG`, minQty: 10 },
  { id: 62, name: "FITA ISOLANTE 0,15MMX19MMX20M", price: 3.61, category: "fitas", image: `${IMG}Img_ftr_rp_15201-300x300.JPG`, minQty: 200 },

  // === BITS E PONTAS ===
  { id: 63, name: "JOGO BITS FENDA/PHILIPS 65MM GOLFIELD", price: 10.30, category: "bits", image: `${IMG}Img_ftr_rp_46201-300x300.PNG`, minQty: 10 },
  { id: 64, name: "JOGO BITS PH2/PH2 65MM GOLFIELD", price: 10.30, category: "bits", image: `${IMG}Img_ftr_rp_48301-300x300.PNG`, minQty: 10 },

  // === SOQUETES ===
  { id: 65, name: "JG PONTA E SOQUETE 41PCS PROFIELD G1 C1", price: 12.00, category: "soquetes", image: `${IMG}Img_ftr_rp_32201-300x300.JPG`, minQty: 48, badge: "Novidade" },
  { id: 66, name: "JOGO DE SOQUETE MAGNÉTICO 5/16 MM", price: 9.21, category: "soquetes", image: `${IMG}Img_ftr_rp_41801-300x300.JPG`, minQty: 10 },
  { id: 67, name: "JOGO DE SOQUETE MAGNÉTICO 6MM X 65MM", price: 10.64, category: "soquetes", image: `${IMG}Img_ftr_rp_17501-300x300.JPG`, minQty: 10 },
  { id: 68, name: "JOGO DE SOQUETE MAGNÉTICO 13MM X 65MM", price: 15.76, category: "soquetes", image: `${IMG}Img_ftr_rp_22801-300x300.JPG`, minQty: 10 },

  // === GRAMPEADORES ===
  { id: 69, name: "GRAMPEADOR MANUAL 4-14MM", price: 28.46, category: "grampeadores", image: `${IMG}Img_ftr_rp_32201-300x300.JPG`, minQty: 6 },

  // === BALANÇAS ===
  { id: 70, name: "BALANÇA DIGITAL PARA COZINHA 10KG", price: 13.02, category: "balancas", image: `${IMG}Img_ftr_rp_55101-300x300.PNG`, minQty: 24, badge: "Novidade" },
  { id: 71, name: "BALANÇA DIGITAL PARA COZINHA 5KG", price: 14.11, category: "balancas", image: `${IMG}Img_ftr_rp_55101-300x300.PNG`, minQty: 40 },

  // === MARTELOS ===
  { id: 72, name: "MARTELO UNHA 25MM CABO MADEIRA", price: 15.80, category: "martelos", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 12 },
  { id: 73, name: "MARTELO BOLA 300G", price: 18.20, category: "martelos", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 6 },

  // === ESTILETES ===
  { id: 74, name: "ESTILETE LARGO 18MM", price: 3.50, category: "estiletes", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 50 },

  // === OUTROS ===
  { id: 75, name: "ARAME LISO RECOZIDO", price: 14.25, category: "outros", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 20 },
  { id: 76, name: "BANQUETA DOBRÁVEL 150KG 45CM", price: 42.00, category: "outros", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 8 },
];
