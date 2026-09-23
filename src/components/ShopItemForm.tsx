"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createShopItem, type ShopItemState } from "@/app/actions/shop";
import { resizeImageFile } from "@/lib/resizeImage";

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

function ImageField() {
  const [preview, setPreview] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    setResizing(true);
    const resized = await resizeImageFile(file);
    setResizing(false);

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(resized);
      fileInputRef.current.files = dt.files;
    }
    setPreview(URL.createObjectURL(resized));
  }

  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        Photo (optionnel)
        <input
          ref={fileInputRef}
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {resizing && <p className="text-xs text-zinc-400">Optimisation de la photo...</p>}
      {preview && (
        <div className="h-32 w-32 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
        </div>
      )}
    </>
  );
}

export function ShopItemForm() {
  const [state, formAction] = useActionState(createShopItem, initialState);

  return (
    <form
      key={state.ok ?? 0}
      action={formAction}
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
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
      <ImageField />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
