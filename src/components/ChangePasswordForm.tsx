"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setStatus("idle");
      setError(updateError.message);
      return;
    }

    setStatus("done");
    setPassword("");
    setConfirm("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-fit text-sm font-medium text-brand-blue-dark underline dark:text-blue-300"
      >
        Changer mon mot de passe
      </button>
    );
  }

  if (status === "done") {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
        ✅ Mot de passe mis à jour.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        Nouveau mot de passe
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="6 caractères minimum"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Confirmer le mot de passe
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 hover:brightness-95"
        >
          {status === "loading" ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
