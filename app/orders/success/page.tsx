import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

export const dynamic = "force-dynamic"; // empêche le prerender statique

export default function Page() {
  return (
    <Suspense fallback={<p>Chargement…</p>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
