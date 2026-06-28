import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Finance"
      title="Finance"
      description="Quotes, invoices, expenses and revenue."
      icon={Wallet}
      emptyTitle="Finance is empty"
      emptyDescription="Quotes, invoices and expenses will appear here."
    />
  ),
});
