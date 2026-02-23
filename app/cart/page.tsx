"use client";

import Link from "next/link";
import { useCart } from "@/app/providers";

export default function CartPage() {
  const { items, removeItem, total, clear } = useCart();

  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-semibold text-[var(--fe-text-main)]">
          Panier
        </h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-[var(--fe-surface)] p-8 shadow">
            <p className="font-medium text-[var(--fe-text-main)]">
              Votre panier est vide.
            </p>
            <p className="mt-2 text-[var(--fe-text-soft)]">
              Découvrez nos cours et commencez dès aujourd’hui.
            </p>

            <Link
              href="/videos"
              className="
                mt-6 inline-flex rounded-2xl px-6 py-3 font-medium
                bg-[var(--fe-green)]
                shadow-[0_6px_0_rgba(0,0,0,0.08)]
                hover:translate-y-[1px]
                transition
              "
            >
              Parcourir les cours
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-4 rounded-3xl bg-[var(--fe-surface)] p-4 shadow"
              >
                {/* image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    (it.coverImageUrl && it.coverImageUrl.trim()) ||
                    "/placeholder-cover.jpg"
                  }
                  alt={it.title}
                  className="h-20 w-28 rounded-2xl object-cover"
                />

                {/* info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--fe-text-main)]">
                    {it.title}
                  </p>
                  <p className="text-sm text-[var(--fe-text-soft)]">
                    {Math.round(it.price)} DT • x{it.qty}
                  </p>
                </div>

                {/* remove */}
                <button
                  onClick={() => removeItem(it.id)}
                  className="
                    rounded-2xl px-4 py-2 text-sm font-medium
                    bg-[var(--fe-soft)]
                    hover:bg-[var(--fe-mauve)]
                    transition
                  "
                >
                  Supprimer
                </button>
              </div>
            ))}

            {/* total */}
            <div className="mt-6 rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
              <div className="flex items-center justify-between">
                <span className="text-[var(--fe-text-soft)]">Total</span>
                <span className="text-xl font-semibold text-[var(--fe-text-main)]">
                  {Math.round(total)} DT
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href="/checkout"
                  className="
                    flex-1 rounded-2xl px-4 py-3 text-center font-medium
                    bg-[var(--fe-green)]
                    shadow-[0_6px_0_rgba(0,0,0,0.08)]
                    hover:translate-y-[1px]
                    transition
                  "
                >
                  Valider la commande
                </Link>

                <Link
                  href="/videos"
                  className="
                    flex-1 rounded-2xl px-4 py-3 text-center font-medium
                    bg-[var(--fe-soft)]
                    hover:bg-[var(--fe-mauve)]
                    transition
                  "
                >
                  Continuer
                </Link>
              </div>

              <button
                onClick={clear}
                className="
                  mt-4 w-full rounded-2xl px-4 py-2 text-sm
                  text-[var(--fe-text-soft)]
                  hover:bg-[var(--fe-soft)]
                  transition
                "
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
