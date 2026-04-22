// Bus simples de eventos para o assistente virtual interagir com a Index/Cart
type ChatBusEventMap = {
  "chat:setCategory": string;                                      // id normalizado da categoria (ex: "discos") ou "todos"
  "chat:setSearch": string;                                        // termo de busca
  "chat:addToCart": { query: string; quantity: number; replyId: string }; // pedir adição ao carrinho
  "chat:openCart": void;                                           // abrir carrinho
};

// Resposta do handler do carrinho de volta para o widget
export type CartReplyPayload =
  | {
      ok: true;
      replyId: string;
      productName: string;
      requestedQty: number;        // quanto o cliente pediu
      addedQty: number;            // quanto realmente foi adicionado (já múltiplo do minQty)
      minQty: number;              // mínimo / passo do produto
      adjusted: boolean;           // true se tivemos que mexer na quantidade
      adjustReason?: "below_min" | "not_multiple"; // motivo do ajuste
    }
  | { ok: false; replyId: string; reason: "not_found" | "error"; query: string };

type CartReplyListener = (r: CartReplyPayload) => void;
const cartReplyListeners = new Set<CartReplyListener>();
export const onCartReply = (cb: CartReplyListener) => {
  cartReplyListeners.add(cb);
  return () => { cartReplyListeners.delete(cb); };
};
export const emitCartReply = (r: CartReplyPayload) => {
  cartReplyListeners.forEach((cb) => { try { cb(r); } catch (e) { console.error(e); } });
};

type Listener<E extends keyof ChatBusEventMap> = (payload: ChatBusEventMap[E]) => void;

const listeners: { [K in keyof ChatBusEventMap]?: Set<Listener<K>> } = {};

export const chatBus = {
  on<E extends keyof ChatBusEventMap>(event: E, cb: Listener<E>) {
    if (!listeners[event]) listeners[event] = new Set() as any;
    (listeners[event] as Set<Listener<E>>).add(cb);
    return () => {
      (listeners[event] as Set<Listener<E>>).delete(cb);
    };
  },
  emit<E extends keyof ChatBusEventMap>(event: E, payload: ChatBusEventMap[E]) {
    (listeners[event] as Set<Listener<E>> | undefined)?.forEach((cb) => {
      try { cb(payload); } catch (e) { console.error(e); }
    });
  },
};

export const normalizeCategoryId = (s: string) =>
  s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
