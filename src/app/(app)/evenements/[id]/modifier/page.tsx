import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { EventForm } from "@/components/EventForm";
import type { ClubEvent } from "@/lib/types/database";

export default async function EditEventPage(props: PageProps<"/evenements/[id]/modifier">) {
  const { id } = await props.params;
  const current = await getCurrentProfile();
  if (!current) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const event = data as ClubEvent;
  const isReviewer = current.profile.role === "admin" || current.profile.role === "coach";
  if (event.created_by !== current.userId && !isReviewer) {
    redirect(`/evenements/${id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Modifier l&apos;événement</h1>
      <EventForm event={event} />
    </div>
  );
}
