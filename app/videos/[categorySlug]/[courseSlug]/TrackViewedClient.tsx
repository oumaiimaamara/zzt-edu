"use client";

import { useEffect } from "react";

type RecentItem = {
  id: string;
  title: string;
  href: string;
  coverImageUrl?: string | null;
  viewedAt: number;
};

function safeCover(url?: string | null) {
  if (!url) return "/placeholder-cover.jpg";
  const cleaned = String(url).trim().replace(/\\/g, "/");
  if (!cleaned || cleaned === "null" || cleaned === "undefined") return "/placeholder-cover.jpg";
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return encodeURI(cleaned);
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return encodeURI(withSlash);
}

export default function TrackViewedClient(props: {
  id: string;
  title: string;
  href: string;
  coverImageUrl?: string | null;
}) {
  useEffect(() => {
    try {
      const key = "kp_recent";
      const item: RecentItem = {
        id: props.id,
        title: props.title,
        href: props.href,
        coverImageUrl: safeCover(props.coverImageUrl),
        viewedAt: Date.now(),
      };

      const raw = localStorage.getItem(key);
      const list: RecentItem[] = raw ? JSON.parse(raw) : [];

      const next = [item, ...list.filter((x) => x?.id !== props.id)].slice(0, 3);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // no-op
    }
  }, [props.id, props.title, props.href, props.coverImageUrl]);

  return null;
}
