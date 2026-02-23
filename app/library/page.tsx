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
    type: string;
    category?: { slug: string; name: string } | null;
  };
};

function normalizePublicUrl(url?: string | null) {
  if (!url) return "/placeholder-cover.jpg";
  const cleaned = String(url).trim().replace(/\\/g, "/");
  if (!cleaned || cleaned === "null" || cleaned === "undefined")
    return "/placeholder-cover.jpg";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://"))
    return cleaned;
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
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

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
        if (!res.ok)
          throw new Error(data?.message || "Erreur chargement bibliothèque.");

        if (!cancelled)
          setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Erreur inattendue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-6xl px-4 py-16">
        {/* ===== HEADER ===== */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--fe-text-main)]">
            Ma bibliothèque
          </h1>
          <p className="mt-2 text-[var(--fe-text-soft)] max-w-2xl">
            Retrouvez ici vos cours achetés. Un espace rien qu’à vous.
          </p>
        </header>

        {/* ===== STATES ===== */}
        {loading ? (
          <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
            <p className="text-[var(--fe-text-soft)]">
              Chargement de votre bibliothèque…
            </p>
          </div>
        ) : err ? (
          <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
            <p className="text-red-600 text-sm">{err}</p>
            <div className="mt-4">
              <Link
                href="/videos"
                className="
                  inline-flex rounded-2xl px-5 py-3 font-medium
                  bg-[var(--fe-green)]
                  text-[var(--fe-text-main)]
                  shadow-[0_6px_0_rgba(0,0,0,0.08)]
                  hover:translate-y-[1px] transition
                "
              >
                Voir le catalogue
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-[var(--fe-surface)] p-8 shadow">
            <p className="font-semibold text-lg text-[var(--fe-text-main)]">
              Vous n’avez pas encore acheté de cours.
            </p>
            <p className="mt-2 text-[var(--fe-text-soft)]">
              Explorez le catalogue et choisissez un cours adapté à votre bébé 💛
            </p>

            <div className="mt-6">
              <Link
                href="/videos"
                className="
                  inline-flex rounded-2xl px-6 py-3 font-medium
                  bg-[var(--fe-green)]
                  text-[var(--fe-text-main)]
                  shadow-[0_6px_0_rgba(0,0,0,0.08)]
                  hover:translate-y-[1px] transition
                "
              >
                Découvrir les cours
              </Link>
            </div>
          </div>
        ) : (
          /* ===== GRID ===== */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((it) => {
              const v = it.video;
              const href =
                v?.category?.slug && v?.slug
                  ? `/videos/${v.category.slug}/${v.slug}`
                  : "/videos";

              return (
                <article
                  key={it.id}
                  className="
                    overflow-hidden rounded-3xl
                    bg-[var(--fe-surface)]
                    shadow hover:shadow-lg transition
                  "
                >
                  <Link href={href}>
                    <div className="relative h-52 bg-[var(--fe-bg)]">
                      <Image
                        src={normalizePublicUrl(v.coverImageUrl)}
                        alt={v.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link href={href}>
                      <h2 className="text-lg md:text-xl font-semibold text-[var(--fe-text-main)]">
                        {v.title}
                      </h2>
                    </Link>

                    <p className="mt-2 text-sm text-[var(--fe-text-soft)] line-clamp-2">
                      {v.description ?? "—"}
                    </p>

                    <div className="mt-4 flex gap-2 text-sm">
                      <span className="rounded-full bg-[var(--fe-soft)] px-3 py-1">
                        {v.category?.name ?? "Cours"}
                      </span>
                      <span className="rounded-full bg-[var(--fe-mauve)] px-3 py-1">
                        {v.type === "VIDEO" ? "Vidéo" : "Article"}
                      </span>
                    </div>

                    <div className="mt-5">
                      <Link
                        href={href}
                        className="
                          inline-flex rounded-2xl px-5 py-3 font-medium
                          bg-[var(--fe-green)]
                          text-[var(--fe-text-main)]
                          shadow-[0_6px_0_rgba(0,0,0,0.08)]
                          hover:translate-y-[1px] transition
                        "
                      >
                        Ouvrir le cours
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
