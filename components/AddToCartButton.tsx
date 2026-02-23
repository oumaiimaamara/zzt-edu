"use client";

import { useCart } from "@/app/providers";

type Props = {
  id: string;
  title: string;
  price: number;
  coverImageUrl?: string | null;
  categoryName?: string | null;
  href?: string | null;
};

export default function AddToCartButton(props: Props) {
  const cart = useCart();

  return (
    <button
      type="button"
      onClick={() => cart.addItem(props)}
      className="inline-flex items-center justify-center rounded-2xl bg-orange-400/90 px-4 py-2 text-white font-medium hover:bg-orange-500 transition"
    >
      Acheter
    </button>
  );
}
