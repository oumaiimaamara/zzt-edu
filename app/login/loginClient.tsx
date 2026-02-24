"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Erreur de connexion.");
        return;
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      router.push(next);
    } catch {
      setError("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--fe-bg)] flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="rounded-3xl bg-[var(--fe-surface)] p-8 shadow-lg">
          {/* HEADER */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fe-soft)] shadow-inner">
              Logo site
            </div>
            <h1 className="text-2xl font-semibold text-[var(--fe-text-main)]">
              Heureux de vous revoir
            </h1>
            <p className="mt-2 text-sm text-[var(--fe-text-soft)]">
              Connectez-vous pour accéder à votre espace personnel.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-inner">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--fe-text-main)]">
                Email
              </label>
              <input
                className="mt-2 w-full rounded-2xl px-4 py-3 text-sm bg-[var(--fe-bg)] text-[var(--fe-text-main)] placeholder:text-[var(--fe-text-soft)] outline-none shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="exemple@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--fe-text-main)]">
                Mot de passe
              </label>
              <input
                className="mt-2 w-full rounded-2xl px-4 py-3 text-sm bg-[var(--fe-bg)] text-[var(--fe-text-main)] placeholder:text-[var(--fe-text-soft)] outline-none shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              disabled={loading}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 font-semibold bg-[var(--fe-green)] text-[var(--fe-text-main)] shadow-[0_6px_0_rgba(0,0,0,0.08)] hover:translate-y-[1px] transition disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center text-xs text-[var(--fe-text-soft)]">
            Pas encore de compte ?{" "}
            <button
              onClick={() =>
                router.push(`/signup?next=${encodeURIComponent(next)}`)
              }
              className="font-medium text-[var(--fe-text-main)] hover:underline"
            >
              Créer un compte
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--fe-text-soft)]">
          Vous serez automatiquement redirigé là où vous étiez.
        </p>
      </section>
    </main>
  );
}
