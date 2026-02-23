"use client";

import { useState } from "react";
import QuickReservationModal from "@/components/QuickReservationModal";
import CourseContent from "@/components/CourseContent";

export default function ProductTabs({
  course,
  hasAccess,
  isLoggedIn,
}: {
  course: any;
  hasAccess: boolean;
  isLoggedIn: boolean;
}) {
  const [tab, setTab] = useState<"desc" | "content">("desc");
  const [open, setOpen] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  async function buyNow() {
    setBuyError(null);

    if (!isLoggedIn) {
      setBuyError("Veuillez vous connecter pour acheter.");
      return;
    }

    setBuyLoading(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: course.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setBuyError(data?.error || "Erreur achat.");
        setBuyLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setBuyError("Erreur réseau.");
      setBuyLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
        <button
          onClick={() => setTab("desc")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            tab === "desc"
              ? "bg-white/10 text-emerald-300"
              : "text-white/70 hover:text-white"
          }`}
        >
          Descriptif
        </button>

        <button
          onClick={() => setTab("content")}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            tab === "content"
              ? "bg-white/10 text-emerald-300"
              : "text-white/70 hover:text-white"
          }`}
        >
          Contenu
        </button>
      </div>

      <div className="mt-6">
        {tab === "desc" ? (
          <div className="space-y-6">
            <p className="text-white/80 leading-relaxed">{course.description}</p>

            <div className="flex items-center gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
              <img
                src={course.professional.photoUrl ?? "/avatar-placeholder.png"}
                className="h-16 w-16 rounded-full object-cover"
                alt={course.professional.name}
              />
              <div className="flex-1">
                <p className="font-medium">{course.professional.name}</p>
                <p className="text-sm text-white/60">{course.professional.specialty}</p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Réserver un RDV
              </button>
            </div>

            <QuickReservationModal
              open={open}
              onClose={() => setOpen(false)}
              professionalId={course.professional.id}
            />
          </div>
        ) : (
          <CourseContent
            course={course}
            hasAccess={hasAccess}
            isLoggedIn={isLoggedIn}
            buyNow={buyNow}
            buyLoading={buyLoading}
            buyError={buyError}
          />
        )}
      </div>
    </div>
  );
}
