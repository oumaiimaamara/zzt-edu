import { Suspense } from "react";
import LoginClient from "./loginClient"; 

export const dynamic = "force-dynamic"; 

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
      <LoginClient />
    </Suspense>
  );
}
