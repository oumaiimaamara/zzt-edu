import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-[var(--fe-text-main)]">
          Mon espace
        </h1>
        <p className="mt-2 text-[var(--fe-text-soft)]">
          Ma bibliothèque et mes informations personnelles.
        </p>

        <div className="mt-8">
          <AccountClient />
        </div>
      </section>
    </main>
  );
}
