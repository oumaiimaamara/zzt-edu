// app/videos/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopSliderClient from "./TopSliderClient";
import normalizeCover from "./normalizeCover";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function VideosCatalogPage() {
  const courses = await prisma.video.findMany({
    include: { category: true, professional: true },
    orderBy: { createdAt: "desc" },
  });

  const slides = courses
    .filter((c) => c?.category?.slug && c?.slug)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: c.title,
      subtitle:
        (c.description || "").slice(0, 80) +
        ((c.description?.length ?? 0) > 80 ? "…" : ""),
      href: `/videos/${c.category!.slug}/${c.slug}`,
      imageUrl: normalizeCover(c.coverImageUrl),
      price: Number(c.price ?? 0),
      tag: c.type === "VIDEO" ? "Nouveau cours vidéo" : "Nouveau contenu",
    }));

  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-6xl px-4 py-12">
        {/* ===== HEADER ===== */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--fe-text-main)]">
            Tous les cours
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--fe-text-soft)]">
            Des contenus doux et bienveillants pour accompagner les enfants et
            rassurer les parents.
          </p>
        </header>

        {/* ===== SLIDER ===== */}
        <TopSliderClient slides={slides} />

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {courses.map((c) => {
            const canLink = Boolean(c?.category?.slug && c?.slug);
            const href = canLink
              ? `/videos/${c.category!.slug}/${c.slug}`
              : "#";

            const thumb = normalizeCover(c.coverImageUrl);

            return (
              <article
                key={c.id}
                className="
                  overflow-hidden rounded-3xl
                  bg-[var(--fe-surface)]
                  ring-1 ring-black/5
                  shadow-sm
                  transition hover:shadow-md
                "
              >
                <Link
                  href={href}
                  className={`block ${canLink ? "" : "pointer-events-none opacity-50"}`}
                >
                  <img
                    src={thumb}
                    alt={c.title}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                  />
                </Link>

                <div className="p-5">
                  <Link
                    href={href}
                    className={`block ${canLink ? "" : "pointer-events-none opacity-50"}`}
                  >
                    <h2 className="text-lg font-semibold text-[var(--fe-text-main)] hover:underline">
                      {c.title}
                    </h2>
                  </Link>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-[var(--fe-soft)] px-3 py-1">
                      {c.category?.name ?? "Sans catégorie"}
                    </span>

                    <span className="rounded-full bg-[var(--fe-mauve)] px-3 py-1">
                      {Math.round(Number(c.price ?? 0))} DT
                    </span>

                    <span className="text-[var(--fe-text-soft)]">
                      • {c.professional?.name ?? "—"}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-[var(--fe-text-soft)]">
                    {c.description ?? "—"}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <AddToCartButton
                      disabled={!canLink}
                      item={{
                        id: c.id,
                        title: c.title,
                        price: Number(c.price ?? 0),
                        coverImageUrl: thumb,
                        categoryName: c.category?.name ?? "",
                        categorySlug: c.category?.slug ?? "",
                        slug: c.slug ?? "",
                      }}
                    />

                    <Link
                      href={href}
                      className="
                        inline-flex items-center justify-center
                        rounded-2xl px-4 py-2 font-medium
                        bg-[var(--fe-soft)]
                        text-[var(--fe-text-main)]
                        shadow-[0_4px_0_rgba(0,0,0,0.08)]
                        hover:translate-y-[1px]
                        hover:shadow-[0_2px_0_rgba(0,0,0,0.08)]
                        transition
                      "
                    >
                      En savoir plus
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
