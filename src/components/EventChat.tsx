"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventMessageWithAuthor } from "@/lib/types/database";

export function EventChat({
  eventId,
  currentUserId,
}: {
  eventId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<EventMessageWithAuthor[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      const { data } = await supabase
        .from("event_messages")
        .select("*, author:profiles(id, full_name)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (active) {
        setMessages((data ?? []) as unknown as EventMessageWithAuthor[]);
        setLoading(false);
      }
    }

    loadMessages();

    const channel = supabase
      .channel(`event-chat-${eventId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "event_messages", filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const { data: author } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", payload.new.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...(payload.new as EventMessageWithAuthor), author: author ?? null },
          ]);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSending(true);
    const { error } = await supabase
      .from("event_messages")
      .insert({ event_id: eventId, user_id: currentUserId, content: trimmed });

    if (!error) setContent("");
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-4">
        {loading && <p className="text-sm text-zinc-400">Chargement des messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-zinc-400">
            Aucun message pour l&apos;instant. Lancez la discussion !
          </p>
        )}
        {messages.map((message) => {
          const isMine = message.user_id === currentUserId;
          return (
            <div key={message.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <span className="text-xs text-zinc-400">
                {message.author?.full_name ?? "Membre"} ·{" "}
                {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <p
                className={`mt-0.5 max-w-[80%] rounded-2xl px-3 py-1.5 text-sm ${
                  isMine
                    ? "bg-blue-700 text-white dark:bg-blue-600"
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                {message.content}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
