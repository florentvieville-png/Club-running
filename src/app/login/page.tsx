"use client";

import { createClient } from "@/lib/supabase/client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function MountainHero() {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e5b8e" />
          <stop offset="100%" stopColor="#388bc7" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky)" />
      <circle cx="330" cy="45" r="26" fill="#ffd23f" opacity="0.9" />
      <path d="M0 150 L70 80 L120 130 L180 60 L250 150 Z" fill="#0e5b8e" opacity="0.55" />
      <path d="M-20 170 L90 100 L160 160 L230 90 L340 170 Z" fill="#ff7a00" opacity="0.35" />
      <path d="M0 200 L60 130 L140 190 L220 110 L300 190 L400 140 L400 200 Z" fill="#0b1420" opacity="0.25" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#0e5b8e]">
      <div className="relative h-56 shrink-0 overflow-hidden">
        <MountainHero />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Image
            src="/icons/logo-120.png"
            alt="La Loriolade"
            width={92}
            height={92}
            className="drop-shadow-lg"
            priority
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-t-3xl bg-white px-6 pb-10 pt-7 dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-white">La Loriolade</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Course à pied · Trail · Partage — connexion par lien magique envoyé à votre adresse
          e-mail.
        </p>

        {authError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            La connexion a échoué, merci de réessayer.
          </p>
        )}

        {status === "sent" ? (
          <p className="mt-6 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            Un lien de connexion vient de vous être envoyé par e-mail. Ouvrez-le
            pour accéder à l&apos;application.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Prénom + nom
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex : Camille Dupont"
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-brand-orange"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-brand-orange"
              />
            </label>
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-xl bg-brand-orange px-3 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {status === "sending" ? "Envoi..." : "Se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
