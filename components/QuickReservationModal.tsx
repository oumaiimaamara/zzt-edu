"use client";

import { useState } from "react";

export default function QuickReservationModal({
  open,
  onClose,
  professionalId,
}: {
  open: boolean;
  onClose: () => void;
  professionalId: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit() {
    setError(null);

    // ✅ VALIDATION STRICTE
    if (!date || !time) {
      setError("Veuillez choisir une date et une heure.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);

    if (isNaN(scheduledAt.getTime())) {
      setError("Date ou heure invalide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/one-to-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          scheduledAt: scheduledAt.toISOString(), // ✅ GARANTI
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Erreur lors de la réservation.");
        return;
      }

      onClose();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Réserver un rendez-vous</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Heure</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2">
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-white disabled:opacity-60"
          >
            {loading ? "..." : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
}
