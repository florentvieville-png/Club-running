"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createShopItem, type ShopItemState } from "@/app/actions/shop";

const initialState: ShopItemState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 hover:brightness-95"
    >
      {pending ? "Ajout..." : "Ajouter l'article"}
    </button>
  );
}

export function ShopItemForm() {
  const [state, formAction] = useActionState(createShopItem, initialState);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <input
        name="name"
        placeholder="Nom de l'article (ex : Tee-shirt technique)"
        required
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        name="description"
        placeholder="Description, tailles disponibles..."
        rows={2}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        name="price_label"
        placeholder="Prix indicatif (ex : 15 €) — informatif uniquement"
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        Photo (optionnel)
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Aperçu" className="h-32 w-full rounded-lg object-cover" />
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
