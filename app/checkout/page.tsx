"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/providers";
import LoginModal from "@/components/LoginModal";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();

  const [method, setMethod] = useState<"transfer" | "online">("transfer");
  const [receipt, setReceipt] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [showLogin, setShowLogin] = useState(false);

  const total = useMemo(() => cart.total, [cart.total]);

  useEffect(() => {
    if (cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [cart.items.length, router]);

  async function ensureAuthOrOpenLogin() {
    const token = getToken();
    if (!token) {
      setShowLogin(true);
      return "";
    }
    return token;
  }

  async function createOrder(videoId: string, token: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur création commande.");

    return data?.order?.id || data?.orderId || data?.id;
  }

  async function payOnline(orderId: string, token: string) {
    const res = await fetch(`/api/orders/${orderId}/pay-online`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur paiement online.");
  }

  async function payTransfer(orderId: string, token: string) {
    const form = new FormData();
    if (receipt) form.append("file", receipt);

    const res = await fetch(`/api/orders/${orderId}/pay-transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur transfert bancaire.");
  }

  async function onConfirm() {
    setErr("");

    const token = await ensureAuthOrOpenLogin();
    if (!token) return;

    if (method === "transfer" && !receipt) {
      setErr("Veuillez joindre un reçu pour le transfert.");
      return;
    }

    if (cart.items.length === 0) return;

    setLoading(true);

    try {
      // 👉 1 seule commande à la fois (UX + logique propre)
      const item = cart.items[0];

      const orderId = await createOrder(item.id, token);

      if (method === "online") {
        await payOnline(orderId, token);
        cart.clear();
        router.push(`/checkout/success?orderId=${orderId}`);
        return;
      }

      if (method === "transfer") {
        await payTransfer(orderId, token);
        cart.clear();
        router.push(`/checkout/pending?orderId=${orderId}`);
        return;
      }
    } catch (e: any) {
      setErr(e?.message || "Erreur checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-4xl px-4 py-14">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold">
            Paiement
          </h1>
          <p className="mt-2 text-gray-500">
            Vérifiez votre panier et choisissez votre mode de paiement.
          </p>
        </header>

        <div className="rounded-3xl bg-white p-6 shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Articles</p>
              <p className="text-lg font-semibold">
                {cart.items.length} cours
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-semibold">
                {Math.round(total)} DT
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {cart.items.map((it) => (
              <div
                key={it.id}
                className="flex justify-between rounded-2xl bg-gray-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{it.title}</p>
                  <p className="text-xs text-gray-500">
                    {it.categoryName ?? "—"}
                  </p>
                </div>
                <div className="font-semibold">
                  {Math.round(Number(it.price || 0))} DT
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 p-5">
            <p className="font-medium">Mode de paiement</p>

            <div className="mt-4 flex gap-3">
              {(["transfer", "online"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-2xl px-5 py-2 font-medium ${
                    method === m ? "bg-green-500 text-white" : "bg-white"
                  }`}
                >
                  {m === "transfer" ? "Transfert bancaire" : "Paiement online"}
                </button>
              ))}
            </div>

            {method === "transfer" && (
              <input
                type="file"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                className="mt-4 w-full rounded-xl border p-3"
              />
            )}
          </div>

          {err && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-red-700 text-sm">
              {err}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-2xl bg-green-600 px-6 py-3 text-white font-medium"
            >
              {loading ? "Traitement..." : "Confirmer le paiement"}
            </button>

            <Link
              href="/cart"
              className="rounded-2xl px-6 py-3 bg-gray-100"
            >
              Retour panier
            </Link>
          </div>
        </div>
      </section>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />
    </main>
  );
}
