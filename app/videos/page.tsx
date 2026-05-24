import { prisma } from "@/lib/prisma";
import TopSliderClient from "./TopSliderClient";
import normalizeCover from "./normalizeCover";
import CatalogueClient from "./CatalogueClient";

function inferCourseType(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  if (text.includes("pack")) return "pack";
  if (text.includes("formation")) return "formation";
  return "cours";
}

function inferAgeRange(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase();
  if (text.match(/\b(0|1|2|3)\s*(ans?|mois)\b/) || text.includes("nourrisson") || text.includes("bébé") || text.includes("naissance")) return "0-3";
  if (text.match(/\b[3-6]\s*ans?\b/) || text.includes("maternelle") || text.includes("petite enfance")) return "3-6";
  if (text.match(/\b([6-9]|1[0-2])\s*ans?\b/) || text.includes("primaire") || text.includes("école")) return "6-12";
  if (text.match(/\b(1[2-9]|ado)\b/) || text.includes("adolescent") || text.includes("lycée") || text.includes("collège")) return "12-18";
  return "all-ages";
}

export default async function VideosCatalogPage() {
  const [rawCourses, categories] = await Promise.all([
    prisma.video.findMany({
      include: { category: true, professional: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const courses = rawCourses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description ?? "",
    price: Number(c.price ?? 0),
    type: c.type,
    coverImageUrl: c.coverImageUrl ?? null,
    courseType: inferCourseType(c.title, c.description ?? ""),
    ageRange: inferAgeRange(c.title, c.description ?? ""),
    category: c.category ? { id: c.category.id, name: c.category.name, slug: c.category.slug } : null,
    professional: c.professional ? { name: c.professional.name } : null,
  }));

  const slides = rawCourses
    .filter((c) => c?.category?.slug && c?.slug)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: (c.description || "").slice(0, 80) + ((c.description?.length ?? 0) > 80 ? "…" : ""),
      href: `/videos/${c.category!.slug}/${c.slug}`,
      imageUrl: normalizeCover(c.coverImageUrl),
      price: Number(c.price ?? 0),
      tag: c.type === "VIDEO" ? "Nouveauté vidéo" : "Nouveau contenu",
    }));

  const pillClass = "mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium";
  const dotStyle = { background: "#8b6cc7" };
  const pillStyle = { background: "#ede0ff", color: "#6b4fa0" };
  const blob1Style = { background: "radial-gradient(circle, #c4b0e8 0%, transparent 70%)" };
  const blob2Style = { background: "radial-gradient(circle, #d4a574 0%, transparent 70%)" };
  const headerStyle = { background: "linear-gradient(135deg, #e8e0f5 0%, #f0e8e0 100%)" };
  const mainStyle = { background: "linear-gradient(160deg, #f5f0eb 0%, #ede8f5 50%, #f5f0eb 100%)" };

  return (
    <main className="min-h-screen" style={mainStyle}>
      <div className="relative overflow-hidden px-4 pb-8 pt-12" style={headerStyle}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20" style={blob1Style} />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-40 w-40 rounded-full opacity-15" style={blob2Style} />
        <div className="relative mx-auto max-w-6xl">
          <div className={pillClass} style={pillStyle}>
            <span className="h-1.5 w-1.5 rounded-full" style={dotStyle} />
            Catalogue
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: "#2d1f4e" }}>
            Tous les cours
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: "#7c6a9a" }}>
            Des cours doux, rassurants et pensés pour les parents. Achetez, puis accédez en toute sécurité.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <TopSliderClient slides={slides} />
        <CatalogueClient courses={courses} categories={categories} />
      </section>
    </main>
  );
}