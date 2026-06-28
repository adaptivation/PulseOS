import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Settings"
      title="Settings"
      description="Workspace, integrations and security."
      icon={Settings}
      emptyTitle="Settings"
      emptyDescription="Workspace, billing and integration settings."
    />
  ),
});
