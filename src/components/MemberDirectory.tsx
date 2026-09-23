"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { RoleSelect } from "@/components/RoleSelect";
import { DeleteMemberButton } from "@/components/DeleteMemberButton";
import { SearchIcon } from "@/components/icons";
import type { Profile } from "@/lib/types/database";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  coach: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  runner: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300",
};

export function MemberDirectory({
  members,
  currentUserId,
  isAdmin,
}: {
  members: Profile[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) || (m.pace_group ?? "").toLowerCase().includes(q)
    );
  }, [members, query]);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Annuaire des adhérents</h2>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full rounded-xl border border-zinc-300 py-2.5 pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <p className="text-sm text-zinc-500">
        {filtered.length} membre{filtered.length > 1 ? "s" : ""}
      </p>

      <div className="flex flex-col divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-zinc-400">Aucun membre ne correspond à cette recherche.</p>
        )}
        {filtered.map((member) => (
          <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <Avatar name={member.full_name} size={44} />
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                {member.pace_group && <p className="text-xs text-zinc-500">{member.pace_group}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGE[member.role]}`}>
                {member.role}
              </span>
              {isAdmin && member.id !== currentUserId && (
                <>
                  <RoleSelect memberId={member.id} role={member.role} />
                  <DeleteMemberButton memberId={member.id} memberName={member.full_name} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
