"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Professional = { id: string; name: string };

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [professionalId, setProfessionalId] = useState("");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    if (coverImageUrl) return coverImageUrl;
    return "";
  }, [coverFile, coverImageUrl]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Load video + categories + professionals
  useEffect(() => {
    async function load() {
      try {
        const [vRes, cRes, pRes] = await Promise.all([
          fetch(`/api/videos/by-id?id=${id}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/professionals"),
        ]);

        if (!vRes.ok) throw new Error("video fetch failed");

        const v = await vRes.json();
        const c = await cRes.json();
        const p = await pRes.json();

        const course = v.course;

        setTitle(course.title);
        setDescription(course.description);
        setPrice(course.price);
        setCategoryId(course.category.id);
        setProfessionalId(course.professional.id);
        setVideoUrl(course.videoUrl);
        setCoverImageUrl(course.coverImageUrl ?? null);

        setCategories(c.categories ?? []);
        setProfessionals(p.professionals ?? []);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger la vidéo.");
      }
    }
    load();
  }, [id]);

  // ⬆️ Upload cover
  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload-cover", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Erreur upload cover");
    }

    const data = await res.json();
    return data.coverImageUrl as string;
  }

  // ✅ Submit update
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let finalCover = coverImageUrl;

      // Si nouvelle cover choisie → upload
      if (coverFile) {
        finalCover = await uploadCover(coverFile);
      }

      const res = await fetch(`/api/admin/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          categoryId,
          professionalId,
          coverImageUrl: finalCover,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Erreur mise à jour vidéo.");
        setLoading(false);
        return;
      }

      router.push("/admin/videos");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-emerald-950">
          Modifier la vidéo
        </h1>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5"
        >
          {/* TITRE */}
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Titre
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 px-4 py-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Description
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 px-4 py-3"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* PRIX */}
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Prix (DT)
            </label>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 px-4 py-3"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={0}
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Catégorie
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 px-4 py-3"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* PROFESSIONAL */}
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Professionnel
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 px-4 py-3"
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* COVER */}
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
            <p className="text-sm font-medium text-emerald-950">Cover</p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />

            {coverPreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
                <img
                  src={coverPreview}
                  alt="cover preview"
                  className="h-44 w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900/70">
                Aucune cover définie.
              </div>
            )}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </section>
    </main>
  );
}
