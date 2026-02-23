"use client";

import { useState } from "react";

export default function ForumPage() {
  const [message, setMessage] = useState("");

  function submit() {
    alert("Message envoyé (backend à connecter)");
    setMessage("");
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="rounded-3xl bg-[var(--fe-surface)] p-8 shadow">
          <h1 className="text-3xl font-semibold text-[var(--fe-text-main)]">
            Vos Suggestions
          </h1>

          <p className="mt-3 text-[var(--fe-text-soft)]">
            Un espace d’échange bienveillant entre parents.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="
              mt-6 w-full rounded-2xl p-4
              bg-[var(--fe-bg)]
              text-[var(--fe-text-main)]
              placeholder:text-[var(--fe-text-soft)]
              outline-none
              shadow-inner
            "
            placeholder="Écrivez votre message..."
            rows={5}
          />

          <button
            onClick={submit}
            className="
              mt-5 rounded-2xl px-7 py-3 font-medium
              bg-[var(--fe-green)]
              text-[var(--fe-text-main)]
              shadow-[0_6px_0_rgba(0,0,0,0.08)]
              hover:translate-y-[1px]
              hover:shadow-[0_4px_0_rgba(0,0,0,0.08)]
              transition
            "
          >
            Envoyer
          </button>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[var(--fe-text-main)]">
              Nous contacter
            </h2>

            <p className="mt-3 text-[var(--fe-text-soft)] leading-relaxed">
              Instagram · Facebook · YouTube <br />
              📧 test@test.com <br />
              📞 +216 22 22 22 22
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
