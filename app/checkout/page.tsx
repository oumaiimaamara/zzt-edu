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
  const [err, setErr] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const total = useMemo(() => cart.total, [cart.total]);

  useEffect(() => {
    if (cart.items.length === 0 && !isSubmitting) {
      router.replace("/cart");
    }
  }, [cart.items.length, isSubmitting, router]);

  async function ensureAuthOrOpenLogin() {
    const token = getToken();
    if (!token) { setShowLogin(true); return ""; }
    return token;
  }

  async function createOrder(videoId: string, token: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ videoId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur création commande.");
    const orderId = data?.order?.id || data?.orderId || data?.id;
    if (!orderId) throw new Error("orderId manquant (réponse /api/orders).");
    return orderId as string;
  }

  async function payOnline(orderId: string, token: string) {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method: "online" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur paiement online.");
    return true;
  }

  async function payTransfer(orderId: string, token: string) {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ method: "transfer", receiptName: receipt?.name || null }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Erreur paiement transfert.");
    return true;
  }

  async function onConfirm() {
    setErr("");
    const token = await ensureAuthOrOpenLogin();
    if (!token) return;
    if (method === "transfer" && !receipt) {
      setErr("Veuillez joindre un reçu (scan/photo) pour le transfert.");
      return;
    }
    setLoading(true);
    setIsSubmitting(true);
    try {
      const orderIds: string[] = [];
      for (const item of cart.items) {
        const oid = await createOrder(item.id, token);
        orderIds.push(oid);
      }
      const lastOrderId = orderIds[orderIds.length - 1];
      if (method === "online") {
        for (const oid of orderIds) await payOnline(oid, token);
      } else {
        for (const oid of orderIds) await payTransfer(oid, token);
      }
      cart.clear();
      router.push(`/orders/success?orderId=${lastOrderId}`);
    } catch (e: any) {
      setIsSubmitting(false);
      setErr(e?.message || "Erreur checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #f5f0eb 0%, #ede8f5 50%, #f5f0eb 100%)" }}
    >
      {/* Header décoratif */}
      <div
        className="relative overflow-hidden px-4 pb-8 pt-12"
        style={{ background: "linear-gradient(135deg, #e8e0f5 0%, #f0e8e0 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #c4b0e8 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-8 h-40 w-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #d4a574 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-2xl">
          <div
            className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "#ede0ff", color: "#6b4fa0" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#8b6cc7" }} />
            Finalisation de commande
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#2d1f4e" }}>
            Votre panier
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#7c6a9a" }}>
            Choisissez votre mode de paiement et confirmez.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-2xl px-4 py-8">
        {/* Récap articles */}
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(180,160,220,0.25)",
            boxShadow: "0 4px 24px rgba(100,70,160,0.06)",
          }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(180,160,220,0.2)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#7c6a9a" }}>
                {cart.items.length} cours sélectionné{cart.items.length > 1 ? "s" : ""}
              </span>
              <span className="text-xl font-bold" style={{ color: "#2d1f4e" }}>
                {Math.round(total)} DT
              </span>
            </div>
          </div>

          <div className="divide-y px-6" style={{ borderColor: "rgba(180,160,220,0.15)" }}>
            {cart.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm"
                    style={{ background: "linear-gradient(135deg, #e8d8f8, #d8e8f8)", color: "#6b4fa0" }}
                  >
                    🎓
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "#2d1f4e" }}>
                      {it.title}
                    </p>
                    <p className="text-xs" style={{ color: "#a090bc" }}>
                      {it.categoryName ?? "—"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold" style={{ color: "#8b6cc7" }}>
                  {Math.round(Number(it.price || 0))} DT
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode de paiement */}
        <div
          className="mt-4 overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(180,160,220,0.25)",
            boxShadow: "0 4px 24px rgba(100,70,160,0.06)",
          }}
        >
          <div className="px-6 pt-5 pb-4">
            <p className="text-sm font-semibold" style={{ color: "#2d1f4e" }}>
              Mode de paiement
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("transfer")}
                className="relative flex flex-col items-start rounded-2xl p-4 text-left transition-all"
                style={
                  method === "transfer"
                    ? {
                        background: "linear-gradient(135deg, #e8d8f8, #d8c8f0)",
                        border: "2px solid #8b6cc7",
                        boxShadow: "0 0 0 4px rgba(139,108,199,0.1)",
                      }
                    : { background: "rgba(245,240,250,0.6)", border: "2px solid transparent" }
                }
              >
                <span className="text-xl mb-1"> </span>
                <span className="text-sm font-semibold" style={{ color: "#2d1f4e" }}>Virement</span>
                <span className="text-xs mt-0.5" style={{ color: "#a090bc" }}>Transfert bancaire</span>
                {method === "transfer" && (
                  <span
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                    style={{ background: "#8b6cc7" }}
                  >
                    ✓
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMethod("online")}
                className="relative flex flex-col items-start rounded-2xl p-4 text-left transition-all"
                style={
                  method === "online"
                    ? {
                        background: "linear-gradient(135deg, #e8d8f8, #d8c8f0)",
                        border: "2px solid #8b6cc7",
                        boxShadow: "0 0 0 4px rgba(139,108,199,0.1)",
                      }
                    : { background: "rgba(245,240,250,0.6)", border: "2px solid transparent" }
                }
              >
                <span className="text-xl mb-1"> </span>
                <span className="text-sm font-semibold" style={{ color: "#2d1f4e" }}>En ligne</span>
                <span className="text-xs mt-0.5" style={{ color: "#a090bc" }}>Paiement immédiat</span>
                {method === "online" && (
                  <span
                    className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                    style={{ background: "#8b6cc7" }}
                  >
                    ✓
                  </span>
                )}
              </button>
            </div>

            {method === "transfer" && (
              <div className="mt-4">
                <p className="text-xs mb-2" style={{ color: "#7c6a9a" }}>
                  Joignez votre reçu de transfert (photo ou scan).
                </p>
                <label
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-5 text-center transition"
                  style={{
                    background: "rgba(237,224,255,0.4)",
                    border: "2px dashed rgba(139,108,199,0.35)",
                  }}
                >
                  <span className="text-2xl">{receipt ? "📄" : "📎"}</span>
                  <span className="text-sm font-medium" style={{ color: "#6b4fa0" }}>
                    {receipt ? receipt.name : "Cliquez pour joindre un fichier"}
                  </span>
                  <span className="text-xs" style={{ color: "#a090bc" }}>PNG, JPG ou PDF</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {method === "online" && (
              <p
                className="mt-3 rounded-2xl px-4 py-3 text-xs"
                style={{ background: "rgba(237,224,255,0.4)", color: "#6b4fa0" }}
              >
                votre achat sera activé immédiatement après confirmation.
              </p>
            )}
          </div>
        </div>

        {/* Erreur */}
        {err && (
          <div
            className="mt-4 rounded-2xl px-4 py-3 text-sm"
            style={{
              background: "rgba(255,235,235,0.8)",
              color: "#c0392b",
              border: "1px solid rgba(192,57,43,0.2)",
            }}
          >
            {err}
          </div>
        )}

        {/* CTA */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "linear-gradient(135deg, #b0a0d0, #c0b0e0)"
                : "linear-gradient(135deg, #8b6cc7, #6b4fa0)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(107,79,160,0.35)",
            }}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Traitement en cours…
              </>
            ) : (
              <>
                <span>Confirmer et payer</span>
                <span>→</span>
              </>
            )}
          </button>

          <Link
            href="/cart"
            className="flex items-center justify-center rounded-2xl px-5 py-4 text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.7)",
              color: "#6b4fa0",
              border: "1px solid rgba(139,108,199,0.25)",
            }}
          >
            ← Retour panier
          </Link>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: "#b0a0c8" }}>
           Paiement sécurisé | vos données sont protégées
        </p>
      </section>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          setTimeout(() => onConfirm(), 100);
        }}
      />
    </main>
  );
}