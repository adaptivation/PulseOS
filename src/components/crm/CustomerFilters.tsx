import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CUSTOMER_STATUSES, CUSTOMER_PRIORITIES } from "@/lib/crm/constants";
import { listAllTags, listEmployees, type CustomerListFilters } from "@/lib/crm/api";

interface Props {
  filters: CustomerListFilters;
  onChange: (f: CustomerListFilters) => void;
  availableIndustries: string[];
  availableCountries: string[];
}

export function CustomerFilters({ filters, onChange, availableIndustries, availableCountries }: Props) {
  const { data: tags = [] } = useQuery({ queryKey: ["crm-tags"], queryFn: listAllTags });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });

  const toggle = <T,>(arr: T[] | undefined, v: T): T[] => {
    const set = new Set(arr ?? []);
    set.has(v) ? set.delete(v) : set.add(v);
    return Array.from(set);
  };

  const active =
    (filters.statuses?.length ?? 0) +
    (filters.priorities?.length ?? 0) +
    (filters.assignedEmployeeIds?.length ?? 0) +
    (filters.industries?.length ?? 0) +
    (filters.countries?.length ?? 0) +
    (filters.tagIds?.length ?? 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search company, email, phone, VAT, city…"
          className="pl-9"
        />
      </div>

      <FilterMenu label="Status" count={filters.statuses?.length}>
        {CUSTOMER_STATUSES.map((s) => (
          <DropdownMenuCheckboxItem
            key={s.value}
            checked={filters.statuses?.includes(s.value)}
            onCheckedChange={() => onChange({ ...filters, statuses: toggle(filters.statuses, s.value) })}
          >
            {s.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu label="Priority" count={filters.priorities?.length}>
        {CUSTOMER_PRIORITIES.map((p) => (
          <DropdownMenuCheckboxItem
            key={p.value}
            checked={filters.priorities?.includes(p.value)}
            onCheckedChange={() => onChange({ ...filters, priorities: toggle(filters.priorities, p.value) })}
          >
            {p.label}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu label="Assignee" count={filters.assignedEmployeeIds?.length}>
        {employees.length === 0 && <DropdownMenuLabel className="text-xs text-muted-foreground">No teammates</DropdownMenuLabel>}
        {employees.map((e) => (
          <DropdownMenuCheckboxItem
            key={e.id}
            checked={filters.assignedEmployeeIds?.includes(e.id)}
            onCheckedChange={() => onChange({ ...filters, assignedEmployeeIds: toggle(filters.assignedEmployeeIds, e.id) })}
          >
            {e.full_name ?? e.email ?? "Unnamed"}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu label="Industry" count={filters.industries?.length} disabled={!availableIndustries.length}>
        {availableIndustries.map((i) => (
          <DropdownMenuCheckboxItem
            key={i}
            checked={filters.industries?.includes(i)}
            onCheckedChange={() => onChange({ ...filters, industries: toggle(filters.industries, i) })}
          >
            {i}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu label="Country" count={filters.countries?.length} disabled={!availableCountries.length}>
        {availableCountries.map((c) => (
          <DropdownMenuCheckboxItem
            key={c}
            checked={filters.countries?.includes(c)}
            onCheckedChange={() => onChange({ ...filters, countries: toggle(filters.countries, c) })}
          >
            {c}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      <FilterMenu label="Tags" count={filters.tagIds?.length} disabled={!tags.length}>
        {tags.map((t) => (
          <DropdownMenuCheckboxItem
            key={t.id}
            checked={filters.tagIds?.includes(t.id)}
            onCheckedChange={() => onChange({ ...filters, tagIds: toggle(filters.tagIds, t.id) })}
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: t.color }} />
            {t.name}
          </DropdownMenuCheckboxItem>
        ))}
      </FilterMenu>

      {active > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ search: filters.search })} className="text-muted-foreground">
          <X className="mr-1 h-3.5 w-3.5" /> Clear ({active})
        </Button>
      )}
    </div>
  );
}

function FilterMenu({ label, count, children, disabled }: { label: string; count?: number; children: React.ReactNode; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="h-9 gap-1.5">
          {label}
          {count ? <span className="ml-1 rounded bg-accent/15 px-1.5 text-[10px] font-semibold text-accent">{count}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}