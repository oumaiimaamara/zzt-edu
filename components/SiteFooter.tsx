// components/SiteFooter.tsx
// ⚠️ logique inchangée – uniquement styling

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Heart,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative mt-16 border-t border-[var(--fe-border)] bg-[var(--fe-bg)]">
      {/* glow doux */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--fe-soft)] to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Bande principale */}
        <div className="relative overflow-hidden rounded-[28px] bg-[var(--fe-surface)] p-6 shadow">
          {/* bulles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />

          <div className="grid gap-5 md:grid-cols-3">
            <InfoCard
              icon={<Heart size={18} />}
              title="Un espace doux pour les parents"
              text="Des contenus clairs et rassurants pour accompagner votre enfant, étape par étape."
            />

            <InfoCard
              icon={<CreditCard size={18} />}
              title="Paiement & accès sécurisés"
              text="Ajout au panier simple et accès à votre bibliothèque après validation."
            />

            <InfoCard
              icon={<ShieldCheck size={18} />}
              title="Professionnalisme & confiance"
              text="Une approche bienveillante, pensée pour le confort des familles."
            />
          </div>
        </div>

        {/* Liens */}
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {/* Présentation */}
          <div>
            <p className="text-base font-semibold text-[var(--fe-text-main)]">
              Kido Paradise
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fe-text-soft)]">
              Cours, conseils et ressources pour accompagner chaque étape
              avec confiance.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--fe-green)] px-4 py-2 text-sm font-medium shadow hover:translate-y-[-1px] transition"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/forum"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--fe-soft)] px-4 py-2 text-sm font-medium shadow hover:translate-y-[-1px] transition"
              >
                Poser une question
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold text-[var(--fe-text-main)]">
              Liens utiles
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              {[
                { href: "/acceuil", label: "Accueil" },
                { href: "/videos", label: "Catalogue" },
                { href: "/library", label: "Ma bibliothèque" },
                { href: "/about", label: "À propos" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="w-fit rounded-lg px-2 py-1 text-[var(--fe-text-soft)] hover:bg-[var(--fe-soft)] hover:text-[var(--fe-text-main)] transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-[var(--fe-text-main)]">
              Nous contacter
            </p>

            <div className="mt-3 rounded-2xl bg-[var(--fe-surface)] p-4 shadow">
              <p className="text-sm text-[var(--fe-text-soft)]">
                Email :{" "}
                <span className="font-medium text-[var(--fe-text-main)]">
                  info@kido.tn
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--fe-text-soft)]">
                Téléphone :{" "}
                <span className="font-medium text-[var(--fe-text-main)]">
                  +216 22 22 22 22
                </span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <SocialIcon href="https://instagram.com">
                  <Instagram size={18} />
                </SocialIcon>
                <SocialIcon href="https://facebook.com">
                  <Facebook size={18} />
                </SocialIcon>
                <SocialIcon href="https://youtube.com">
                  <Youtube size={18} />
                </SocialIcon>
                <SocialIcon href="mailto:info@kido.tn">
                  <Mail size={18} />
                </SocialIcon>
              </div>
            </div>
          </div>
        </div>

        {/* Bas */}
        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--fe-border)] pt-6 text-xs text-[var(--fe-text-soft)] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--fe-text-main)]">
              Kido Paradise
            </span>
            — Tous droits réservés.
          </p>
          <div className="flex gap-3">
            <Link className="hover:underline" href="/about">
              Mentions
            </Link>
            <Link className="hover:underline" href="/about">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --- composants internes --- */

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[var(--fe-soft)] p-4 shadow">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fe-mauve)] shadow">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-[var(--fe-text-main)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--fe-text-soft)]">{text}</p>
      </div>
    </div>
  );
}

function SocialIcon({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--fe-soft)] shadow hover:translate-y-[-1px] transition"
    >
      {children}
    </a>
  );
}
