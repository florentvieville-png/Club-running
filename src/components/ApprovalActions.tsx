"use client";

import { useState, useTransition } from "react";
import { approveEvent, rejectEvent } from "@/app/actions/events";
import type { UserRole } from "@/lib/types/database";

export function ApprovalActions({
  eventId,
  role,
  adminApproved,
  coachApproved,
}: {
  eventId: string;
  role: UserRole;
  adminApproved: boolean;
  coachApproved: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const alreadyApprovedByMe = role === "admin" ? adminApproved : coachApproved;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
      <p className="font-medium text-amber-900 dark:text-amber-200">
        Validation {role === "admin" ? "admin" : "coach"} :{" "}
        {alreadyApprovedByMe ? "déjà validé par vous" : "en attente de votre décision"}
      </p>
      <p className="text-xs text-amber-800 dark:text-amber-300">
        Admin : {adminApproved ? "✅ validé" : "⏳ en attente"} · Coach :{" "}
        {coachApproved ? "✅ validé" : "⏳ en attente"}
      </p>

      {!alreadyApprovedByMe && !showReject && (
        <div className="flex gap-2">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveEvent(eventId))}
            className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Valider
          </button>
          <button
            disabled={isPending}
            onClick={() => setShowReject(true)}
            className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Refuser
          </button>
        </div>
      )}

      {showReject && (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus (optionnel)"
            className="rounded-lg border border-amber-300 px-3 py-2 text-sm dark:border-amber-800 dark:bg-zinc-900"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              disabled={isPending}
              onClick={() => startTransition(() => rejectEvent(eventId, reason))}
              className="rounded-lg bg-red-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Confirmer le refus
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm dark:bg-zinc-800"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
