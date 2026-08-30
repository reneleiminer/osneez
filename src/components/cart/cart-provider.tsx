"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  addLine,
  clearLines,
  getServerSnapshot,
  getSnapshot,
  removeLine,
  setLineQuantity,
  subscribe,
} from "@/lib/shop/bag-store";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/site";
import type { CartLineView } from "@/types/shop";

type CartContextValue = {
  lines: CartLineView[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  remaining: number;
  qualifiesForFreeShipping: boolean;
  open: () => void;
  close: () => void;
  add: (line: CartLineView) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  // Lock the page behind the drawer and wire up Escape.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const add = useCallback((line: CartLineView) => {
    addLine(line);
    setIsOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0,
    );
    return {
      lines,
      count,
      subtotal,
      isOpen,
      remaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
      qualifiesForFreeShipping: subtotal >= FREE_SHIPPING_THRESHOLD,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity: setLineQuantity,
      remove: removeLine,
      clear: clearLines,
    };
  }, [lines, isOpen, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
