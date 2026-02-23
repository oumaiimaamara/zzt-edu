"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

type Item = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  type: string;
  coverImageUrl: string;
  category: { name: string; slug: string };
  professionalName: string;
};

function safeSlug(value: string) {
  return encodeURIComponent(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );
}

function safeCover(url?: string) {
  if (!url) return "/placeholder-cover.jpg";
  const c = url.trim().replace(/\\/g, "/");
  if (!c || c === "null" || c === "undefined") return "/placeholder-cover.jpg";
  return c.startsWith("http") ? c : c.startsWith("/") ? c : `/${c}`;
}

export default function LatestCoursesCarousel({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isJumpingRef = useRef(false);

  const loopItems = useMemo(() => {
    if (items.length <= 1) return items;
    return [
      ...items.slice(-2),
      ...items,
      ...items.slice(0, 2),
    ];
  }, [items]);

  function cardStep() {
    const el = scrollerRef.current;
    if (!el) return 340;
    const card = el.querySelector<HTMLElement>("[data-card='1']");
    return card ? card.offsetWidth + 20 : 340;
  }

  function scrollByCard(dir: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const step = cardStep();
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length <= 1) return;
    el.scrollLeft = cardStep() * 2;
  }, [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length <= 1) return;

    const onScroll = () => {
      if (isJumpingRef.current) return;
      const step = cardStep();
      const start = step * 2;
      const end = step * (2 + items.length);

      if (el.scrollLeft < start - step) {
        isJumpingRef.current = true;
        el.scrollLeft = end - step;
        requestAnimationFrame(() => (isJumpingRef.current = false));
      }

      if (el.scrollLeft > end + step) {
        isJumpingRef.current = true;
        el.scrollLeft = start + step;
        requestAnimationFrame(() => (isJumpingRef.current = false));
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items]);

  if (!loopItems.length) return null;

  return (
    <div className="relative">
      {/* NAV */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
        <button
          onClick={() => scrollByCard("left")}
          className="pointer-events-auto ml-1 h-11 w-11 rounded-2xl bg-[var(--fe-green)] shadow hover:translate-y-[1px] transition"
        >
          ‹
        </button>
        <button
          onClick={() => scrollByCard("right")}
          className="pointer-events-auto mr-1 h-11 w-11 rounded-2xl bg-[var(--fe-mauve)] shadow hover:translate-y-[1px] transition"
        >
          ›
        </button>
      </div>

      {/* SCROLL */}
      <div ref={scrollerRef} className="no-scrollbar overflow-x-auto scroll-smooth">
        <div className="flex gap-5 px-2 py-2">
          {loopItems.map((c, idx) => {
            const href = `/videos/${safeSlug(c.category.slug)}/${safeSlug(c.slug)}`;

            return (
              <article
                key={`${c.id}-${idx}`}
                data-card={idx === 0 ? "1" : "0"}
                className="w-[280px] md:w-[340px] shrink-0 rounded-3xl bg-[var(--fe-surface)] shadow hover:shadow-lg transition"
              >
                <Link href={href}>
                  <div className="relative h-44 bg-[var(--fe-bg)]">
                    <Image
                      src={safeCover(c.coverImageUrl)}
                      alt={c.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[var(--fe-text-main)] line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-sm text-[var(--fe-text-soft)]">
                    {c.category.name} • {Math.round(c.price)} DT
                  </p>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/orders/new?videoId=${c.id}`}
                      className="rounded-xl px-4 py-2 bg-[var(--fe-green)] shadow hover:translate-y-[1px] transition"
                    >
                      Acheter
                    </Link>

                    <Link
                      href={href}
                      className="rounded-xl px-4 py-2 bg-[var(--fe-soft)] hover:bg-[var(--fe-mauve)] transition"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
