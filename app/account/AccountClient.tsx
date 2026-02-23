"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { user: null | { id: string; name?: string | null; email?: string | null } };

type LibraryItem = {
  id: string;
  video?: {
    title: string;
    slug: string;
    coverImageUrl?: string | null;
    category?: { slug: string; name: string } | null;
  };
};

type RecentItem = {
  id: string;
  title: string;
  href: string;
  coverImageUrl?: string | null;
};

function safeCover(url?: string | null) {
  if (!url) return "/placeholder-cover.jpg";
  const c = String(url).trim().replace(/\\/g, "/");
  if (!c || c === "null" || c === "undefined") return "/placeholder-cover.jpg";
  return c.startsWith("http") ? c : c.startsWith("/") ? c : `/${c}`;
}

export default function AccountClient() {
  const router = useRouter();
  const [me, setMe] = useState<Me["user"]>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/me");
        const data: Me = await res.json().catch(() => ({ user: null }));
        if (!data.user) {
          router.push(`/login?next=/account`);
          return;
        }

        if (!cancelled) setMe(data.user);

        const libRes = await fetch("/api/library");
        const lib = await libRes.json().catch(() => ({}));
        if (!cancelled) setLibrary(Array.isArray(lib?.items) ? lib.items : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    try {
      const raw = localStorage.getItem("kp_recent");
      setRecent(raw ? JSON.parse(raw).slice(0, 3) : []);
    } catch {}

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onLogout() {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("token");
      router.push("/acceuil");
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-[var(--fe-surface)] p-6 text-[var(--fe-text-soft)] shadow">
        Chargement de votre espace…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* LEFT */}
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
          <p className="text-sm text-[var(--fe-text-soft)]">Bienvenue,</p>
          <p className="text-xl font-semibold text-[var(--fe-text-main)]">
            {me?.name || me?.email || "Parent"}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/videos"
              className="
                rounded-2xl px-4 py-2 font-medium
                bg-[var(--fe-green)]
                text-[var(--fe-text-main)]
                shadow-[0_6px_0_rgba(0,0,0,0.08)]
                hover:translate-y-[1px]
                transition
              "
            >
              Catalogue
            </Link>

            <button
              onClick={onLogout}
              className="
                rounded-2xl px-4 py-2 font-medium
                bg-[var(--fe-soft)]
                text-[var(--fe-text-main)]
                hover:bg-[var(--fe-mauve)]
                transition
              "
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Recently */}
        <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
          <h2 className="font-semibold text-[var(--fe-text-main)]">Vus récemment</h2>

          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--fe-text-soft)]">
              Aucun cours consulté récemment.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={r.href}
                  className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition"
                >
                  {/* eslint-disable-next-line */}
                  <img src={safeCover(r.coverImageUrl)} className="h-24 w-full object-cover" />
                  <p className="p-3 text-sm font-medium text-[var(--fe-text-main)] line-clamp-2">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Library */}
        <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
          <h2 className="font-semibold text-[var(--fe-text-main)]">Ma bibliothèque</h2>

          {library.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--fe-text-soft)]">
              Aucun cours acheté pour le moment.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {library.map((it) => {
                const v = it.video;
                if (!v) return null;
                return (
                  <Link
                    key={it.id}
                    href={`/videos/${v.category?.slug}/${v.slug}`}
                    className="flex gap-3 rounded-2xl bg-white shadow hover:shadow-md transition"
                  >
                    {/* eslint-disable-next-line */}
                    <img src={safeCover(v.coverImageUrl)} className="h-20 w-24 object-cover" />
                    <div className="p-3">
                      <p className="font-medium text-[var(--fe-text-main)]">
                        {v.title}
                      </p>
                      <p className="text-xs text-[var(--fe-text-soft)]">
                        {v.category?.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <AccountSettingsCard />
    </div>
  );
}

function AccountSettingsCard() {
  return (
    <div className="rounded-3xl bg-[var(--fe-surface)] p-6 shadow">
      <h2 className="font-semibold text-[var(--fe-text-main)]">Paramètres</h2>
      <p className="mt-2 text-sm text-[var(--fe-text-soft)]">
        Modification du profil (API à venir).
      </p>

      <button
        disabled
        className="
          mt-4 w-full rounded-2xl px-5 py-3
          bg-[var(--fe-green)]
          text-[var(--fe-text-main)]
          opacity-50 cursor-not-allowed
          shadow-[0_6px_0_rgba(0,0,0,0.08)]
        "
      >
        Enregistrer
      </button>
    </div>
  );
}
