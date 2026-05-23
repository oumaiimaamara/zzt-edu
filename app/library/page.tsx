"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LibraryItem = {
  id: string;
  addedAt: string;
  video: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImageUrl: string | null;
    price: any;
    type: string;
    category?: { slug: string; name: string } | null;
    professional?: { name: string; photoUrl: string | null } | null;
  };
};

function normalizePublicUrl(url?: string | null) {
  if (!url) return "/placeholder-cover.jpg";
  const cleaned = String(url).trim().replace(/\\/g, "/");
  if (!cleaned || cleaned === "null" || cleaned === "undefined") return "/placeholder-cover.jpg";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push(`/login?next=${encodeURIComponent("/library")}`);
        return;
      }
      try {
        const res = await fetch("/api/library", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push(`/login?next=${encodeURIComponent("/library")}`);
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Erreur chargement bibliothèque.");
        if (!cancelled) setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Erreur inattendue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #f5f0eb 0%, #ede8f5 50%, #f5f0eb 100%)" }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden px-4 pb-10 pt-12"
        style={{ background: "linear-gradient(135deg, #e8e0f5 0%, #f0e8e0 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #c4b0e8 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 left-8 h-40 w-40 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #d4a574 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div
            className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "#ede0ff", color: "#6b4fa0" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#8b6cc7" }} />
            Espace personnel
          </div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "#2d1f4e" }}>
            Ma bibliothèque
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#7c6a9a" }}>
            Vos cours achetés, disponibles à tout moment.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-8">
        {/* Chargement */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4"
              style={{ borderColor: "rgba(139,108,199,0.2)", borderTopColor: "#8b6cc7" }}
            />
            <p className="text-sm" style={{ color: "#a090bc" }}>
              Chargement de vos cours…
            </p>
          </div>
        )}

        {/* Erreur */}
        {!loading && err && (
          <div
            className="rounded-3xl px-6 py-8 text-center"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(192,57,43,0.15)",
            }}
          >
            <p className="text-sm" style={{ color: "#c0392b" }}>{err}</p>
            <Link
              href="/videos"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #8b6cc7, #6b4fa0)" }}
            >
              Voir le catalogue
            </Link>
          </div>
        )}

        {/* Vide */}
        {!loading && !err && items.length === 0 && (
          <div
            className="flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(180,160,220,0.25)",
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-3xl text-3xl"
              style={{ background: "linear-gradient(135deg, #ede0ff, #f5e8d0)" }}
            >
              📚
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: "#2d1f4e" }}>
                Votre bibliothèque est vide
              </p>
              <p className="mt-1 text-sm" style={{ color: "#a090bc" }}>
                Explorez le catalogue et achetez votre premier cours.
              </p>
            </div>
            <Link
              href="/videos"
              className="mt-2 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #8b6cc7, #6b4fa0)",
                boxShadow: "0 4px 20px rgba(107,79,160,0.3)",
              }}
            >
              Découvrir les cours →
            </Link>
          </div>
        )}

        {/* Grille des cours */}
        {!loading && !err && items.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: "#7c6a9a" }}>
                {items.length} cours acheté{items.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => {
                const v = it.video;
                const href =
                  v?.category?.slug && v?.slug
                    ? `/videos/${v.category.slug}/${v.slug}`
                    : "/videos";

                return (
                  <article
                    key={it.id}
                    className="group overflow-hidden rounded-3xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(180,160,220,0.2)",
                      boxShadow: "0 2px 16px rgba(100,70,160,0.05)",
                    }}
                  >
                    {/* Cover */}
                    <Link href={href} className="block">
                      <div
                        className="relative h-44 w-full overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #e8d8f8, #d8e8f0)" }}
                      >
                        <Image
                          src={normalizePublicUrl(v.coverImageUrl)}
                          alt={v.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(45,31,78,0.3) 0%, transparent 60%)",
                          }}
                        />
                        <div
                          className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                          style={{
                            background: "rgba(139,108,199,0.85)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {v.type === "VIDEO" ? "🎬 Vidéo" : "📝 Article"}
                        </div>
                      </div>
                    </Link>

                    {/* Contenu */}
                    <div className="p-5">
                      <Link href={href}>
                        <h2
                          className="line-clamp-2 text-base font-semibold leading-snug transition-colors"
                          style={{ color: "#2d1f4e" }}
                        >
                          {v.title}
                        </h2>
                      </Link>

                      {v.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs" style={{ color: "#a090bc" }}>
                          {v.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {v.category?.name && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ background: "rgba(237,224,255,0.7)", color: "#6b4fa0" }}
                          >
                            {v.category.name}
                          </span>
                        )}
                        {v.professional?.name && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs"
                            style={{ background: "rgba(245,235,220,0.8)", color: "#8a6a40" }}
                          >
                            {v.professional.name}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-xs" style={{ color: "#c0b0d8" }}>
                        Acheté le {formatDate(it.addedAt)}
                      </div>

                      <div className="mt-4">
                        <Link
                          href={href}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white transition-all"
                          style={{
                            background: "linear-gradient(135deg, #8b6cc7, #6b4fa0)",
                            boxShadow: "0 2px 12px rgba(107,79,160,0.25)",
                          }}
                        >
                          Accéder au cours →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}