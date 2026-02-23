"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

type CartItem = {
  categoryName: string;
  id: string;
  title: string;
  price: number;
  coverImageUrl?: string | null;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Optionnel: persister panier
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Permet d’ouvrir le panier via event global (si besoin)
  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("cart:open", onOpen as EventListener);
    return () => window.removeEventListener("cart:open", onOpen as EventListener);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item) => {
      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === item.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
          return copy;
        }
        return [...prev, { ...item, qty: 1 }];
      });
      setIsOpen(true);
    };

    const removeItem: CartContextValue["removeItem"] = (id) => {
      setItems((prev) => prev.filter((p) => p.id !== id));
    };

    const clear = () => setItems([]);

    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

    return {
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      clear,
      total,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}
