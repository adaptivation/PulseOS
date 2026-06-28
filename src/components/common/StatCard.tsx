import { motion } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  index?: number;
}

export function StatCard({ label, value, delta, icon: Icon, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden border border-border bg-card p-5 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs",
            delta.positive ? "text-success" : "text-destructive",
          )}
        >
          {delta.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{delta.value}</span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );
}