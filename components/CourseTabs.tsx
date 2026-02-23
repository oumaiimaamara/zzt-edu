"use client";

import { useMemo, useState } from "react";

type Professional = {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string | null;
};

type Course = {
  id: string;
  title: string;
  description: string;
  type: "video" | "article";
  videoUrl: string;
  articleContent: string | null;
  professional: Professional;
};

export default function CourseTabs({
  course,
  hasAccess,
  onBuy,
}: {
  course: Course;
  hasAccess: boolean;
  onBuy: () => void;
}) {
  const tabs = useMemo(() => ["Résumé", "Contenu", "Réserver"] as const, []);
  const [active, setActive] = useState<(typeof tabs)[number]>("Résumé");

  return (
    <div className="mt-5">
      {/* Tabs */}
      <div className="inline-flex overflow-hidden rounded-2xl bg-white/80 ring-1 ring-emerald-900/10 shadow-sm">
        {tabs.map((t) => {
          const selected = t === active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={[
                "px-4 py-2 text-sm font-medium transition",
                selected
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-900/70 hover:bg-emerald-50",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-4 rounded-3xl bg-white/80 p-5 ring-1 ring-emerald-900/5">
        {active === "Résumé" ? (
          <div>
            <p className="text-emerald-900/75 leading-relaxed">
              {course.description}
            </p>

            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-900/5">
              <img
                src={course.professional.photoUrl ?? "/uploads/covers/DEFAULT.webp"}
                alt={course.professional.name}
                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-emerald-900/10"
              />
              <div className="min-w-0">
                <div className="font-semibold text-emerald-950 truncate">
                  {course.professional.name}
                </div>
                <div className="text-sm text-emerald-900/70">
                  {course.professional.specialty}
                </div>
              </div>
            </div>
          </div>
        ) : active === "Contenu" ? (
          <div>
            {!hasAccess ? (
              <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                    🔒
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-950">
                      Contenu protégé
                    </div>
                    <p className="mt-1 text-sm text-emerald-900/70">
                      Vous pourrez accéder au contenu après achat.
                    </p>

                    <button
                      onClick={onBuy}
                      className="mt-3 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-700 transition"
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ) : course.type === "video" ? (
              <div className="overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
                <video controls className="w-full" src={course.videoUrl} />
              </div>
            ) : (
              <article className="prose max-w-none">
                <div className="whitespace-pre-wrap text-emerald-950">
                  {course.articleContent ?? "Article vide."}
                </div>
              </article>
            )}
          </div>
        ) : (
          <QuickReservation professionalId={course.professional.id} />
        )}
      </div>
    </div>
  );
}

function QuickReservation({ professionalId }: { professionalId: string }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setOkMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setErr("Veuillez vous connecter pour réserver.");
      return;
    }

    if (!date || !time) {
      setErr("Choisissez une date et une heure.");
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      const res = await fetch("/api/one-to-one", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          professionalId,
          date: scheduledAt,
          message,
        }),
      });

      const txt = await res.text().catch(() => "");
      if (!res.ok) throw new Error(txt || "Erreur réservation.");

      setOkMsg("On vous contacte dès que votre RDV est validé ✅");
      setMessage("");
    } catch (e: any) {
      setErr(e?.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-900/5">
      <div className="font-semibold text-emerald-950">Réserver un RDV</div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-emerald-950">Date</label>
          <input
            type="date"
            className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-emerald-950">Heure</label>
          <input
            type="time"
            className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-sm font-medium text-emerald-950">Message (optionnel)</label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Quelques détails…"
        />
      </div>

      {err ? <p className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{err}</p> : null}
      {okMsg ? <p className="mt-2 text-sm text-emerald-700">{okMsg}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 transition"
      >
        {loading ? "Réservation..." : "Réserver"}
      </button>
    </div>
  );
}
