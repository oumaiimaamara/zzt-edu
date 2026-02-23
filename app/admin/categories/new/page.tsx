"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data?.error || "Erreur");
      setLoading(false);
      return;
    }

    router.push("/admin/categories");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-emerald-950">Nouvelle catégorie</h1>

        <form onSubmit={onSubmit} className="mt-6 rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5">
          <label className="block text-sm font-medium text-emerald-950">
            Nom catégorie
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Ex: Sommeil, Alimentation..."
          />

          {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}

          <button
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </form>
      </section>
    </main>
  );
}
