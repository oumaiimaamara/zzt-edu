import { Suspense } from "react";
import OrderNewClient from "./OrderNewClient";

export const dynamic = "force-dynamic"; // empêche le prerender statique

export default function OrderNewPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement…</div>}>
      <OrderNewClient />
    </Suspense>
  );
}
