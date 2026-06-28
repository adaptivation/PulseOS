import { type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function ModulePlaceholder({ eyebrow, title, description, icon, emptyTitle, emptyDescription }: Props) {
  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="px-6 py-10 sm:px-10">
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </div>
    </div>
  );
}