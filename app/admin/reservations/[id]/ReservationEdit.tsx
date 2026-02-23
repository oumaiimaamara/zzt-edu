"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  status: string;
  scheduledAt: string;
  message?: string | null;

  user?: {
    name?: string;
    email?: string;
  } | null;

  professional?: {
    name?: string;
    specialty?: string | null;
  } | null;

  course?: {
    title?: string;
    slug?: string;
    coverImageUrl?: string | null;
  } | null;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    validated: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-4 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-900">
        {value}
      </p>
      {sub && (
        <p className="text-sm text-gray-500 mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function ReservationEdit({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();

  const [data, setData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<
    null | "validate" | "cancel"
  >(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reservations/${reservationId}`, {
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.message || "Accès refusé");
        return;
      }

      setData(json.reservation ?? json);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(action: "validate" | "cancel") {
    if (!data) return;

    setActionLoading(action);
    const previous = data.status;

    setData({ ...data, status: action === "validate" ? "validated" : "cancelled" });

    try {
      const res = await fetch(`/api/admin/reservations/${data.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        setData({ ...data, status: previous });
      } else {
        await load();
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow">
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

  if (!data) return null;

  const isPending = data.status === "pending";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Réservation
          </h1>
          <p className="text-sm text-gray-500">
            #{data.id}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          label="Parent"
          value={data.user?.name || "—"}
          sub={data.user?.email}
        />

        <InfoCard
          label="Professionnel"
          value={data.professional?.name || "—"}
          sub={data.professional?.specialty || undefined}
        />

        <InfoCard
          label="Date & heure"
          value={
            data.scheduledAt
              ? new Date(data.scheduledAt).toLocaleString("fr-FR")
              : "—"
          }
        />

        <InfoCard
          label="Message"
          value={data.message || "—"}
        />
      </div>

      {/* Course */}
      {data.course && (
        <div className="rounded-2xl bg-white p-6 shadow flex gap-6 items-center">
          {data.course.coverImageUrl && (
            <img
              src={data.course.coverImageUrl}
              className="h-24 w-40 rounded-xl object-cover"
              alt={data.course.title || "Cours"}
            />
          )}

          <div>
            <p className="text-xs uppercase text-gray-400 mb-1">
              Cours concerné
            </p>
            <a
              href={`/videos/${data.course.slug}`}
              target="_blank"
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {data.course.title}
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-4">
          <button
            onClick={() => updateStatus("validate")}
            disabled={actionLoading !== null}
            className="rounded-xl bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {actionLoading === "validate"
              ? "Validation..."
              : "Valider"}
          </button>

          <button
            onClick={() => updateStatus("cancel")}
            disabled={actionLoading !== null}
            className="rounded-xl bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading === "cancel"
              ? "Annulation..."
              : "Annuler"}
          </button>
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.push("/admin/reservations")}
        className="text-sm text-gray-500 hover:underline"
      >
        ← Retour aux réservations
      </button>
    </div>
  );
}
