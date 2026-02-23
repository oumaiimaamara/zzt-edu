import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseTabsClient from "./CourseTabsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    categorySlug: string;
    courseSlug: string;
  }>;
};

// ===== utils =====
function safeDecode(v?: string) {
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function normalizeSlugLoose(v: string) {
  return v
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePublicUrl(url?: string | null) {
  if (!url) return "/placeholder-cover.jpg";
  const cleaned = String(url).trim().replace(/\\/g, "/");
  if (!cleaned || cleaned === "null" || cleaned === "undefined") {
    return "/placeholder-cover.jpg";
  }
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

// ===== PAGE =====
export default async function CoursePage({ params }: PageProps) {
  // ✅ OBLIGATOIRE en Next 16
  const { categorySlug, courseSlug } = await params;

  const rawCategory = safeDecode(categorySlug);
  const rawCourse = safeDecode(courseSlug);

  const targetCategory = normalizeSlugLoose(rawCategory);
  const targetCourse = normalizeSlugLoose(rawCourse);

  // 🔥 Load large, match in JS (robuste)
  const courses = await prisma.video.findMany({
    include: {
      category: true,
      professional: true,
    },
  });

  const course = courses.find((c) => {
    return (
      normalizeSlugLoose(c.category?.slug || "") === targetCategory &&
      normalizeSlugLoose(c.slug || "") === targetCourse
    );
  });

  if (!course) {
    console.error("COURSE NOT FOUND", {
      rawCategory,
      rawCourse,
      targetCategory,
      targetCourse,
      dbSlugs: courses.map((c) => ({
        category: c.category?.slug,
        course: c.slug,
      })),
    });
    notFound();
  }

  const thumb = normalizePublicUrl(course.coverImageUrl);

  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-5xl px-4 py-12">
        {/* breadcrumb */}
        <div className="mb-4 text-sm text-[var(--fe-text-soft)]">
          <Link href="/videos" className="hover:underline">
            Cours
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-[var(--fe-text-main)]">
            {course.category?.name}
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl bg-[var(--fe-surface)] shadow ring-1 ring-black/5">
          <div className="grid md:grid-cols-[360px_1fr]">
            <div className="relative aspect-video md:aspect-[16/10]">
              <Image
                src={thumb}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-[var(--fe-text-main)]">
                {course.title}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-[var(--fe-soft)] px-3 py-1">
                  {course.category?.name}
                </span>
                <span className="rounded-full bg-[var(--fe-mauve)] px-3 py-1">
                  {Math.round(Number(course.price || 0))} DT
                </span>
                <span className="text-[var(--fe-text-soft)]">
                  • {course.professional?.name ?? "—"}
                </span>
              </div>

              <p className="mt-3 text-[var(--fe-text-soft)]">
                {course.description || "—"}
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/orders/new?videoId=${course.id}`}
                  className="rounded-2xl bg-[var(--fe-green)] px-5 py-2 shadow hover:translate-y-[1px] transition"
                >
                  Acheter
                </Link>

                <Link
                  href="/videos"
                  className="rounded-2xl bg-[var(--fe-soft)] px-5 py-2 transition"
                >
                  Retour
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CourseTabsClient course={course as any} />
        </div>
      </section>
    </main>
  );
}
