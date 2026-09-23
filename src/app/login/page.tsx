"use client";

import { createClient } from "@/lib/supabase/client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

function WaveDivider() {
  return (
    <svg
      viewBox="0 0 400 40"
      className="block h-8 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 24 C 50 4, 100 4, 150 20 S 250 36, 300 18 S 380 4, 400 12 L400 40 L0 40 Z"
        fill="#ff7a00"
      />
      <path
        d="M0 30 C 60 14, 120 14, 180 26 S 280 38, 340 22 S 390 14, 400 20 L400 40 L0 40 Z"
        fill="#ffd23f"
        opacity="0.85"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [view, setView] = useState<"splash" | "form">("splash");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/membres`,
    });

    if (error) {
      setStatus("idle");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("idle");
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "E-mail ou mot de passe incorrect."
            : error.message
        );
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setStatus("idle");
      setErrorMessage(
        error.message.includes("already registered")
          ? "Un compte existe déjà avec cet e-mail, connectez-vous."
          : error.message
      );
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    // "Confirm email" encore activé côté Supabase : un e-mail de confirmation a été envoyé.
    setStatus("sent");
  }

  if (view === "splash") {
    return (
      <div className="flex min-h-dvh flex-col bg-gradient-to-b from-[#0e5b8e] to-[#388bc7]">
        <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-12">
          <Image
            src="/icons/logo-120.png"
            alt="La Loriolade"
            width={84}
            height={84}
            className="drop-shadow-lg"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-wide text-white">LA LORIOLADE</h1>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">
              Course à pied · Trail · Partage
            </p>
          </div>
        </div>

        <div className="relative mt-2 flex-1 overflow-hidden">
          <Image
            src="/images/hero-trail.webp"
            alt="Coureurs de La Loriolade sur les crêtes au coucher du soleil"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <p
            className={`${caveat.className} absolute inset-x-0 bottom-4 px-6 text-center text-3xl font-bold leading-tight text-white drop-shadow-md`}
          >
            Plus qu&apos;un club,
            <br />
            une bande de moustachus !
          </p>
        </div>

        <div className="relative bg-white px-6 pb-10 pt-6 dark:bg-zinc-950">
          <div className="absolute inset-x-0 -top-8">
            <WaveDivider />
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setView("form");
                setMode("signin");
                setErrorMessage(null);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-3 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition-colors hover:brightness-95"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 1116 0 1 1 0 01-1 1H3a1 1 0 01-1-1z" />
              </svg>
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setView("form");
                setMode("signup");
                setErrorMessage(null);
              }}
              className="w-fit self-center text-sm font-medium text-brand-blue-dark underline dark:text-blue-300"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-3 px-6 pb-2 pt-7">
        <button
          type="button"
          onClick={() => setView("splash")}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 010 1.06L9.06 10l3.73 3.71a.75.75 0 11-1.06 1.06l-4.25-4.24a.75.75 0 010-1.06l4.25-4.24a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <Image src="/icons/logo-64.png" alt="La Loriolade" width={36} height={36} />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-10 pt-3">
        <h1 className="text-2xl font-bold text-brand-blue-dark dark:text-white">La Loriolade</h1>
        <p className="mt-1 text-sm text-zinc-500">Course à pied · Trail · Partage</p>

        <div className="mt-6 flex w-fit gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500"
            }`}
          >
            Créer un compte
          </button>
        </div>

        {status === "sent" ? (
          <p className="mt-6 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            {mode === "forgot"
              ? "Un e-mail avec un lien de réinitialisation vient de vous être envoyé. Ouvrez-le pour choisir un nouveau mot de passe."
              : "Un e-mail de confirmation vient de vous être envoyé. Ouvrez-le pour activer votre compte, puis revenez vous connecter."}
          </p>
        ) : mode === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="mt-5 flex flex-col gap-3">
            <p className="text-sm text-zinc-500">
              Entrez votre e-mail, vous recevrez un lien pour choisir un nouveau mot de passe.
            </p>
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
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 rounded-xl bg-brand-orange px-3 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {status === "loading" ? "Un instant..." : "Envoyer le lien"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className="text-sm text-zinc-500 underline"
            >
              Retour à la connexion
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            {mode === "signup" && (
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
            )}
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
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Mot de passe
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6 caractères minimum" : "••••••••"}
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-brand-orange dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-brand-orange"
              />
            </label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setErrorMessage(null);
                }}
                className="w-fit text-xs text-zinc-500 underline"
              >
                Mot de passe oublié ?
              </button>
            )}
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 rounded-xl bg-brand-orange px-3 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition-colors hover:brightness-95 disabled:opacity-50"
            >
              {status === "loading"
                ? "Un instant..."
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte"}
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
