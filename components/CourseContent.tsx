"use client";

export default function CourseContent({
  course,
  hasAccess,
  isLoggedIn,
  buyNow,
  buyLoading,
  buyError,
}: {
  course: any;
  hasAccess: boolean;
  isLoggedIn: boolean;
  buyNow: () => Promise<void>;
  buyLoading: boolean;
  buyError: string | null;
}) {
  const isVideo = course.type === "VIDEO";

  // ARTICLE (gratuit pour l’instant)
  if (!isVideo) {
    const content = (course.articleContent ?? "").trim();
    return (
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        {content ? (
          <div className="space-y-4 text-white/85 leading-relaxed">
            {content.split("\n").map((line: string, idx: number) =>
              line.trim() ? <p key={idx}>{line}</p> : null
            )}
          </div>
        ) : (
          <p className="text-white/60">Aucun contenu article n’a été ajouté.</p>
        )}
      </div>
    );
  }

  // VIDEO Paywall
  if (!hasAccess) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            🔒
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Contenu verrouillé</h3>
            <p className="mt-1 text-sm text-white/70">
              Achetez ce cours pour accéder à la vidéo complète.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={buyNow}
                disabled={buyLoading}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {buyLoading ? "Achat..." : `Acheter • ${Math.round(course.price)} DT`}
              </button>

              {!isLoggedIn ? (
                <span className="text-sm text-white/60">Connectez-vous pour acheter.</span>
              ) : null}
            </div>

            {buyError ? <p className="mt-3 text-sm text-red-400">{buyError}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  // Accès OK -> stream sécurisé
  return (
    <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
      <video controls className="w-full rounded-2xl" src={`/api/stream/${course.id}`} />
      <p className="mt-2 text-xs text-white/60">
        Lecture via stream contrôlé (vérifie l’achat).
      </p>
    </div>
  );
}
