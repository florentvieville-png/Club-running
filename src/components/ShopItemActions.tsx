"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateShopItem, deleteShopItem } from "@/app/actions/shop";
import { resizeImageFile } from "@/lib/resizeImage";
import { PencilIcon, TrashIcon } from "@/components/icons";
import type { ShopItem } from "@/lib/types/database";

function EditForm({ item, onDone }: { item: ShopItem; onDone: () => void }) {
  const [preview, setPreview] = useState<string | null>(item.image_url);
  const [resizing, setResizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateShopItem(item.id, {}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
      <input
        name="name"
        defaultValue={item.name}
        required
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      <textarea
        name="description"
        defaultValue={item.description ?? ""}
        rows={2}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        name="price_label"
        defaultValue={item.price_label ?? ""}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
      />
      <input
        ref={fileInputRef}
        name="image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-xs"
      />
      {resizing && <p className="text-xs text-zinc-400">Optimisation...</p>}
      {preview && (
        <div className="h-20 w-20 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
        </div>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:brightness-95"
        >
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs dark:bg-zinc-800"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export function ShopItemActions({ item }: { item: ShopItem }) {
  const [mode, setMode] = useState<"idle" | "edit" | "delete">("idle");
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (mode === "idle") {
    return (
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setMode("edit")}
          aria-label="Modifier"
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          aria-label="Supprimer"
          className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await deleteShopItem(item.id);
                } catch (err) {
                  setDeleteError(err instanceof Error ? err.message : "Erreur");
                }
              })
            }
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            {isPending ? "..." : "Supprimer ?"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="rounded-lg bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
          >
            Annuler
          </button>
        </div>
        {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
      </div>
    );
  }

  return <EditForm item={item} onDone={() => setMode("idle")} />;
}
