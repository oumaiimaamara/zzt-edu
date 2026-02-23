"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";

const nav = [
  { label: "Accueil", href: "/acceuil" },
  { label: "Catalogue", href: "/videos" },
  { label: "Notre forum", href: "/forum" },
  { label: "À propos", href: "/about" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const activeHref = useMemo(() => pathname || "/", [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--fe-border)] bg-[var(--fe-bg)]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/acceuil" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--fe-mauve)] shadow">
              K
            </div>
            <span className="font-semibold tracking-tight text-[var(--fe-text-main)]">
              Kido Paradise
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {nav.map((item) => {
              const active =
                activeHref === item.href ||
                (item.href !== "/acceuil" && activeHref.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-[var(--fe-soft)] text-[var(--fe-text-main)] shadow-sm"
                      : "text-[var(--fe-text-soft)] hover:bg-[var(--fe-soft)] hover:text-[var(--fe-text-main)]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--fe-soft)] px-3 py-2 text-sm font-medium shadow hover:translate-y-[-1px] transition"
            >
              <ShoppingCart className="h-4 w-4" />
              Panier
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--fe-green)] px-3 py-2 text-sm font-medium shadow hover:translate-y-[-1px] transition"
            >
              <User className="h-4 w-4" />
              Mon compte
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-2xl p-2 bg-[var(--fe-soft)] shadow"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <div className="grid gap-2 rounded-3xl bg-[var(--fe-surface)] p-3 shadow">
              {nav.map((item) => {
                const active =
                  activeHref === item.href ||
                  (item.href !== "/acceuil" &&
                    activeHref.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-[var(--fe-soft)] text-[var(--fe-text-main)]"
                        : "text-[var(--fe-text-soft)] hover:bg-[var(--fe-soft)] hover:text-[var(--fe-text-main)]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--fe-soft)] px-3 py-3 text-sm font-medium shadow"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Panier
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--fe-green)] px-3 py-3 text-sm font-medium shadow"
                >
                  <User className="h-4 w-4" />
                  Compte
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
