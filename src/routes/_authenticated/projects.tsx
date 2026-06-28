import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Projects"
      title="Projects"
      description="Productions, projects and deliverables."
      icon={Briefcase}
      emptyTitle="No projects yet"
      emptyDescription="Productions and projects will live here."
    />
  ),
});
