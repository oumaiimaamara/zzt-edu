import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-emerald-950">Catégories</h1>
          <Link
            href="/admin/categories/new"
            className="rounded-2xl bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700"
          >
            + Ajouter
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white/80 p-4 ring-1 ring-emerald-900/5"
            >
              <div className="font-medium text-emerald-950">{c.name}</div>
              <div className="text-sm text-emerald-900/60">slug: {c.slug}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
