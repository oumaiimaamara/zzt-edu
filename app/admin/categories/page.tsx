"use client";

import { useState, useEffect, useCallback } from "react";

type FlatCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─── Modal Ajouter / Modifier ─── */
function CategoryModal({
  mode,
  initial,
  allCategories,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: FlatCategory | null;
  allCategories: FlatCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (v: string) => {
    setName(v);
    if (autoSlug) setSlug(slugify(v));
  };

  const availableParents = allCategories.filter((c) => c.id !== initial?.id);

  const submit = async () => {
    setError(null);
    if (!name.trim()) { setError("Le nom est requis."); return; }
    setLoading(true);
    try {
      const url = mode === "edit"
        ? `/api/admin/categories/${initial!.id}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), parentId: parentId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          NAME_REQUIRED: "Le nom est requis.",
          INVALID_NAME: "Nom invalide.",
          CATEGORY_ALREADY_EXISTS: "Cette catégorie existe déjà.",
        };
        setError(msgs[data.error] ?? "Une erreur est survenue.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-emerald-950">
            {mode === "create" ? "Nouvelle catégorie" : "Modifier la catégorie"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-emerald-800">
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex : Allaitement"
              autoFocus
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2.5 text-sm text-emerald-950 outline-none placeholder:text-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-emerald-800">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
              placeholder="généré-automatiquement"
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2.5 font-mono text-xs text-emerald-600 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            />
            <p className="mt-1 text-xs text-emerald-400">Généré automatiquement depuis le nom</p>
          </div>

          {/* Catégorie parente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-emerald-800">
              Catégorie parente <span className="font-normal text-emerald-400">(optionnel)</span>
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="">— Aucune (catégorie racine) —</option>
              {availableParents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 ring-1 ring-red-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading
                ? (mode === "create" ? "Création…" : "Enregistrement…")
                : (mode === "create" ? "Créer" : "Enregistrer")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dialog Suppression ─── */
function DeleteDialog({
  category,
  onClose,
  onDeleted,
}: {
  category: FlatCategory;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(
          data.error === "HAS_CHILDREN"
            ? "Supprimez d'abord les sous-catégories."
            : "Impossible de supprimer cette catégorie."
        );
        return;
      }
      onDeleted();
      onClose();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-emerald-950">Supprimer la catégorie</h2>
        </div>
        <p className="mb-5 mt-2 text-sm text-emerald-600">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-emerald-900">« {category.name} »</span> ?
          Cette action est irréversible.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 ring-1 ring-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ─── */
export default function CategoriesAdminPage() {
  const [flat, setFlat] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | {
    mode: "create" | "edit";
    initial?: FlatCategory;
    defaultParentId?: string;
  }>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlatCategory | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setFlat(data.categories ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? flat.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      )
    : flat;

  const rootCount = flat.filter((c) => !c.parentId).length;
  const childCount = flat.filter((c) => !!c.parentId).length;

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    return flat.find((c) => c.id === parentId)?.name ?? null;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <section className="mx-auto max-w-5xl px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-950">Catégories</h1>
            <p className="mt-1 text-sm text-emerald-500">
              {flat.length} catégorie{flat.length !== 1 ? "s" : ""} au total
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: flat.length, color: "bg-emerald-50 text-emerald-700", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            )},
            { label: "Racines", value: rootCount, color: "bg-teal-50 text-teal-700", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
            )},
            { label: "Sous-catégories", value: childCount, color: "bg-amber-50 text-amber-700", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
            )},
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="rounded-2xl bg-white p-5 ring-1 ring-emerald-900/5">
              <div className={`mb-3 inline-flex rounded-xl p-2 ${color}`}>
                {icon}
              </div>
              <div className="text-2xl font-bold text-emerald-950">{value}</div>
              <div className="mt-0.5 text-sm text-emerald-500">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Recherche ── */}
        <div className="relative mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 outline-none placeholder:text-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>

        {/* ── Tableau ── */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-emerald-900/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Chargement…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              <p className="text-sm text-emerald-400">
                {search ? "Aucun résultat pour cette recherche." : "Aucune catégorie. Commencez par en ajouter une."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/60">
                  <th className="w-14 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-400">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-400">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-400">Slug</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-emerald-400">Type</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-emerald-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {filtered.map((c, i) => {
                  const parentName = getParentName(c.parentId);
                  return (
                    <tr key={c.id} className="group hover:bg-emerald-50/50 transition-colors">
                      {/* # */}
                      <td className="px-6 py-5 text-xs text-emerald-300">{i + 1}</td>

                      {/* Nom */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {c.parentId ? (
                            <span className="text-lg text-emerald-300">↳</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                            </svg>
                          )}
                          <div>
                            <div className="font-semibold text-emerald-950">{c.name}</div>
                            {parentName && (
                              <div className="mt-0.5 text-xs text-emerald-400">dans {parentName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-5">
                        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-mono text-xs text-emerald-600 ring-1 ring-emerald-200">
                          {c.slug}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-5">
                        {c.parentId ? (
                          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                            Sous-catégorie
                          </span>
                        ) : (
                          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 ring-1 ring-teal-200">
                            Racine
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">

                          {/* Ajouter sous-catégorie */}
                          <button
                            onClick={() =>
                              setModal({ mode: "create", initial: { id: "", name: "", slug: "", parentId: c.id }, defaultParentId: c.id })
                            }
                            title="Ajouter une sous-catégorie"
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 opacity-0 transition-all hover:bg-emerald-50 hover:border-emerald-400 group-hover:opacity-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Sous-cat.
                          </button>

                          {/* Modifier — icône stylo */}
                          <button
                            onClick={() => setModal({ mode: "edit", initial: c })}
                            title="Modifier"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-500 opacity-0 transition-all hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-800 group-hover:opacity-100"
                          >
                            {/* Stylo / Pencil */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z" />
                            </svg>
                          </button>

                          {/* Supprimer — icône X */}
                          <button
                            onClick={() => setDeleteTarget(c)}
                            title="Supprimer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-400 opacity-0 transition-all hover:bg-red-50 hover:border-red-400 hover:text-red-600 group-hover:opacity-100"
                          >
                            {/* X */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Résumé bas de tableau */}
        {!loading && filtered.length > 0 && (
          <p className="mt-3 text-right text-xs text-emerald-400">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            {search && ` pour « ${search} »`}
          </p>
        )}
      </section>

      {/* ── Modals ── */}
      {modal && (
        <CategoryModal
          mode={modal.mode}
          initial={modal.initial ?? null}
          allCategories={flat}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          category={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={load}
        />
      )}
    </main>
  );
}