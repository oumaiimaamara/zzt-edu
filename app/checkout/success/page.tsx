import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
