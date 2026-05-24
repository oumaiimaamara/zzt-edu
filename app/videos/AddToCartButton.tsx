"use client";

import { useState } from "react";
import { useCart } from "@/app/providers";

type CartItem = {
  id: string;
  title: string;
  price: number;
  coverImageUrl?: string;
  categoryName?: string;
  categorySlug?: string;
  slug?: string;
};

export default function AddToCartButton({ item, disabled }: { item: CartItem; disabled?: boolean }) {
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  const openCartPopup = () => {
    // @ts-ignore
    if (typeof cart?.openCart === "function") return cart.openCart();
    // @ts-ignore
    if (typeof cart?.open === "function") return cart.open();
    // @ts-ignore
    if (typeof cart?.setOpen === "function") return cart.setOpen(true);
    window.dispatchEvent(new CustomEvent("cart:open"));
  };

  const addToCart = () => {
    // @ts-ignore
    if (typeof cart?.addItem === "function") return cart.addItem(item);
    // @ts-ignore
    if (typeof cart?.add === "function") return cart.add(item);
    // @ts-ignore
    if (typeof cart?.setItems === "function") {
      // @ts-ignore
      cart.setItems((prev: any[]) => {
        const exists = prev?.some((p) => p?.id === item.id);
        return exists ? prev : [...(prev || []), item];
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("cart:add", { detail: item }));
  };

  async function onClick() {
    if (disabled || loading) return;
    setLoading(true);
    try {
      addToCart();
      openCartPopup();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: disabled || loading ? "rgba(139,108,199,0.5)" : "linear-gradient(135deg, #8b6cc7, #6b4fa0)",
        boxShadow: disabled || loading ? "none" : "0 2px 10px rgba(107,79,160,0.3)",
      }}
    >
      {loading ? "Ajout..." : "🛒 Acheter"}
    </button>
  );
}