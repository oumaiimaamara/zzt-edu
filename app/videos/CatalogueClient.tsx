"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import normalizeCover from "./normalizeCover";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: string;
  coverImageUrl: string | null;
  courseType: string;
  ageRange: string;
  category: { id: string; name: string; slug: string } | null;
  professional: { name: string } | null;
};

type Category = { id: string; name: string; slug: string };

const AGE_RANGES = [
  { label: "0 – 3 ans", value: "0-3" },
  { label: "3 – 6 ans", value: "3-6" },
  { label: "6 – 12 ans", value: "6-12" },
  { label: "12 – 18 ans", value: "12-18" },
  { label: "Tous âges", value: "all-ages" },
];

const COURSE_TYPES = [
  { label: "Formation", value: "formation" },
  { label: "Pack", value: "pack" },
  { label: "Cours", value: "cours" },
];

const CONTENT_TYPES = [
  { label: "Vidéo", value: "VIDEO" },
  { label: "Article", value: "ARTICLE" },
];

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap"
      style={
        active
          ? { background: "linear-gradient(135deg, #8b6cc7, #6b4fa0)", color: "#fff", boxShadow: "0 2px 8px rgba(107,79,160,0.3)" }
          : { background: "rgba(237,224,255,0.5)", color: "#6b4fa0", border: "1px solid rgba(139,108,199,0.2)" }
      }
    >
      {label}
    </button>
  );
}

