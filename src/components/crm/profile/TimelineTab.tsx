import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CircleDot, UserPlus, Pencil, Tag as TagIcon, StickyNote, Users, Activity } from "lucide-react";
import { listActivities } from "@/lib/crm/api";
import { ACTIVITY_LABELS } from "@/lib/crm/constants";
import { EmptyState } from "@/components/common/EmptyState";
import { CompanyAvatar } from "@/components/crm/Badges";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  customer_created: CircleDot,
  customer_updated: Pencil,
  status_changed: Activity,
  employee_assigned: UserPlus,
  contact_added: Users,
  contact_updated: Users,
  contact_removed: Users,
  note_added: StickyNote,
  note_updated: StickyNote,
  note_removed: StickyNote,
  tag_added: TagIcon,
  tag_removed: TagIcon,
};

export function TimelineTab({ customerId }: { customerId: string }) {
  const { data = [], isLoading } = useQuery({ queryKey: ["activities", customerId], queryFn: () => listActivities(customerId) });

  if (isLoading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading timeline…</div>;
  if (data.length === 0) return <EmptyState icon={Activity} title="No activity yet" description="Every change to this customer will appear here automatically." />;

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[19px] top-0 w-px bg-border" aria-hidden />
      <ol className="space-y-3">
        {data.map((a, i) => {
          const Icon = ICONS[a.activity_type] ?? CircleDot;
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
              className="relative flex gap-4 pl-0"
            >
              <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{ACTIVITY_LABELS[a.activity_type] ?? a.activity_type}</div>
                    {a.summary && <div className="mt-0.5 text-xs text-muted-foreground">{a.summary}</div>}
                  </div>
                  <div className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{relative(a.occurred_at)}</div>
                </div>
                {a.actor && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CompanyAvatar name={a.actor.full_name ?? "?"} src={a.actor.avatar_url} size={18} />
                    <span>{a.actor.full_name ?? "Unknown"}</span>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function relative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24); if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}