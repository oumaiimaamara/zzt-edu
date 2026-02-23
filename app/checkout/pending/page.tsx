"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutPendingPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-yellow-700">
          Merci pour votre commande 🙏
        </h1>

        <p className="mt-4 text-gray-600">
          Nous avons bien reçu votre demande de paiement par virement bancaire.
        </p>

        <p className="mt-2 text-gray-600">
          Un de nos agents va valider votre reçu de paiement.
        </p>

        <p className="mt-2 text-gray-600">
          Vous pourrez consulter vos cours après validation.
        </p>

        <p className="mt-2 text-gray-600 font-medium">
          Merci pour votre patience.
        </p>

        {orderId && (
          <p className="mt-4 text-sm text-gray-400">
            Commande n° {orderId}
          </p>
        )}

        <Link
          href="/account"
          className="inline-block mt-6 rounded-xl bg-yellow-600 px-6 py-3 text-white font-medium hover:bg-yellow-700 transition"
        >
          Retour à mon compte
        </Link>
      </div>
    </main>
  );
}
