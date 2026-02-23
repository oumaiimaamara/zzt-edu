"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5">
          <h1 className="text-2xl font-semibold text-emerald-950">
            ✅ Paiement validé
          </h1>
          <p className="mt-2 text-emerald-900/70">
            Votre accès est activé. Vous pouvez maintenant regarder le cours en toute sécurité.
          </p>

          {orderId ? (
            <p className="mt-3 text-xs text-emerald-900/60">
              Commande : {orderId}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/videos"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-700 transition"
            >
              Retour au catalogue
            </Link>

            <Link
              href="/library"
              className="rounded-2xl bg-emerald-50 px-5 py-3 text-emerald-950 font-medium ring-1 ring-emerald-900/10 hover:bg-emerald-100 transition"
            >
              Ma bibliothèque
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
