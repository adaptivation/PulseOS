import { cn } from "@/lib/utils";
import { CUSTOMER_STATUSES, CUSTOMER_PRIORITIES, type CustomerStatus, type CustomerPriority } from "@/lib/crm/constants";

export function StatusBadge({ value, className }: { value: CustomerStatus; className?: string }) {
  const meta = CUSTOMER_STATUSES.find((s) => s.value === value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        meta?.tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta?.label ?? value}
    </span>
  );
}

export function PriorityBadge({ value, className }: { value: CustomerPriority; className?: string }) {
  const meta = CUSTOMER_PRIORITIES.find((p) => p.value === value);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        meta?.tone,
        className,
      )}
    >
      {meta?.label ?? value}
    </span>
  );
}

export function TagPill({ name, color, onRemove }: { name: string; color: string; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        borderColor: color + "55",
        backgroundColor: color + "18",
        color: "#fff",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {name}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-muted-foreground hover:text-foreground" aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}

export function CompanyAvatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={{ width: size, height: size }}
      className="shrink-0 rounded-md border border-border object-cover"
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="shrink-0 grid place-items-center rounded-md border border-border bg-elevated font-display font-semibold text-muted-foreground"
    >
      {initials || "·"}
    </div>
  );
}