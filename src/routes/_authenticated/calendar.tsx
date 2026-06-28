import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Calendar"
      title="Calendar"
      description="Unified calendar across the agency."
      icon={Calendar}
      emptyTitle="Calendar is empty"
      emptyDescription="Events, deadlines and personal items will appear here."
    />
  ),
});
