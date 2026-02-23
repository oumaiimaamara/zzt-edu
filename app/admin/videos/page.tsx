import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil } from "lucide-react";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">
            Catalogue — Admin
          </h1>

          <Link
            href="/admin/videos/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--ad-yellow)] px-5 py-3 text-sm font-medium text-slate-900 hover:bg-[var(--ad-yellow-hover)]"
          >
            <Plus size={18} />
            Ajouter une vidéo
          </Link>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div
              key={v.id}
              className="overflow-hidden rounded-3xl bg-[var(--ad-surface)] shadow-sm"
            >
              <div className="h-44 overflow-hidden">
                {v.type === "VIDEO" ? (
                  <video
                    className="h-full w-full object-cover"
                    src={v.videoUrl}
                    muted
                  />
                ) : (
                  <img
                    src={v.coverImageUrl ?? "/placeholder-cover.jpg"}
                    alt={v.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {v.title}
                </h2>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {Math.round(v.price)} DT
                  </span>

                  <Link
                    href={`/admin/videos/${v.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--ad-yellow)] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[var(--ad-yellow-hover)]"
                  >
                    <Pencil size={16} />
                    Modifier
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {videos.length === 0 && (
            <div className="col-span-full rounded-3xl bg-[var(--ad-surface)] p-10 text-center text-slate-500">
              Aucune vidéo créée.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
