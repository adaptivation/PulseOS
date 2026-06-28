import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Events — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Events"
      title="Events"
      description="Live events and on-site productions."
      icon={CalendarDays}
      emptyTitle="No events scheduled"
      emptyDescription="Plan and track every live event in one place."
    />
  ),
});
