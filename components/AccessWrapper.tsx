"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseTabs from "./CourseTabs";

export default function AccessWrapper({
  videoId,
  course,
}: {
  videoId: string;
  course: any;
}) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/access?videoId=${videoId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      setHasAccess(!!data.hasAccess);
    }
    check();
  }, [videoId]);

  return (
    <CourseTabs
      course={course}
      hasAccess={hasAccess}
      onBuy={() => router.push(`/orders/new?videoId=${videoId}`)}
    />
  );
}
