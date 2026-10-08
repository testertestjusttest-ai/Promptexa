"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Plan, Product } from "./types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, plan: Plan, qty?: number) => void;
  removeItem: (planId: string) => void;
  updateQty: (planId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "digiplyra_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* ignore */
      }
    }
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * i.plan.price_bdt, 0);
    return {
      items,
      count,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (product, plan, qty = 1) =>
        setItems((prev) => {
          const found = prev.find((i) => i.plan.id === plan.id);
          if (found) {
            return prev.map((i) =>
              i.plan.id === plan.id ? { ...i, qty: i.qty + qty } : i
            );
          }
          return [...prev, { product, plan, qty }];
        }),
      removeItem: (planId) =>
        setItems((prev) => prev.filter((i) => i.plan.id !== planId)),
      updateQty: (planId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.plan.id !== planId)
            : prev.map((i) => (i.plan.id === planId ? { ...i, qty } : i))
        ),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
