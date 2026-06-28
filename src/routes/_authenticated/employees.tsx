import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Employees"
      title="Employees"
      description="Team members, roles and permissions."
      icon={UserCog}
      emptyTitle="No team data"
      emptyDescription="Team members and roles will appear here."
    />
  ),
});
