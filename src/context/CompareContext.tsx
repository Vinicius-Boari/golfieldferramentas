import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Product } from "@/data/products";
import { toast } from "sonner";

interface CompareCtx {
  items: Product[];
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  toggle: (p: Product) => void;
  remove: (id: Product["id"]) => void;
  clear: () => void;
  has: (id: Product["id"]) => boolean;
  max: number;
}

const CompareContext = createContext<CompareCtx | null>(null);
const STORAGE_KEY = "golfield:compare:v1";
const MAX_ITEMS = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const has = useCallback((id: Product["id"]) => items.some(i => i.id === id), [items]);

  const toggle = useCallback((p: Product) => {
    setItems(prev => {
      if (prev.some(i => i.id === p.id)) {
        toast.info(`"${p.name}" removido da comparação`);
        return prev.filter(i => i.id !== p.id);
      }
      if (prev.length >= MAX_ITEMS) {
        toast.warning(`Máximo de ${MAX_ITEMS} produtos para comparar`);
        return prev;
      }
      toast.success(`"${p.name}" adicionado à comparação`);
      return [...prev, p];
    });
  }, []);

  const remove = useCallback((id: Product["id"]) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, isOpen, setIsOpen, toggle, remove, clear, has, max: MAX_ITEMS
  }), [items, isOpen, toggle, remove, clear, has]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
