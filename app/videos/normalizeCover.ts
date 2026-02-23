export default function normalizeCover(input?: string | null) {
  const fallback = "/placeholder-cover.jpg";
  const raw = (input ?? "").trim();
  if (!raw) return fallback;

  // URL absolue
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // déjà ok
  if (raw.startsWith("/uploads/")) return raw;
  if (raw.startsWith("/")) return raw;

  // cas le plus fréquent: "uploads/covers/xxx.webp"
  if (raw.startsWith("uploads/")) return "/" + raw;

  // si jamais tu stockes juste "covers/xxx.webp"
  if (raw.startsWith("covers/")) return "/uploads/" + raw;

  // sinon on tente au moins de le rendre relatif root
  return "/" + raw;
}
