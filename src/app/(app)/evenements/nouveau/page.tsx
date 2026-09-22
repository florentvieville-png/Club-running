import { EventForm } from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Proposer un événement</h1>
      <EventForm />
    </div>
  );
}
