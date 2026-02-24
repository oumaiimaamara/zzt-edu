"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Paiement réussi 
        </h1>

        <p className="mt-4 text-gray-600">
          Votre paiement a bien été pris en compte.
        </p>

        {orderId && (
          <p className="mt-4 text-sm text-gray-400">
            Commande n° {orderId}
          </p>
        )}

        <Link
          href="/account"
          className="inline-block mt-6 rounded-xl bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition"
        >
          Retour à mon compte
        </Link>
      </div>
    </main>
  );
}
