// app/admin/layout.tsx
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        admin min-h-screen
        bg-[var(--ad-bg)]
        text-[var(--ad-text)]
      "
    >
      {children}
    </div>
  );
}
