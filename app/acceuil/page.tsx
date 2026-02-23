import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import LatestCoursesCarousel from "./LatestCoursesCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latest = await prisma.video.findMany({
    include: { category: true, professional: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const items = latest.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description ?? "",
    price: Number(c.price ?? 0),
    type: c.type,
    coverImageUrl: c.coverImageUrl ?? "",
    category: {
      name: c.category?.name ?? "Sans catégorie",
      slug: c.category?.slug ?? "",
    },
    professionalName: c.professional?.name ?? "—",
  }));

  return (
    <main className="min-h-screen">
      {/* ================= HERO ================= */}
      <section className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--fe-text-main)]">
            Hello hello
          </h1>

          <p className="mt-4 text-[var(--fe-text-soft)]">
            Nos cours pour vous accompagner avec douceur et confiance.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* Bouton primaire */}
            <Link
              href="/videos"
              className="
                rounded-2xl px-7 py-3 font-medium
                bg-[var(--fe-green)]
                text-[var(--fe-text-main)]
                shadow-[0_6px_0_rgba(0,0,0,0.08)]
                hover:translate-y-[1px]
                hover:shadow-[0_4px_0_rgba(0,0,0,0.08)]
                transition
              "
            >
              Découvrir le catalogue
            </Link>

            {/* Bouton secondaire */}
            <Link
              href="/signup"
              className="
                rounded-2xl px-7 py-3 font-medium
                bg-[var(--fe-mauve)]
                text-[var(--fe-text-main)]
                shadow-[0_6px_0_rgba(0,0,0,0.08)]
                hover:translate-y-[1px]
                hover:shadow-[0_4px_0_rgba(0,0,0,0.08)]
                transition
              "
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ================= NOUVEAUTÉS ================= */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold text-[var(--fe-text-main)]">
            Nouveaux cours
          </h2>

          <Link
            href="/videos"
            className="
              hidden md:inline-flex
              rounded-xl px-4 py-2 text-sm font-medium
              bg-[var(--fe-soft)]
              text-[var(--fe-text-main)]
              hover:bg-[var(--fe-green)]
              transition
            "
          >
            Voir plus
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-[var(--fe-surface)] p-8 text-center text-[var(--fe-text-soft)] shadow">
            Aucun cours disponible pour le moment.
          </div>
        ) : (
          <div className="mt-6">
            <LatestCoursesCarousel items={items} />
          </div>
        )}

        {/* bouton mobile */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href="/videos"
            className="
              inline-flex rounded-2xl px-6 py-3 font-medium
              bg-[var(--fe-soft)]
              text-[var(--fe-text-main)]
              hover:bg-[var(--fe-green)]
              transition
            "
          >
            Voir plus
          </Link>
        </div>
      </section>

      {/* ================= BLOC INFO ================= */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-[var(--fe-surface)] p-8 shadow">
          <h2 className="text-2xl font-semibold text-[var(--fe-text-main)]">
            Un espace pensé pour les parents
          </h2>
          <p className="mt-2 text-[var(--fe-text-soft)]">
            Des contenus clairs, bienveillants et accessibles pour accompagner
            les enfants, étape par étape.
          </p>
        </div>
      </section>
    </main>
  );
}
