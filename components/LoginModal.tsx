"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur login.");

      // Support plusieurs formats de réponse possibles
      const token = data?.token || data?.accessToken || data?.jwt || "";
      if (!token) throw new Error("Token manquant dans la réponse login.");

      localStorage.setItem("token", token);

      onSuccess();
    } catch (e: any) {
      setErr(e?.message || "Erreur login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950">
                Connectez-vous pour continuer
              </h3>
              <p className="mt-1 text-sm text-emerald-900/70">
                Vous resterez sur cette page après connexion.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-emerald-950 hover:bg-emerald-50"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-900/10 focus:outline-none"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              type="password"
              className="w-full rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-900/10 focus:outline-none"
              required
            />

            {err ? (
              <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-800">
                {err}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-400/90 px-4 py-3 font-medium text-white transition hover:bg-orange-500 disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/*"use client";

import { useState } from "react";

export default function LoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.message || "Erreur login.");
        setLoading(false);
        return;
      }

      // On s'attend à { token: "..." }
      const token = data?.token;
      if (!token) {
        setErr("Token manquant dans la réponse login.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      setErr("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-emerald-950">
              Se connecter
            </h2>
            <p className="mt-1 text-sm text-emerald-900/70">
              Connectez-vous pour continuer le paiement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1 text-sm text-emerald-900/70 hover:bg-emerald-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Mot de passe
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
*/