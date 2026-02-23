"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "@/components/LoginModal";

type Course = {
  id: string;
  title: string;
  price: number;
  type?: string;
  coverImageUrl?: string | null;
  category?: { id: string; name: string; slug: string };
  professional?: { id: string; name: string; specialty: string; photoUrl?: string | null };
};

type PayMethod = "transfer" | "online";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function OrderNewPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const videoId = sp.get("videoId") || "";

  const [course, setCourse] = useState<Course | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [method, setMethod] = useState<PayMethod>("transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [loginOpen, setLoginOpen] = useState(false);

  const cover = useMemo(() => {
    if (course?.coverImageUrl) return course.coverImageUrl;
    return "/uploads/covers/DEFAULT.webp"; // mets un fichier réel sinon 404
  }, [course?.coverImageUrl]);

  // 1) load course
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setErr(null);
      setMsg(null);

      if (!videoId) {
        setErr("videoId manquant dans l'URL.");
        return;
      }

      try {
        const res = await fetch(`/api/videos/by-id?id=${encodeURIComponent(videoId)}`);
        if (!res.ok) throw new Error("Course fetch failed");
        const data = await res.json();

        if (!cancelled) {
          setCourse(data?.course || data); // selon ton API
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Impossible de charger le cours.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // 2) create order (requires auth)
  async function ensureOrder() {
    if (orderId) return orderId;

    const token = getToken();
    if (!token) {
      setLoginOpen(true);
      throw new Error("NOT_LOGGED_IN");
    }

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

    const created = data?.order?.id || data?.orderId;
    if (!created) throw new Error("orderId manquant (API /api/orders).");

    setOrderId(created);
    return created;
  }

  async function onPay() {
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setLoginOpen(true);
        setLoading(false);
        return;
      }

      const oid = await ensureOrder();

      if (method === "transfer") {
        if (!receiptFile) {
          setErr("Veuillez joindre un reçu de transfert.");
          setLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("file", receiptFile);

        const res = await fetch(`/api/orders/${oid}/pay-transfer`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Erreur paiement transfert.");

        setMsg("Reçu envoyé ! Nous vous contactons après validation.");
        // option : rediriger vers library ou page order
        router.push("/library");
        return;
      }

      // online
      const res = await fetch(`/api/orders/${oid}/pay-online`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur paiement online.");

      setMsg("Paiement confirmé ✅ Accès débloqué.");
      router.push("/library");
    } catch (e: any) {
      console.error(e);
      if (e?.message === "NOT_LOGGED_IN") {
        // handled by modal
      } else {
        setErr(e?.message || "Erreur inconnue.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-emerald-950">Panier & Paiement</h1>

        <div className="mt-6 rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5">
          {!course ? (
            <p className="text-emerald-900/70">Chargement du cours…</p>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt={course.title} className="h-20 w-28 object-cover" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-emerald-900/60">
                  {course.category?.name || "Cours"}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-emerald-950">
                  {course.title}
                </h2>
                <p className="mt-2 text-sm text-emerald-900/70">
                  Total :{" "}
                  <span className="font-semibold text-emerald-950">
                    {Math.round(course.price)} DT
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-emerald-950">Méthode de paiement</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMethod("transfer")}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition",
                  method === "transfer"
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-emerald-50 text-emerald-900 ring-emerald-900/10 hover:bg-emerald-100",
                ].join(" ")}
              >
                Transfert bancaire
              </button>

              <button
                type="button"
                onClick={() => setMethod("online")}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-medium ring-1 transition",
                  method === "online"
                    ? "bg-amber-500 text-white ring-amber-500"
                    : "bg-amber-50 text-amber-900 ring-amber-900/10 hover:bg-amber-100",
                ].join(" ")}
              >
                Paiement en ligne
              </button>
            </div>

            {method === "transfer" ? (
              <div className="mt-4 rounded-2xl border border-emerald-900/10 bg-white p-4">
                <p className="text-sm font-medium text-emerald-950">Joindre un reçu</p>
                <p className="mt-1 text-xs text-emerald-900/60">
                  JPG / PNG / PDF (scan ou photo)
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-emerald-900/70">
                    {receiptFile ? (
                      <>
                        Fichier : <span className="font-medium">{receiptFile.name}</span>
                      </>
                    ) : (
                      "Aucun fichier sélectionné"
                    )}
                  </p>

                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-700 transition">
                    Choisir un fichier
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900/80 ring-1 ring-amber-900/10">
                Paiement en ligne .
              </div>
            )}
          </div>

          {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}
          {msg ? <p className="mt-4 text-sm text-emerald-700">{msg}</p> : null}

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onPay}
              disabled={loading || !videoId}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Traitement..." : "Valider le paiement"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/videos")}
              className="w-full rounded-2xl bg-white px-5 py-3 font-medium text-emerald-900 ring-1 ring-emerald-900/10 hover:bg-emerald-50"
            >
              Continuer à explorer les cours
            </button>
          </div>
        </div>
      </section>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          // après login, on reste ici et on peut relancer onPay
          setMsg("Connecté ✅ Vous pouvez continuer le paiement.");
        }}
      />
    </main>
  );
}
