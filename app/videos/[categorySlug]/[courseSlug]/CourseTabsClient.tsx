"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type CourseData = {
  id: string;
  title: string;
  description: string;
  professional: null | {
    id: string;
    name: string;
    specialty?: string;
    photoUrl?: string | null;
  };
};

type TabKey = "contenu" | "reserver";

type Slot = {
  id: string;
  start: string;
  end: string;
  status: "available" | "booked";
};

/* ================= UTILS ================= */

function safeImg(url?: string | null) {
  if (!url) return "/placeholder-avatar.png";
  const cleaned = url.trim().replace(/\\/g, "/");
  if (cleaned.startsWith("http")) return cleaned;
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

// MOCK créneaux (08h → 17h, pas 24h)
function generateMockSlots(date: string): Slot[] {
  const base = new Date(`${date}T08:00:00`);
  const slots: Slot[] = [];

  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() + i * 30 * 60000);
    const end = new Date(start.getTime() + 30 * 60000);

    slots.push({
      id: start.toISOString(),
      start: start.toISOString(),
      end: end.toISOString(),
      status: Math.random() > 0.7 ? "booked" : "available",
    });
  }

  return slots;
}

/* ================= COMPONENT ================= */

export default function CourseTabsClient({ course }: { course: CourseData }) {
  const [tab, setTab] = useState<TabKey>("contenu");

  // calendrier
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setSlots(generateMockSlots(date));
  }, [date]);

  async function onReserve() {
    setErr(null);
    setMsg(null);

    if (!selected) {
      setErr("Veuillez choisir un créneau disponible.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErr("Veuillez vous connecter pour réserver.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/one-to-one", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId: course.professional?.id,
          date: selected.start,
          message: `Demande depuis le cours : ${course.title}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur réservation.");

      setMsg("Rendez-vous demandé ✅ Nous vous confirmerons rapidement.");
      setSelected(null);
    } catch (e: any) {
      setErr(e?.message || "Erreur réservation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5">
      {/* ===== TABS ===== */}
      <div className="inline-flex overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
        <button
          onClick={() => setTab("contenu")}
          className={`px-5 py-2 text-sm font-medium transition ${
            tab === "contenu"
              ? "bg-[var(--fe-green)]"
              : "bg-white text-[var(--fe-text-soft)] hover:bg-emerald-50"
          }`}
        >
          Contenu
        </button>

        <button
          onClick={() => setTab("reserver")}
          className={`px-5 py-2 text-sm font-medium transition ${
            tab === "reserver"
              ? "bg-[var(--fe-green)]"
              : "bg-white text-[var(--fe-text-soft)] hover:bg-emerald-50"
          }`}
        >
          Réserver
        </button>
      </div>

      {/* ===== CONTENU ===== */}
      {tab === "contenu" && (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Résumé du cours</h3>
            <p className="mt-2 text-[var(--fe-text-soft)] leading-relaxed">
              {course.description ||
                "Un accompagnement clair et rassurant pour les parents."}
            </p>
          </div>

          {course.professional && (
            <div className="flex items-center gap-4 rounded-2xl bg-[var(--fe-soft)] p-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-white">
                <Image
                  src={safeImg(course.professional.photoUrl)}
                  alt={course.professional.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <p className="font-semibold">{course.professional.name}</p>
                <p className="text-sm text-[var(--fe-text-soft)]">
                  {course.professional.specialty || "Spécialiste petite enfance"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== RÉSERVER ===== */}
      {tab === "reserver" && (
        <div className="mt-6 space-y-5">
          {/* Date */}
          <div>
            <label className="text-sm font-medium">Choisir une date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-2"
            />
          </div>

          {/* Slots */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {slots.map((slot) => {
              const time = new Date(slot.start).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const isBooked = slot.status === "booked";
              const isSelected = selected?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  disabled={isBooked}
                  onClick={() => setSelected(slot)}
                  className={`
                    rounded-xl px-3 py-2 text-sm font-medium transition
                    ${
                      isBooked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-[var(--fe-green)] shadow"
                        : "bg-[var(--fe-soft)] hover:bg-[var(--fe-mauve)]"
                    }
                  `}
                >
                  {time}
                </button>
              );
            })}
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-emerald-700">{msg}</p>}

          <button
            onClick={onReserve}
            disabled={!selected || loading}
            className="
              w-full rounded-2xl px-5 py-3 font-medium
              bg-[var(--fe-green)]
              shadow-[0_6px_0_rgba(0,0,0,0.08)]
              hover:translate-y-[1px]
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Envoi..." : "Réserver un rendez-vous"}
          </button>
        </div>
      )}
    </div>
  );
}
