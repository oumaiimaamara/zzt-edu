"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Merci pour votre commande 🎉
        </h1>

        <p className="mt-4 text-gray-600">
          Votre paiement a été confirmé avec succès.
        </p>

        <p className="mt-2 text-gray-600">
          Vous pouvez accéder immédiatement à vos cours.
        </p>

        {orderId && (
          <p className="mt-4 text-sm text-gray-400">
            Commande n° {orderId}
          </p>
        )}

        <Link
          href="/library"
          className="inline-block mt-6 rounded-xl bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition"
        >
          Accéder à mes cours
        </Link>
      </div>
    </main>
  );
}
