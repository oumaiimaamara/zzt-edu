export default function AdminDashboard() {
  const cards = [
    { href: "/admin/reservations", label: "Réservations" },
    { href: "/admin/users", label: "Utilisateurs" },
    { href: "/admin/orders", label: "Commandes" },
    { href: "/admin/videos", label: "Vidéos" },
    { href: "/admin/categories", label: "Catégories" },
    { href: "/admin/pages", label: "Pages" },
  ];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-2 gap-6">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            {c.label}
          </a>
        ))}
      </div>
    </main>
  );
}
