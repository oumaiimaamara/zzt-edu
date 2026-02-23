"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Erreur lors de l’inscription.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Erreur serveur, veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--fe-bg)] flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="rounded-3xl bg-[var(--fe-surface)] p-8 shadow-lg">
          {/* ===== HEADER ===== */}
          <div className="mb-6 text-center">
            <div
              className="
                mx-auto mb-4 flex h-12 w-12 items-center justify-center
                rounded-2xl bg-[var(--fe-soft)]
                shadow-inner
              "
            >
              LOGO SITE
            </div>

            <h1 className="text-2xl font-semibold text-[var(--fe-text-main)]">
              Créer votre espace parent
            </h1>
            <p className="mt-2 text-sm text-[var(--fe-text-soft)]">
              Rejoignez <span className="font-medium text-[var(--fe-text-main)]">
                Kido Paradise
              </span>{" "}
              et avancez sereinement avec votre enfant.
            </p>
          </div>

          {/* ===== ERROR ===== */}
          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 shadow-inner">
              {error}
            </div>
          )}

          {/* ===== FORM ===== */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--fe-text-main)]">
                Votre nom
              </label>
              <input
                type="text"
                placeholder="Ex : Selima"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="
                  mt-2 w-full rounded-2xl px-4 py-3 text-sm
                  bg-[var(--fe-bg)]
                  text-[var(--fe-text-main)]
                  placeholder:text-[var(--fe-text-soft)]
                  outline-none shadow-inner
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--fe-text-main)]">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="
                  mt-2 w-full rounded-2xl px-4 py-3 text-sm
                  bg-[var(--fe-bg)]
                  text-[var(--fe-text-main)]
                  placeholder:text-[var(--fe-text-soft)]
                  outline-none shadow-inner
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--fe-text-main)]">
                Mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  mt-2 w-full rounded-2xl px-4 py-3 text-sm
                  bg-[var(--fe-bg)]
                  text-[var(--fe-text-main)]
                  placeholder:text-[var(--fe-text-soft)]
                  outline-none shadow-inner
                "
              />
            </div>

            {/* ===== CTA ===== */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-3 inline-flex w-full items-center justify-center
                rounded-2xl px-6 py-3 font-semibold
                bg-[var(--fe-green)]
                text-[var(--fe-text-main)]
                shadow-[0_6px_0_rgba(0,0,0,0.08)]
                hover:translate-y-[1px]
                transition
                disabled:opacity-60
              "
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          {/* ===== FOOTER ===== */}
          <div className="mt-6 text-center text-xs text-[var(--fe-text-soft)]">
            Tu as déjà un compte ?{" "}
            <button
              onClick={() => router.push("/login")}
              className="font-medium text-[var(--fe-text-main)] hover:underline"
            >
              Se connecter
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--fe-text-soft)]">
          Vos informations servent uniquement à vous donner accès à votre
          espace personnel.
        </p>
      </section>
    </main>
  );
}
