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

export default function AddToCartButton({
  item,
  disabled,
}: {
  item: CartItem;
  disabled?: boolean;
}) {
  const cart = useCart();
  const [loading, setLoading] = useState(false);

  const openCartPopup = () => {
    // compatibilité multi-implémentations
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
      // fallback
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
      className={[
        "inline-flex items-center justify-center",
        "rounded-2xl px-4 py-2 font-medium",
        "bg-[var(--fe-green)]",
        "text-[var(--fe-text-main)]",
        "shadow-[0_6px_0_rgba(0,0,0,0.08)]",
        "hover:translate-y-[1px]",
        "hover:shadow-[0_4px_0_rgba(0,0,0,0.08)]",
        "transition",
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {loading ? "Ajout..." : "Acheter"}
    </button>
  );
}
