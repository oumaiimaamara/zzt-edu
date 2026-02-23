"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  customerName: string;
  date: string;
  status: string;
  amount: number;
  courseTitle: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  receiptUrl: string | null;
};

const TABS = [
  { key: "new", label: "Nouvelles" },
  { key: "to_validate", label: "À valider" },
  { key: "done", label: "Terminées" },
  { key: "failed", label: "Échouées" },
] as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function badge(status: string) {
  const s = status.toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "failed" || s === "cancelled") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-800"; // pending
}

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("new");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Row[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => TABS.find(t => t.key === tab)?.label ?? "Commandes", [tab]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders?status=${tab}&page=${page}`);
      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Erreur");
        setItems([]);
        setTotalPages(1);
      } else {
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      setErr("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  async function validateOrder(orderId: string) {
    const res = await fetch(`/api/admin/orders/${orderId}/validate`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Validation échouée");
      return;
    }
    await load();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-emerald-950">
              Commandes — {title}
            </h1>
            <p className="mt-1 text-emerald-900/70">
              Gestion des achats de cours (virement = validation admin).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                className={[
                  "rounded-2xl px-4 py-2 text-sm font-medium ring-1",
                  tab === t.key
                    ? "bg-emerald-600 text-white ring-emerald-600"
                    : "bg-white/80 text-emerald-900 ring-emerald-900/10 hover:bg-white",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/80 ring-1 ring-emerald-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-emerald-50/60">
                <tr className="text-sm text-emerald-950">
                  <th className="px-4 py-3">ID commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Cours</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {loading ? (
                  <tr><td className="px-4 py-6 text-emerald-900/70" colSpan={7}>Chargement...</td></tr>
                ) : err ? (
                  <tr><td className="px-4 py-6 text-red-600" colSpan={7}>{err}</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="px-4 py-6 text-emerald-900/70" colSpan={7}>Aucune commande.</td></tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="border-t border-emerald-900/5">
                      <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                      <td className="px-4 py-3">{r.customerName}</td>
                      <td className="px-4 py-3">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge(r.status)}`}>
                          {r.status === "pending" ? "à valider" : r.status === "paid" ? "terminée" : "échouée"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{Number(r.amount || 0).toFixed(2)} DT</td>
                      <td className="px-4 py-3">{r.courseTitle}</td>
                      <td className="px-4 py-3">
                        {r.status === "pending" && r.paymentMethod === "transfer" ? (
                          <div className="flex items-center gap-2">
                            {r.receiptUrl ? (
                              <a
                                className="text-emerald-700 underline text-xs"
                                href={r.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Voir reçu
                              </a>
                            ) : null}
                            <button
                              onClick={() => validateOrder(r.id)}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Valider
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-900/50 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-900/5">
            <p className="text-xs text-emerald-900/60">10 par page</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-emerald-900/10 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs text-emerald-950">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl bg-white px-3 py-2 text-xs ring-1 ring-emerald-900/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
