"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reservation = {
  id: string;
  scheduledAt: string;
  status: string;
  message?: string | null;
  user: {
    name: string;
    email: string;
  };
  professional: {
    name: string;
    specialty?: string | null;
  };
};

function formatDateFR(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* =========================
   BADGE STATUT (FIX FINAL)
   ========================= */
function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    validated: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-gray-100 text-gray-700"
      }`}
    >
      {normalized}
    </span>
  );
}

export default function ReservationTable() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/reservations", {
          credentials: "include",
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(json?.message || "Accès refusé");
          return;
        }

        setItems(Array.isArray(json.reservations) ? json.reservations : []);
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-700 shadow">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">
          Demandes de réservation
        </h2>
        <p className="text-sm text-gray-500">
          {items.length} demande(s)
        </p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-3">Parent</th>
            <th className="px-4 py-3">Professionnel</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-gray-500"
              >
                Aucune réservation
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{r.user.name}</p>
                  <p className="text-xs text-gray-500">{r.user.email}</p>
                </td>

                <td className="px-4 py-3">
                  <p className="font-medium">{r.professional.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.professional.specialty || "—"}
                  </p>
                </td>

                <td className="px-4 py-3">
                  {formatDateFR(r.scheduledAt)}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/reservations/${r.id}`}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
