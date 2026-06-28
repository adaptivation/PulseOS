import { createFileRoute } from "@tanstack/react-router";
import { FolderTree } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/files")({
  head: () => ({ meta: [{ title: "Files — PULSE OS" }] }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Files"
      title="Files"
      description="Folders, assets, documents and secure shares."
      icon={FolderTree}
      emptyTitle="File manager coming soon"
      emptyDescription="Folders, assets and documents will be organised here."
    />
  ),
});
