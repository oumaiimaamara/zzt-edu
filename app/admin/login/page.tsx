"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/check", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          router.replace("/admin");
        }
      });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      {/* ton formulaire login ici */}
    </main>
  );
}
