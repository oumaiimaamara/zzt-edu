// app/videos/TopSliderClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl: string;
  price?: number | null;
  tag?: string;
};

export default function TopSliderClient({
  slides,
  autoMs = 4500,
}: {
  slides: Slide[];
  autoMs?: number;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  const safeSlides = useMemo(() => slides.filter(Boolean), [slides]);

  useEffect(() => {
    if (!safeSlides.length) return;

    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, autoMs);

    return () => clearInterval(t);
  }, [safeSlides.length, autoMs]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;

    child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [index]);

  if (!safeSlides.length) return null;

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-emerald-900/5">
        {/* track */}
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none" as any }}
        >
          {safeSlides.map((s) => (
            <div
              key={s.id}
              className="relative min-w-full snap-start"
            >
              <Link href={s.href} className="block">
                <div className="relative h-44 md:h-56">
                  {/* image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />

                  {/* content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-5 md:px-8">
                      {s.tag ? (
                        <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-950 ring-1 ring-black/5">
                          {s.tag}
                        </div>
                      ) : null}

                      <h2 className="mt-3 max-w-2xl text-xl md:text-3xl font-semibold tracking-tight text-white">
                        {s.title}
                      </h2>

                      {s.subtitle ? (
                        <p className="mt-2 max-w-2xl text-sm md:text-base text-white/85">
                          {s.subtitle}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-2xl bg-white/90 px-3 py-2 text-sm font-medium text-emerald-950 ring-1 ring-black/5">
                          {Math.round(Number(s.price ?? 0))} DT
                        </span>

                        <span className="inline-flex items-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
                          Découvrir
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* arrows */}
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/85 px-3 py-2 text-emerald-950 ring-1 ring-black/10 backdrop-blur-sm hover:bg-white transition"
          aria-label="Previous"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % safeSlides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/85 px-3 py-2 text-emerald-950 ring-1 ring-black/10 backdrop-blur-sm hover:bg-white transition"
          aria-label="Next"
        >
          ›
        </button>

        {/* dots */}
        <div className="flex items-center justify-center gap-2 py-3">
          {safeSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition ${
                i === index ? "w-8 bg-emerald-600" : "w-2.5 bg-emerald-900/15 hover:bg-emerald-900/25"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
