export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--fe-bg)]">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div
          className="
            rounded-3xl
            bg-[var(--fe-surface)]
            p-8 md:p-10
            shadow-[0_12px_30px_rgba(0,0,0,0.08)]
          "
        >
          <h1
            className="
              text-3xl md:text-4xl
              font-semibold
              tracking-tight
              text-[var(--fe-text-main)]
            "
          >
            À propos de Kido Paradise
          </h1>

          <p
            className="
              mt-6
              leading-relaxed
              text-[var(--fe-text-soft)]
            "
          >
            Kido Paradise accompagne les parents avec des contenus fiables,
            accessibles et pensés pour le bien-être des enfants.
          </p>

          <p
            className="
              mt-4
              leading-relaxed
              text-[var(--fe-text-soft)]
            "
          >
            Notre mission est de proposer un espace rassurant, doux et
            professionnel, où chaque parent peut trouver des ressources
            adaptées à chaque étape de la vie de son enfant.
          </p>

          {/* séparateur doux */}
          <div className="my-8 h-px bg-black/5" />

          <p
            className="
              text-sm
              text-[var(--fe-text-soft)]
            "
          >
             Une plateforme pensée pour grandir ensemble, en toute confiance.
          </p>
        </div>
      </section>
    </main>
  );
}
