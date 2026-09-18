"use client";

import { useTransition } from "react";
import { updateMemberRole } from "@/app/actions/profiles";
import type { UserRole } from "@/lib/types/database";

const ROLES: UserRole[] = ["runner", "coach", "admin"];

export function RoleSelect({ memberId, role }: { memberId: string; role: UserRole }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateMemberRole(memberId, e.target.value as UserRole))}
      className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-xs dark:border-zinc-700"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
