"use client";

import Link from "next/link";
import { useCart } from "@/app/providers";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total, clear } = useCart();

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/30 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform
          bg-[var(--fe-surface)] shadow-xl transition-transform
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--fe-text-main)]">
              Votre panier
            </h3>
            <p className="text-sm text-[var(--fe-text-soft)]">
              {items.length} produit(s)
            </p>
          </div>
          <button
            onClick={closeCart}
            className="
              rounded-xl px-3 py-2
              text-[var(--fe-text-main)]
              hover:bg-[var(--fe-soft)]
              transition
            "
          >
            ✕
          </button>
        </div>

        {/* content */}
        <div className="h-[calc(100%-210px)] overflow-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-[var(--fe-soft)] p-4 shadow-inner">
              <p className="font-medium text-[var(--fe-text-main)]">
                Vous n’avez pas encore de produit.
              </p>
              <p className="mt-1 text-sm text-[var(--fe-text-soft)]">
                Découvrez nos cours et ajoutez-en un au panier.
              </p>
              <Link
                onClick={closeCart}
                href="/videos"
                className="
                  mt-4 inline-flex rounded-2xl px-4 py-2 font-medium
                  bg-[var(--fe-green)]
                  text-[var(--fe-text-main)]
                  shadow-[0_4px_0_rgba(0,0,0,0.08)]
                  hover:translate-y-[1px]
                  transition
                "
              >
                Aller vers les cours
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(it.coverImageUrl && it.coverImageUrl.trim()) || "/placeholder-cover.jpg"}
                    alt={it.title}
                    className="h-16 w-24 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--fe-text-main)]">
                      {it.title}
                    </p>
                    <p className="text-sm text-[var(--fe-text-soft)]">
                      {Math.round(it.price)} DT • x{it.qty}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(it.id)}
                    className="
                      rounded-xl px-3 py-2 text-sm font-medium
                      text-[var(--fe-text-main)]
                      hover:bg-[var(--fe-soft)]
                      transition
                    "
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-black/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[var(--fe-text-soft)]">Total</span>
            <span className="text-lg font-semibold text-[var(--fe-text-main)]">
              {Math.round(total)} DT
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/checkout"
              onClick={closeCart}
              className={`flex-1 rounded-2xl px-4 py-2 text-center font-medium transition
                ${
                  items.length
                    ? `
                      bg-[var(--fe-green)]
                      text-[var(--fe-text-main)]
                      shadow-[0_4px_0_rgba(0,0,0,0.08)]
                      hover:translate-y-[1px]
                    `
                    : "bg-gray-100 text-gray-400 pointer-events-none"
                }
              `}
            >
              Valider la commande
            </Link>

            <button
              onClick={closeCart}
              className="
                flex-1 rounded-2xl px-4 py-2 font-medium
                bg-[var(--fe-soft)]
                text-[var(--fe-text-main)]
                hover:bg-[var(--fe-mauve)]
                transition
              "
            >
              Continuer
            </button>
          </div>

          {items.length ? (
            <button
              onClick={clear}
              className="
                mt-3 w-full rounded-2xl px-4 py-2 text-sm font-medium
                text-[var(--fe-text-soft)]
                hover:bg-[var(--fe-soft)]
                transition
              "
            >
              Vider le panier
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