export default function CatalogueClient({ courses, categories }: { courses: Course[]; categories: Category[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedCourseType, setSelectedCourseType] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (selectedCategory !== "all" && c.category?.id !== selectedCategory) return false;
      if (selectedAge !== "all" && c.ageRange !== selectedAge) return false;
      if (selectedCourseType !== "all" && c.courseType !== selectedCourseType) return false;
      if (selectedContentType !== "all" && c.type !== selectedContentType) return false;
      return true;
    });
  }, [courses, selectedCategory, selectedAge, selectedCourseType, selectedContentType]);

  const hasActive = selectedCategory !== "all" || selectedAge !== "all" || selectedCourseType !== "all" || selectedContentType !== "all";

  function reset() {
    setSelectedCategory("all");
    setSelectedAge("all");
    setSelectedCourseType("all");
    setSelectedContentType("all");
  }

  return (
    <div>
      {/* FILTRES */}
      <div
        className="mb-8 overflow-hidden rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(180,160,220,0.25)",
          boxShadow: "0 4px 24px rgba(100,70,160,0.06)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(180,160,220,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span className="text-sm font-semibold" style={{ color: "#2d1f4e" }}>Filtrer les cours</span>
            {hasActive && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#8b6cc7", color: "#fff" }}>
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {hasActive && (
            <button type="button" onClick={reset} className="text-xs transition-colors" style={{ color: "#a090bc" }}>
              Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Catégorie */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#a090bc" }}>Catégorie</p>
            <div className="flex flex-wrap gap-2">
              <Pill label="Toutes" active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")} />
              {categories.map((cat) => (
                <Pill key={cat.id} label={cat.name} active={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
              ))}
            </div>
          </div>

          {/* Âge */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#a090bc" }}>Tranche d'âge</p>
            <div className="flex flex-wrap gap-2">
              <Pill label="Tous" active={selectedAge === "all"} onClick={() => setSelectedAge("all")} />
              {AGE_RANGES.map((a) => (
                <Pill key={a.value} label={a.label} active={selectedAge === a.value} onClick={() => setSelectedAge(a.value)} />
              ))}
            </div>
          </div>

          {/* Type de cours */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#a090bc" }}>Type de cours</p>
            <div className="flex flex-wrap gap-2">
              <Pill label="Tous" active={selectedCourseType === "all"} onClick={() => setSelectedCourseType("all")} />
              {COURSE_TYPES.map((t) => (
                <Pill key={t.value} label={t.label} active={selectedCourseType === t.value} onClick={() => setSelectedCourseType(t.value)} />
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#a090bc" }}>Format</p>
            <div className="flex flex-wrap gap-2">
              <Pill label="Tous" active={selectedContentType === "all"} onClick={() => setSelectedContentType("all")} />
              {CONTENT_TYPES.map((t) => (
                <Pill key={t.value} label={t.label} active={selectedContentType === t.value} onClick={() => setSelectedContentType(t.value)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-3xl py-16 text-center"
          style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(180,160,220,0.2)" }}
        >
          <span className="text-4xl">🔎</span>
          <p className="text-base font-semibold" style={{ color: "#2d1f4e" }}>Aucun cours ne correspond à ces filtres</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #8b6cc7, #6b4fa0)" }}
          >
            Voir tous les cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((c) => {
            const canLink = Boolean(c.category?.slug && c.slug);
            const href = canLink ? `/videos/${c.category!.slug}/${c.slug}` : "#";
            const thumb = normalizeCover(c.coverImageUrl);
            const isVideo = c.type === "VIDEO";

            return (
              <article
                key={c.id}
                className="group overflow-hidden rounded-3xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(180,160,220,0.2)",
                  boxShadow: "0 2px 16px rgba(100,70,160,0.05)",
                }}
              >
                <Link href={href} className={`block ${canLink ? "" : "pointer-events-none opacity-60"}`}>
                  <div className="relative h-52 w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #e8d8f8, #d8e8f0)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={c.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(45,31,78,0.25) 0%, transparent 60%)" }} />

                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
                          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                        >
                          <span className="ml-1 text-xl" style={{ color: "#6b4fa0" }}>▶</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                        style={{ background: "rgba(139,108,199,0.85)", backdropFilter: "blur(4px)" }}
                      >
                        {isVideo ? " Vidéo" : " Article"}
                      </span>
                      {c.courseType && c.courseType !== "cours" && (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium text-white capitalize"
                          style={{ background: "rgba(212,165,116,0.9)", backdropFilter: "blur(4px)" }}
                        >
                          {c.courseType}
                        </span>
                      )}
                    </div>

                    <div
                      className="absolute bottom-3 right-3 rounded-2xl px-3 py-1 text-sm font-bold text-white"
                      style={{ background: "rgba(107,79,160,0.9)", backdropFilter: "blur(4px)" }}
                    >
                      {Math.round(c.price)} DT
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={href} className={`block ${canLink ? "" : "pointer-events-none opacity-60"}`}>
                    <h2 className="text-lg font-semibold leading-snug hover:underline underline-offset-4" style={{ color: "#2d1f4e" }}>
                      {c.title}
                    </h2>
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {c.category?.name && (
                      <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(237,224,255,0.7)", color: "#6b4fa0" }}>
                        {c.category.name}
                      </span>
                    )}
                    {c.ageRange && c.ageRange !== "all-ages" && (
                      <span className="rounded-full px-3 py-1 text-xs" style={{ background: "rgba(245,235,220,0.8)", color: "#8a6a40" }}>
                        {AGE_RANGES.find((a) => a.value === c.ageRange)?.label ?? c.ageRange}
                      </span>
                    )}
                    {c.professional?.name && (
                      <span className="text-xs" style={{ color: "#a090bc" }}>• {c.professional.name}</span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed" style={{ color: "#7c6a9a" }}>
                    {c.description ?? "—"}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <AddToCartButton
                      disabled={!canLink}
                      item={{
                        id: c.id,
                        title: c.title,
                        price: c.price,
                        coverImageUrl: thumb,
                        categoryName: c.category?.name ?? "Sans catégorie",
                        categorySlug: c.category?.slug ?? "",
                        slug: c.slug ?? "",
                      }}
                    />
                    <Link
                      href={href}
                      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-all ${canLink ? "" : "pointer-events-none opacity-60"}`}
                      style={{ background: "rgba(237,224,255,0.5)", color: "#6b4fa0", border: "1px solid rgba(139,108,199,0.2)" }}
                    >
                      En savoir plus
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}