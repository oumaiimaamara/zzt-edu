"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Professional = { id: string; name: string };

export default function Page() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(50);
  const [categoryId, setCategoryId] = useState("");
  const [professionalId, setProfessionalId] = useState("");

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const coverPreview = useMemo(() => {
    if (!coverFile) return "";
    return URL.createObjectURL(coverFile);
  }, [coverFile]);

  const videoPreview = useMemo(() => {
    if (!videoFile) return "";
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch("/api/admin/categories");
        if (!cRes.ok) throw new Error("categories fetch failed");
        const c = await cRes.json();

        const pRes = await fetch("/api/admin/professionals");
        if (!pRes.ok) throw new Error("professionals fetch failed");
        const p = await pRes.json();

        setCategories(c.categories ?? []);
        setProfessionals(p.professionals ?? []);

        if (c.categories?.[0]) setCategoryId(c.categories[0].id);
        if (p.professionals?.[0]) setProfessionalId(p.professionals[0].id);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger catégories / professionnels.");
      }
    }
    load();
  }, []);

  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload-cover", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Erreur upload cover.");
    }

    const data = await res.json();
    return data.coverImageUrl as string; // ex: "/uploads/covers/xxx.webp"
  }

  async function uploadVideo(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload-video", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Erreur upload vidéo.");
    }

    const data = await res.json();
    return data.videoUrl as string;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!videoFile) return setError("Veuillez choisir une vidéo.");
    if (!categoryId) return setError("Veuillez choisir une catégorie.");
    if (!professionalId) return setError("Veuillez choisir un professionnel.");

    setLoading(true);

    try {
      // 1) Upload vidéo
      const videoUrl = await uploadVideo(videoFile);

      // 2) Upload cover (optionnel, mais recommandé)
      let coverImageUrl: string | null = null;
      if (coverFile) {
        coverImageUrl = await uploadCover(coverFile);
      }

      // 3) Create video DB (✅ coverImageUrl envoyé)
      const createRes = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          videoUrl,
          coverImageUrl, // ✅ ICI
          categoryId,
          professionalId,
          type: "VIDEO",
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        setError(data?.error || "Erreur création vidéo.");
        setLoading(false);
        return;
      }

      router.push("/admin/videos");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur inattendue.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-white">
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-emerald-950">
          Ajouter une vidéo
        </h1>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-3xl bg-white/80 p-6 ring-1 ring-emerald-900/5"
        >
          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Titre
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Routine sommeil bébé (0–6 mois)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Description
            </label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Résumé du cours…"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-emerald-950">
                Prix (DT)
              </label>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-950">
                Catégorie
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-950">
              Professionnel
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-200"
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              required
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ COVER */}
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-950">
                  Cover (thumbnail)
                </p>
                <p className="text-xs text-emerald-900/60">
                  JPG / PNG / WEBP • recommandé: WEBP
                </p>
                {coverFile ? (
                  <p className="mt-2 text-xs text-emerald-900/70">
                    Sélectionné : <span className="font-medium">{coverFile.name}</span>
                  </p>
                ) : null}
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-amber-500 px-4 py-2 text-white font-medium shadow-sm hover:bg-amber-600 active:scale-[0.99] transition">
                Choisir cover
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {coverPreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
                <img src={coverPreview} alt="cover preview" className="h-44 w-full object-cover" />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900/70">
                (Optionnel) Si vous ne mettez pas de cover, le catalogue affichera l’image placeholder.
              </div>
            )}
          </div>

          {/* ✅ VIDEO */}
          <div className="rounded-2xl border border-emerald-900/10 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-emerald-950">
                  Fichier vidéo
                </p>
                <p className="text-xs text-emerald-900/60">
                  MP4 / MOV / WEBM • recommandé: MP4
                </p>
                {videoFile ? (
                  <p className="mt-2 text-xs text-emerald-900/70">
                    Sélectionné : <span className="font-medium">{videoFile.name}</span>
                  </p>
                ) : null}
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition">
                Choisir une vidéo
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  required
                />
              </label>
            </div>

            {videoPreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-emerald-900/10">
                <video controls className="w-full" src={videoPreview} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900/70">
                Aucun fichier sélectionné.
              </div>
            )}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Upload..." : "Créer la vidéo"}
          </button>
        </form>
      </section>
    </main>
  );
}
