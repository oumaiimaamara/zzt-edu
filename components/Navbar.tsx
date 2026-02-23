"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/app/providers";
import CartDrawer from "@/components/CartDrawer";

import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Home,
  BookOpen,
  MessageCircle,
  Info,
  Heart,
} from "lucide-react";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type MeUser =
  | null
  | { id: string; name?: string | null; email?: string | null; role?: string | null };

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { items, openCart } = useCart();

  const [me, setMe] = useState<MeUser>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  const count = useMemo(() => items.reduce((s, it) => s + it.qty, 0), [items]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const linkCls = (href: string) =>
    cx(
      "rounded-xl px-3 py-2 text-sm font-medium transition",
      "focus:outline-none",
      isActive(href)
        ? "bg-[var(--fe-soft)] text-[var(--fe-text-main)] shadow-sm"
        : "text-[var(--fe-text-main)] hover:bg-[var(--fe-soft)]"
    );

  const accountHref = me
    ? "/account"
    : `/login?next=${encodeURIComponent(pathname || "/")}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--fe-border)] bg-[var(--fe-bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Mobile */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--fe-soft)] md:hidden"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link href="/acceuil" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--fe-mauve)] shadow">
                <Heart size={18} />
              </span>

              <span className="leading-tight">
                <span className="block font-semibold tracking-tight">
                  Kido Paradise
                </span>
                <span className="hidden text-xs text-[var(--fe-text-soft)] md:block">
                  Grandir en confiance, ensemble
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-2 md:flex md:pl-4">
              <Link className={linkCls("/acceuil")} href="/acceuil">
                <Home size={16} className="inline mr-1" /> Accueil
              </Link>
              <Link className={linkCls("/videos")} href="/videos">
                <BookOpen size={16} className="inline mr-1" /> Catalogue
              </Link>
              <Link className={linkCls("/forum")} href="/forum">
                <MessageCircle size={16} className="inline mr-1" /> Vos Suggestions
              </Link>
              <Link className={linkCls("/about")} href="/about">
                <Info size={16} className="inline mr-1" /> À propos
              </Link>
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative inline-flex items-center justify-center rounded-xl p-2 hover:bg-[var(--fe-soft)]"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--fe-green)] px-1 text-xs font-semibold">
                  {count}
                </span>
              )}
            </button>

            {/* Account */}
            <AccountHoverMenu accountHref={accountHref} />
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
            <div className="grid gap-2 rounded-2xl bg-[var(--fe-surface)] p-3 shadow">
              <Link onClick={() => setOpen(false)} className={linkCls("/acceuil")} href="/acceuil">
                Accueil
              </Link>
              <Link onClick={() => setOpen(false)} className={linkCls("/videos")} href="/videos">
                Catalogue
              </Link>
              <Link onClick={() => setOpen(false)} className={linkCls("/forum")} href="/forum">
                Vos Suggestions
              </Link>
              <Link onClick={() => setOpen(false)} className={linkCls("/about")} href="/about">
                À propos
              </Link>
              <Link onClick={() => setOpen(false)} className={linkCls("/cart")} href="/cart">
                Panier
              </Link>
              <Link onClick={() => setOpen(false)} className={linkCls("/account")} href={accountHref}>
                Mon compte
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}

function AccountHoverMenu({ accountHref }: { accountHref: string }) {
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await fetch("/api/users/logout", { method: "POST" });
    localStorage.removeItem("token");
    window.location.href = "/acceuil";
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={accountHref}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--fe-green)] px-4 py-2 text-sm font-medium shadow hover:translate-y-[-1px] transition"
      >
        <User size={16} />
        Mon compte
      </Link>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[var(--fe-surface)] shadow-lg">
          <div className="p-2">
            <Link href="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[var(--fe-soft)]">
              <User size={16} /> Mon espace
            </Link>
            <Link href="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[var(--fe-soft)]">
              <Settings size={16} /> Paramètres
            </Link>
            <button
              onClick={onLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[var(--fe-soft)]"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
