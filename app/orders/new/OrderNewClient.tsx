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

export default function OrderNewClient() {
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

  const cover = useMemo(() => course?.coverImageUrl || "/uploads/covers/DEFAULT.webp", [course?.coverImageUrl]);

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
        if (!cancelled) setCourse(data?.course || data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErr("Impossible de charger le cours.");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [videoId]);

  async function ensureOrder() {
    if (orderId) return orderId;
    const token = getToken();
    if (!token) {
      setLoginOpen(true);
      throw new Error("NOT_LOGGED_IN");
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    setErr(null); setMsg(null); setLoading(true);
    try {
      const token = getToken();
      if (!token) { setLoginOpen(true); setLoading(false); return; }

      const oid = await ensureOrder();

      if (method === "transfer") {
        if (!receiptFile) { setErr("Veuillez joindre un reçu de transfert."); setLoading(false); return; }

        const fd = new FormData();
        fd.append("file", receiptFile);

        const res = await fetch(`/api/orders/${oid}/pay-transfer`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Erreur paiement transfert.");
        setMsg("Reçu envoyé ! Nous vous contactons après validation.");
        router.push("/library");
        return;
      }

      // online
      const res = await fetch(`/api/orders/${oid}/pay-online`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur paiement online.");
      setMsg("Paiement confirmé ✅ Accès débloqué.");
      router.push("/library");
    } catch (e: any) {
      console.error(e);
      if (e?.message !== "NOT_LOGGED_IN") setErr(e?.message || "Erreur inconnue.");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      {/* Ton code JSX complet pour le formulaire de commande / paiement ici */}
      {/* ...tu peux copier/coller tout ton JSX existant ici */}
      {/* LoginModal inclus */}
    </main>
  );
}
