import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Analytics"
      title="Analytics"
      description="Real-time business intelligence."
      icon={BarChart3}
      emptyTitle="No analytics yet"
      emptyDescription="KPIs and reports will be visualized here."
    />
  ),
});
