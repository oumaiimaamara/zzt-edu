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

/* ── Icons ── */
const IconX = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconPencil = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4L16.862 3.487z" />
  </svg>
);
const IconPlus = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconFolder = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
);
const IconSearch = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
  </svg>
);
const IconAlert = ({ className = "h-4 w-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);
const IconSpin = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/* ── Modal Ajouter / Modifier ── */
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
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Bande couleur en haut */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {mode === "create" ? "Nouvelle catégorie" : "Modifier"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {mode === "create" ? "Ajoutez une nouvelle catégorie au catalogue" : `Modification de « ${initial?.name} »`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fermer"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {/* Nom */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex : Allaitement"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-300 transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-50"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-300">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                  placeholder="generé-auto"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-7 pr-4 font-mono text-xs text-slate-500 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-50"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">Généré automatiquement depuis le nom</p>
            </div>

            {/* Catégorie parente */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Catégorie parente <span className="font-normal normal-case text-slate-400">(optionnel)</span>
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-50"
              >
                <option value="">— Racine (aucun parent) —</option>
                {availableParents.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <IconAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-1">
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading
                  ? (mode === "create" ? "Création…" : "Enregistrement…")
                  : (mode === "create" ? "Créer la catégorie" : "Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dialog Suppression ── */
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
        setError(data.error === "HAS_CHILDREN"
          ? "Supprimez d'abord les sous-catégories."
          : "Impossible de supprimer cette catégorie.");
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
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H9z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-900">Supprimer la catégorie</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Vous êtes sur le point de supprimer{" "}
            <span className="font-semibold text-slate-800">« {category.name} »</span>.
            Cette action est irréversible.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <IconAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-2.5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={loading}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {loading ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page principale ── */
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

  const getParentName = (parentId: string | null) =>
    parentId ? (flat.find((c) => c.id === parentId)?.name ?? null) : null;

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-500">
              Administration
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Catégories</h1>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200 active:scale-95"
          >
            <IconPlus className="h-4 w-4" />
            Nouvelle catégorie
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            {
              label: "Total",
              value: flat.length,
              sub: "catégories créées",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
            },
            {
              label: "Racines",
              value: rootCount,
              sub: "catégories principales",
              color: "text-teal-600",
              bg: "bg-teal-50",
              icon: <IconFolder className="h-5 w-5" />,
            },
            {
              label: "Sous-catégories",
              value: childCount,
              sub: "catégories imbriquées",
              color: "text-violet-600",
              bg: "bg-violet-50",
              icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>,
            },
          ].map(({ label, value, sub, color, bg, icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
                {icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-400">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Barre recherche + tableau ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Rechercher par nom ou slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-300 transition focus:border-emerald-400 focus:bg-white focus:ring-3 focus:ring-emerald-50"
              />
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                <IconX className="h-3.5 w-3.5" />
                Effacer
              </button>
            )}
            <span className="shrink-0 text-xs text-slate-400">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-300">
              <IconSpin className="h-7 w-7" />
              <span className="text-sm">Chargement des catégories…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <IconFolder className="h-7 w-7 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">
                  {search ? "Aucun résultat" : "Aucune catégorie"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {search ? `Aucune catégorie ne correspond à « ${search} »` : "Commencez par créer votre première catégorie."}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <IconPlus className="h-4 w-4" />
                  Créer une catégorie
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="w-12 px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Nom</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Slug</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const parentName = getParentName(c.parentId);
                  const isLast = i === filtered.length - 1;
                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-slate-50 ${!isLast ? "border-b border-slate-50" : ""}`}
                    >
                      {/* # */}
                      <td className="px-5 py-4 text-xs font-medium text-slate-300">{String(i + 1).padStart(2, "0")}</td>

                      {/* Nom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.parentId ? "bg-violet-50 text-violet-400" : "bg-emerald-50 text-emerald-500"}`}>
                            <IconFolder className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{c.name}</div>
                            {parentName && (
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                <span>dans</span>
                                <span className="font-medium text-slate-500">{parentName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-5 py-4">
                        <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
                          {c.slug}
                        </code>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        {c.parentId ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                            Sous-catégorie
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Racine
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Sous-catégorie */}
                          <button
                            onClick={() => setModal({ mode: "create", initial: { id: "", name: "", slug: "", parentId: c.id }, defaultParentId: c.id })}
                            title="Ajouter une sous-catégorie"
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <IconPlus className="h-3 w-3" />
                            Sous-cat.
                          </button>

                          {/* Modifier */}
                          <button
                            onClick={() => setModal({ mode: "edit", initial: c })}
                            title="Modifier"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => setDeleteTarget(c)}
                            title="Supprimer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          >
                            <IconX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Footer tableau */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                {flat.length} catégorie{flat.length !== 1 ? "s" : ""} au total
                {search && ` · ${filtered.length} résultat${filtered.length !== 1 ? "s" : ""}`}
              </p>
              <p className="text-xs text-slate-300">
                {rootCount} racine{rootCount !== 1 ? "s" : ""} · {childCount} sous-cat.
              </p>
            </div>
          )}
        </div>
      </div>

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