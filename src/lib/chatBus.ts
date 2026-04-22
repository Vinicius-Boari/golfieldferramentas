// Bus simples de eventos para o assistente virtual interagir com a Index
// (filtrar categoria, buscar produto). A Index escuta esses eventos.
type ChatBusEventMap = {
  "chat:setCategory": string; // id normalizado da categoria (ex: "discos") ou "todos"
  "chat:setSearch": string;   // termo de busca
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
