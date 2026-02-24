import { Suspense } from "react";
import CheckoutPendingClient from "./CheckoutPendingClient";

export const dynamic = "force-dynamic";

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <CheckoutPendingClient />
    </Suspense>
  );
}
