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
  { id: "lixas", name: "Lixas", icon: "📄" },
  { id: "grampos", name: "Grampos", icon: "🗜️" },
  { id: "cadeados", name: "Cadeados", icon: "🔒" },
  { id: "eletricos", name: "Elétricos", icon: "⚡" },
  { id: "imas", name: "Imãs", icon: "🧲" },
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

  // === SERRAS ===
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
  { id: 77, name: "BROCA AÇO 5MM G2 C2", price: 23.33, category: "brocas", image: `${IMG}Img_ftr_rp_22101-300x300.JPG`, minQty: 10 },
  { id: 78, name: "BROCA CONCRETO CURTA 6MM X100MM", price: 1.86, category: "brocas", image: `${IMG}Img_ftr_rp_30901-300x300.JPG`, minQty: 100 },
  { id: 79, name: "BROCA CONCRETO CURTA 7MM X100MM", price: 2.18, category: "brocas", image: `${IMG}Img_ftr_rp_2601-300x300.JPG`, minQty: 100 },
  { id: 80, name: "BROCA CONCRETO CURTA 8MM X120MM", price: 2.58, category: "brocas", image: `${IMG}Img_ftr_rp_31001-300x300.JPG`, minQty: 100 },
  { id: 81, name: "BROCA CONCRETO LONGA 8X330MM", price: 4.94, category: "brocas", image: `${IMG}Img_ftr_rp_29801-300x300.JPG`, minQty: 100 },
  { id: 82, name: "BROCA CONCRETO LONGA 12X330MM", price: 8.70, category: "brocas", image: `${IMG}Img_ftr_rp_29901-300x300.JPG`, minQty: 50 },
  { id: 83, name: "BROCA DE AÇO RÁPIDO 3MM", price: 9.80, category: "brocas", image: `${IMG}Img_ftr_rp_15501-300x300.JPG`, minQty: 10 },
  { id: 84, name: "BROCA DE AÇO RÁPIDO 6MM", price: 28.50, category: "brocas", image: `${IMG}Img_ftr_rp_15701-300x300.JPG`, minQty: 10 },
  { id: 85, name: "BROCA DE AÇO RÁPIDO 8MM", price: 40.00, category: "brocas", image: `${IMG}Img_ftr_rp_15801-300x300.JPG`, minQty: 10 },
  { id: 86, name: "JOGO BROCA AÇO RAPIDO 6MM COM 5PÇ", price: 24.50, category: "brocas", image: `${IMG}Img_ftr_rp_16401-300x300.JPG`, minQty: 10 },
  { id: 87, name: "JOGO BROCA AÇO RAPIDO 8MM COM 5PÇ", price: 34.00, category: "brocas", image: `${IMG}Img_ftr_rp_16601-300x300.JPG`, minQty: 10 },
  { id: 88, name: "BROCA CÔNICA CHANFRADA DIAMANTADA 40MM", price: 35.50, category: "brocas", image: `${IMG}Img_ftr_rp_30501-300x300.JPG`, minQty: 15 },

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
  { id: 89, name: "BROCA SDS 6*160", price: 3.65, category: "brocas_sds", image: `${IMG}Img_ftr_rp_28201-300x300.JPG`, minQty: 500 },
  { id: 90, name: "BROCA SDS 6*210", price: 4.45, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26501-300x300.JPG`, minQty: 250 },
  { id: 91, name: "BROCA SDS 8*160", price: 3.90, category: "brocas_sds", image: `${IMG}Img_ftr_rp_25501-300x300.JPG`, minQty: 500 },
  { id: 92, name: "BROCA SDS 10*160", price: 4.20, category: "brocas_sds", image: `${IMG}Img_ftr_rp_25701-300x300.JPG`, minQty: 500 },
  { id: 93, name: "BROCA SDS 12*160", price: 4.70, category: "brocas_sds", image: `${IMG}Img_ftr_rp_25801-300x300.JPG`, minQty: 250 },
  { id: 94, name: "BROCA SDS 12*210", price: 5.62, category: "brocas_sds", image: `${IMG}Img_ftr_rp_26901-300x300.JPG`, minQty: 250 },
  { id: 95, name: "BROCA SDS 13*210", price: 7.87, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27001-300x300.JPG`, minQty: 250 },
  { id: 96, name: "BROCA SDS 14*160", price: 5.80, category: "brocas_sds", image: `${IMG}Img_ftr_rp_25901-300x300.JPG`, minQty: 200 },
  { id: 97, name: "BROCA SDS 14*210", price: 7.98, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27101-300x300.JPG`, minQty: 200 },
  { id: 98, name: "BROCA SDS 22*210", price: 17.18, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27501-300x300.JPG`, minQty: 125 },
  { id: 99, name: "BROCA SDS 24*210", price: 23.72, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27601-300x300.JPG`, minQty: 125 },
  { id: 100, name: "BROCA SDS 25*210", price: 24.13, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27701-300x300.JPG`, minQty: 125 },
  { id: 101, name: "BROCA SDS 26*210", price: 27.61, category: "brocas_sds", image: `${IMG}Img_ftr_rp_27801-300x300.JPG`, minQty: 100 },

  // === CHAVES ===
  { id: 35, name: "CHAVE DE FENDA 3/16 X 5\"", price: 5.80, category: "chaves", image: `${IMG}Img_ftr_rp_15401-300x300.JPG`, minQty: 24 },
  { id: 36, name: "CHAVE PHILLIPS 1/4 X 6\"", price: 6.20, category: "chaves", image: `${IMG}Img_ftr_rp_32201-300x300.JPG`, minQty: 24 },
  { id: 37, name: "CHAVE BIELA 8MM", price: 8.68, category: "chaves", image: `${IMG}Img_ftr_rp_28401-300x300.JPG`, minQty: 6 },
  { id: 38, name: "CHAVE BIELA 9MM", price: 9.04, category: "chaves", image: `${IMG}Img_ftr_rp_28501-300x300.JPG`, minQty: 6 },
  { id: 39, name: "CHAVE BIELA 10MM", price: 9.59, category: "chaves", image: `${IMG}Img_ftr_rp_28601-300x300.JPG`, minQty: 6 },
  { id: 40, name: "CHAVE BIELA 18MM", price: 19.54, category: "chaves", image: `${IMG}Img_ftr_rp_29401-300x300.JPG`, minQty: 6 },
  { id: 41, name: "CHAVE INGLESA 8\"", price: 17.13, category: "chaves", image: `${IMG}Img_ftr_rp_52801-300x300.PNG`, minQty: 6 },
  { id: 42, name: "CHAVE INGLESA 10\"", price: 24.42, category: "chaves", image: `${IMG}Img_ftr_rp_3001-300x300.JPEG`, minQty: 6 },
  { id: 102, name: "JG CHAVE ALEN 10 PCS G2 C1", price: 11.97, category: "chaves", image: `${IMG}Img_ftr_rp_46301-300x300.PNG`, minQty: 12 },
  { id: 103, name: "JOGO DE CHAVE COMBINADA C/ CATRACA 7 UND", price: 101.30, category: "chaves", image: `${IMG}Img_ftr_rp_47801-300x300.PNG`, minQty: 6 },
  { id: 104, name: "CHAVE BIELA 11MM", price: 10.20, category: "chaves", image: `${IMG}Img_ftr_rp_28701-300x300.JPG`, minQty: 6 },
  { id: 105, name: "CHAVE BIELA 12MM", price: 10.80, category: "chaves", image: `${IMG}Img_ftr_rp_28801-300x300.JPG`, minQty: 6 },
  { id: 106, name: "CHAVE BIELA 13MM", price: 11.40, category: "chaves", image: `${IMG}Img_ftr_rp_28901-300x300.JPG`, minQty: 6 },
  { id: 107, name: "CHAVE BIELA 14MM", price: 12.50, category: "chaves", image: `${IMG}Img_ftr_rp_29001-300x300.JPG`, minQty: 6 },
  { id: 108, name: "CHAVE BIELA 17MM", price: 17.80, category: "chaves", image: `${IMG}Img_ftr_rp_29301-300x300.JPG`, minQty: 6 },
  { id: 109, name: "CHAVE BIELA 19MM", price: 21.50, category: "chaves", image: `${IMG}Img_ftr_rp_29501-300x300.JPG`, minQty: 6 },

  // === CINTAS ===
  { id: 43, name: "CINTA COM CATRACA 9MX50MM 3.000KG", price: 47.94, category: "cintas", image: `${IMG}Img_ftr_rp_3101-300x300.JPG`, minQty: 10 },

  // === DISCOS ===
  { id: 44, name: "DISCO TUNGSTÊNIO PARA MADEIRA", price: 13.02, category: "discos", image: `${IMG}Img_ftr_rp_3601-300x300.JPG`, minQty: 10, badge: "Mais Vendido" },
  { id: 45, name: "DISCO TUNGSTÊNIO PARA METAL 115X22MM", price: 26.14, category: "discos", image: `${IMG}Img_ftr_rp_53301-300x300.PNG`, minQty: 10 },
  { id: 46, name: "DISCO PARA VIDRO 110MM", price: 15.54, category: "discos", image: `${IMG}Img_ftr_rp_20101-300x300.JPG`, minQty: 12 },
  { id: 47, name: "DISCO CORTE FINO 4.1/2\"", price: 4.20, category: "discos", image: `${IMG}Img_ftr_rp_44501-300x300.JPEG`, minQty: 25 },
  { id: 48, name: "DISCO DE CORTE MADEIRA 110mm 36 DENTES", price: 8.86, category: "discos", image: `${IMG}Img_ftr_rp_53001-300x300.PNG`, minQty: 20 },
  { id: 49, name: "DISCO DE CORTE MADEIRA 180MM 40D", price: 18.17, category: "discos", image: `${IMG}Img_ftr_rp_19901-300x300.PNG`, minQty: 10 },
  { id: 50, name: "DISCO DE CORTE MADEIRA 180MM 60D", price: 22.76, category: "discos", image: `${IMG}Img_ftr_rp_20001-300x300.PNG`, minQty: 10 },
  { id: 110, name: "DISCO DESBASTE 7\" FURO 22.23MM", price: 8.05, category: "discos", image: `${IMG}Img_ftr_rp_44601-300x300.JPEG`, minQty: 25 },
  { id: 111, name: "DISCO CORTE FINO 7\"", price: 6.80, category: "discos", image: `${IMG}Img_ftr_rp_44701-300x300.JPEG`, minQty: 25 },
  { id: 112, name: "DISCO DESBASTE 4.1/2\" FURO 22.23MM", price: 5.30, category: "discos", image: `${IMG}Img_ftr_rp_44401-300x300.JPEG`, minQty: 25 },
  { id: 113, name: "DISCO DE CORTE MADEIRA 110mm 24 DENTES", price: 7.50, category: "discos", image: `${IMG}Img_ftr_rp_52901-300x300.PNG`, minQty: 20 },

  // === TRENAS ===
  { id: 51, name: "TRENA EMBORRACHADA 3M X16MM", price: 6.50, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 24 },
  { id: 52, name: "TRENA EMBORRACHADA 5X25MM 3 TRAVAS", price: 10.72, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 12, badge: "Mais Vendido" },
  { id: 53, name: "TRENA EMBORRACHADA 7.5M X25MM", price: 14.90, category: "trenas", image: `${IMG}Img_ftr_rp_5901-300x300.JPG`, minQty: 6 },
  { id: 114, name: "TRENA FIBRA ABERTA 50M GOLFIELD G2 C1", price: 25.42, category: "trenas", image: `${IMG}Img_ftr_rp_24301-300x300.JPG`, minQty: 6 },
  { id: 115, name: "TRENA FIBRA ABERTA 20M PROFIELD G1 C1", price: 21.35, category: "trenas", image: `${IMG}Img_ftr_rp_56901-300x300.PNG`, minQty: 6 },
  { id: 116, name: "TRENA FIBRA DE VIDRO 20M PROFIELD G1 C1", price: 18.50, category: "trenas", image: `${IMG}Img_ftr_rp_56801-300x300.PNG`, minQty: 6 },
  { id: 117, name: "TRENA EMBORRACHADA 10M X25MM", price: 18.90, category: "trenas", image: `${IMG}Img_ftr_rp_6001-300x300.JPG`, minQty: 6 },

  // === TORNEIRAS E REGISTROS ===
  { id: 54, name: "TORNEIRA COZINHA PAREDE CROMADA (CRUZETA)", price: 21.53, category: "torneiras", image: `${IMG}Img_ftr_rp_34801-300x300.JPG`, minQty: 4 },
  { id: 55, name: "TORNEIRA ESFERA 1/2\"", price: 9.46, category: "torneiras", image: `${IMG}Img_ftr_rp_8001-300x300.JPG`, minQty: 20, badge: "Mais Vendido" },
  { id: 56, name: "REGISTRO ESFERA 3/4\"", price: 13.66, category: "torneiras", image: `${IMG}Img_ftr_rp_8901-300x300.JPG`, minQty: 12, badge: "Mais Vendido" },
  { id: 57, name: "VÁLVULA CROMADA COZINHAS", price: 9.04, category: "torneiras", image: `${IMG}Img_ftr_rp_57001-300x300.PNG`, minQty: 16, badge: "Novidade" },
  { id: 118, name: "TORNEIRA BICA MOVEL BANHEIRO ABS CROMADA BANCADA 1/4 VOLTA PALITO", price: 18.99, category: "torneiras", image: `${IMG}Img_ftr_rp_52401-300x300.PNG`, minQty: 4 },
  { id: 119, name: "TORNEIRA BICA MOVEL BANHEIRO ABS CROMADA BANCADA 1/4 VOLTA CRUZETA", price: 18.99, category: "torneiras", image: `${IMG}Img_ftr_rp_52301-300x300.PNG`, minQty: 4 },
  { id: 120, name: "TORNEIRA LAVATORIO BANCADA CROMADA PALITO", price: 22.43, category: "torneiras", image: `${IMG}Img_ftr_rp_50601-300x300.PNG`, minQty: 4 },
  { id: 121, name: "TORNEIRA TANQUE LONGA CROMADA PVC C-50", price: 15.20, category: "torneiras", image: `${IMG}Img_ftr_rp_48901-300x300.PNG`, minQty: 10 },
  { id: 122, name: "TORNEIRA TANQUE LONGA CROMADA PVC CRUZETA", price: 15.20, category: "torneiras", image: `${IMG}Img_ftr_rp_48801-300x300.PNG`, minQty: 10 },
  { id: 123, name: "TORNEIRA TANQUE CURTA BRANCA PVC PALITO", price: 7.42, category: "torneiras", image: `${IMG}Img_ftr_rp_49501-300x300.PNG`, minQty: 20 },
  { id: 124, name: "TORNEIRA TANQUE CURTA BRANCA PVC C-50", price: 7.42, category: "torneiras", image: `${IMG}Img_ftr_rp_49701-300x300.PNG`, minQty: 20 },
  { id: 125, name: "TORNEIRA TANQUE CURTA BRANCA PVC CRUZETA", price: 7.42, category: "torneiras", image: `${IMG}Img_ftr_rp_49601-300x300.PNG`, minQty: 20 },
  { id: 126, name: "TORNEIRA TANQUE CURTA CROMADA PVC PALITO", price: 11.03, category: "torneiras", image: `${IMG}Img_ftr_rp_49301-300x300.PNG`, minQty: 10 },
  { id: 127, name: "TORNEIRA TANQUE CURTA CROMADA PVC C-50", price: 11.03, category: "torneiras", image: `${IMG}Img_ftr_rp_49401-300x300.PNG`, minQty: 10 },
  { id: 128, name: "TORNEIRA LAVATORIO BANCADA CROMADA PVC ALAVANCA", price: 21.89, category: "torneiras", image: `${IMG}Img_ftr_rp_50501-300x300.PNG`, minQty: 4 },
  { id: 129, name: "TORNEIRA CHUVERINHO COZINHA PAREDE CROMADA (CRUZETA) ABS G2 C2", price: 32.74, category: "torneiras", image: `${IMG}Img_ftr_rp_51601-300x300.PNG`, minQty: 4 },
  { id: 130, name: "TORNEIRA CHUVEIRINHO COZINHA BANCADA CROMADA (CRUZETA) ABS", price: 32.92, category: "torneiras", image: `${IMG}Img_ftr_rp_51701-300x300.PNG`, minQty: 4 },
  { id: 131, name: "TORNEIRA CHUVEIRINHO COZINHA PAREDE CROMADA (PALITO) G2C2", price: 32.74, category: "torneiras", image: `${IMG}Img_ftr_rp_51801-300x300.PNG`, minQty: 4 },
  { id: 132, name: "TORNEIRA COZINHA BANCADA CROMADA (PALITO) G2 C2", price: 32.92, category: "torneiras", image: `${IMG}Img_ftr_rp_51401-300x300.PNG`, minQty: 4 },
  { id: 133, name: "TORNEIRA COZINHA BANCADA BRANCA (PALITO)", price: 16.64, category: "torneiras", image: `${IMG}Img_ftr_rp_51501-300x300.PNG`, minQty: 4 },
  { id: 134, name: "TORNEIRA BICA MOVEL BANHEIRO ABS BRANCA BANCADA (CRUZETA) G2 C2", price: 16.64, category: "torneiras", image: `${IMG}Img_ftr_rp_52101-300x300.PNG`, minQty: 4 },
  { id: 135, name: "TORNEIRA COZINHA BANCADA CROMADA (PALITO) ABS", price: 21.35, category: "torneiras", image: `${IMG}Img_ftr_rp_52201-300x300.PNG`, minQty: 4 },
  { id: 136, name: "REGISTRO ESFERA 1\"", price: 22.50, category: "torneiras", image: `${IMG}Img_ftr_rp_9001-300x300.JPG`, minQty: 10 },
  { id: 137, name: "TORNEIRA ESFERA 3/4\"", price: 11.50, category: "torneiras", image: `${IMG}Img_ftr_rp_8101-300x300.JPG`, minQty: 20 },

  // === DUCHAS ===
  { id: 58, name: "GATILHO DA DUCHA COM EMBALAGEM G2 C3", price: 12.30, category: "duchas", image: `${IMG}Img_ftr_rp_53701-300x300.PNG`, minQty: 20 },
  { id: 59, name: "DUCHA HIGIÊNICA BLISTER", price: 33.91, category: "duchas", image: `${IMG}Img_ftr_rp_9501-300x300.JPG`, minQty: 20 },

  // === FITAS ===
  { id: 60, name: "FITA DE VEDAÇÃO DE ROSCA 10M X 18MM", price: 1.01, category: "fitas", image: `${IMG}Img_ftr_rp_14401-300x300.JPG`, minQty: 10 },
  { id: 61, name: "FITA ISOLANTE 0,15MMX19MMX10M", price: 2.05, category: "fitas", image: `${IMG}Img_ftr_rp_15101-300x300.JPG`, minQty: 10 },
  { id: 62, name: "FITA ISOLANTE 0,15MMX19MMX20M", price: 3.61, category: "fitas", image: `${IMG}Img_ftr_rp_15201-300x300.JPG`, minQty: 200 },
  { id: 138, name: "FITA DE VEDAÇÃO DE ROSCA 25M X 18MM", price: 2.15, category: "fitas", image: `${IMG}Img_ftr_rp_14501-300x300.JPG`, minQty: 10 },
  { id: 139, name: "FITA DE VEDAÇÃO DE ROSCA 50M X 18MM", price: 4.10, category: "fitas", image: `${IMG}Img_ftr_rp_14601-300x300.JPG`, minQty: 10 },

  // === BITS E PONTAS ===
  { id: 63, name: "JOGO BITS FENDA/PHILIPS 65MM GOLFIELD", price: 10.30, category: "bits", image: `${IMG}Img_ftr_rp_46201-300x300.PNG`, minQty: 10 },
  { id: 64, name: "JOGO BITS PH2/PH2 65MM GOLFIELD", price: 10.30, category: "bits", image: `${IMG}Img_ftr_rp_48301-300x300.PNG`, minQty: 10 },
  { id: 140, name: "JOGO BITS FENDA/PHILIPS 110MM GOLFIELD", price: 15.50, category: "bits", image: `${IMG}Img_ftr_rp_54401-300x300.PNG`, minQty: 10 },
  { id: 141, name: "JOGO BITS PH2/PH2 110MM GOLFIELD", price: 15.50, category: "bits", image: `${IMG}Img_ftr_rp_48401-300x300.PNG`, minQty: 10 },
  { id: 142, name: "KIT PONTEIRAS PHILLIPS MAGNETICAS PH2X65MMX6MM 10PCS", price: 28.90, category: "bits", image: `${IMG}Img_ftr_rp_54301-300x300.PNG`, minQty: 10 },

  // === SOQUETES ===
  { id: 65, name: "JG PONTA E SOQUETE 41PCS PROFIELD G1 C1", price: 12.00, category: "soquetes", image: `${IMG}Img_ftr_rp_32201-300x300.JPG`, minQty: 48, badge: "Novidade" },
  { id: 66, name: "JOGO DE SOQUETE MAGNÉTICO 5/16 MM", price: 9.21, category: "soquetes", image: `${IMG}Img_ftr_rp_41801-300x300.JPG`, minQty: 10 },
  { id: 67, name: "JOGO DE SOQUETE MAGNÉTICO 6MM X 65MM", price: 10.64, category: "soquetes", image: `${IMG}Img_ftr_rp_17501-300x300.JPG`, minQty: 10 },
  { id: 68, name: "JOGO DE SOQUETE MAGNÉTICO 13MM X 65MM", price: 15.76, category: "soquetes", image: `${IMG}Img_ftr_rp_22801-300x300.JPG`, minQty: 10 },
  { id: 143, name: "JOGO DE SOQUETE MAGNÉTICO 8MM X 65MM", price: 11.20, category: "soquetes", image: `${IMG}Img_ftr_rp_17601-300x300.JPG`, minQty: 10 },
  { id: 144, name: "JOGO DE SOQUETE MAGNÉTICO 10MM X 65MM", price: 12.50, category: "soquetes", image: `${IMG}Img_ftr_rp_17701-300x300.JPG`, minQty: 10 },

  // === GRAMPEADORES ===
  { id: 69, name: "GRAMPEADOR MANUAL 4-14MM", price: 28.46, category: "grampeadores", image: `${IMG}Img_ftr_rp_15401-300x300.JPG`, minQty: 6 },

  // === BALANÇAS ===
  { id: 70, name: "BALANÇA DIGITAL PARA COZINHA 10KG", price: 13.02, category: "balancas", image: `${IMG}Img_ftr_rp_55101-300x300.PNG`, minQty: 24, badge: "Novidade" },
  { id: 71, name: "BALANÇA DIGITAL PARA COZINHA 5KG", price: 14.11, category: "balancas", image: `${IMG}Img_ftr_rp_55101-300x300.PNG`, minQty: 40 },

  // === MARTELOS ===
  { id: 72, name: "MARTELO UNHA 25MM CABO MADEIRA", price: 15.80, category: "martelos", image: `${IMG}Img_ftr_rp_53401-300x300.PNG`, minQty: 12 },
  { id: 73, name: "MARTELO BOLA 300G", price: 18.20, category: "martelos", image: `${IMG}Img_ftr_rp_53501-300x300.PNG`, minQty: 6 },
  { id: 145, name: "MARTELO UNHA 27MM CABO FIBRA", price: 22.50, category: "martelos", image: `${IMG}Img_ftr_rp_53601-300x300.PNG`, minQty: 6 },

  // === ESTILETES ===
  { id: 74, name: "ESTILETE LARGO 18MM", price: 3.50, category: "estiletes", image: `${IMG}Img_ftr_rp_55601-300x300.PNG`, minQty: 50 },
  { id: 146, name: "LAMINA PARA ESTILETE 18X0.5MM G1 C2", price: 3.32, category: "estiletes", image: `${IMG}Img_ftr_rp_32301-300x300.JPG`, minQty: 50 },

  // === LIXAS ===
  { id: 147, name: "LIXA PARA METAL 80# G2 C1", price: 73.81, category: "lixas", image: `${IMG}Img_ftr_rp_32401-300x300.JPG`, minQty: 1 },
  { id: 148, name: "LIXA PARA METAL 120# G2 C1", price: 73.81, category: "lixas", image: `${IMG}Img_ftr_rp_32501-300x300.JPG`, minQty: 1 },

  // === GRAMPOS ===
  { id: 149, name: "GRAMPO TIPO C TAM 6 GOLFIELD G2 C1", price: 22.79, category: "grampos", image: `${IMG}Img_ftr_rp_30201-300x300.JPG`, minQty: 6 },
  { id: 150, name: "GRAMPO TIPO C TAM 5 GOLFIELD G2 C1", price: 18.04, category: "grampos", image: `${IMG}Img_ftr_rp_30101-300x300.JPG`, minQty: 6 },
  { id: 151, name: "GRAMPO TIPO C TAM 4 GOLFIELD G2 C1", price: 14.50, category: "grampos", image: `${IMG}Img_ftr_rp_30001-300x300.JPG`, minQty: 12 },
  { id: 152, name: "GRAMPO TIPO C TAM 3 GOLFIELD G2 C1", price: 10.80, category: "grampos", image: `${IMG}Img_ftr_rp_16201-300x300.JPG`, minQty: 12 },

  // === CADEADOS ===
  { id: 153, name: "CADEADO PARA MOTO 22 X 100 CM", price: 36.09, category: "cadeados", image: `${IMG}Img_ftr_rp_31101-300x300.JPG`, minQty: 6 },

  // === ELÉTRICOS ===
  { id: 154, name: "CHALEIRA ELÉTRICA 1,8L 110V", price: 42.94, category: "eletricos", image: `${IMG}Img_ftr_rp_45101-300x300.JPEG`, minQty: 6 },

  // === IMÃS ===
  { id: 155, name: "IMÃ PARA PORTA GOLFIELD G1 C2", price: 16.52, category: "imas", image: `${IMG}Img_ftr_rp_53801-300x300.PNG`, minQty: 20 },

  // === OUTROS ===
  { id: 75, name: "ARAME LISO RECOZIDO", price: 14.25, category: "outros", image: `${IMG}Img_ftr_rp_54901-300x300.PNG`, minQty: 20 },
  { id: 76, name: "BANQUETA DOBRÁVEL 150KG 45CM", price: 42.00, category: "outros", image: `${IMG}Img_ftr_rp_55401-300x300.PNG`, minQty: 8 },
  { id: 156, name: "ARAME TORCIDO RECOZIDO", price: 14.25, category: "outros", image: `${IMG}Img_ftr_rp_54901-300x300.PNG`, minQty: 20 },
  { id: 157, name: "NIVEL DE ALUMINIO 14\" GOLFIELD G2 C1", price: 16.50, category: "outros", image: `${IMG}Img_ftr_rp_55201-300x300.PNG`, minQty: 12 },
  { id: 158, name: "NIVEL DE ALUMINIO 24\" GOLFIELD G2 C1", price: 28.90, category: "outros", image: `${IMG}Img_ftr_rp_55301-300x300.PNG`, minQty: 6 },
  { id: 159, name: "SERROTE 18\" GOLFIELD G2 C1", price: 18.50, category: "serras", image: `${IMG}Img_ftr_rp_55501-300x300.PNG`, minQty: 12 },
  { id: 160, name: "ESPATULA FLEXÍVEL 4\" GOLFIELD G2 C1", price: 5.80, category: "outros", image: `${IMG}Img_ftr_rp_55701-300x300.PNG`, minQty: 24 },
  { id: 161, name: "ESPATULA FLEXÍVEL 3\" GOLFIELD G2 C1", price: 4.90, category: "outros", image: `${IMG}Img_ftr_rp_55901-300x300.PNG`, minQty: 24 },
  { id: 162, name: "DESEMPENADEIRA AÇO 12X48CM GOLFIELD", price: 32.50, category: "outros", image: `${IMG}Img_ftr_rp_56001-300x300.PNG`, minQty: 6 },
];
