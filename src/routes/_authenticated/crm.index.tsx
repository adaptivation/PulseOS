import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { CustomerFilters } from "@/components/crm/CustomerFilters";
import { CustomerTable } from "@/components/crm/CustomerTable";
import { CustomerDrawer } from "@/components/crm/CustomerDrawer";
import { CustomerFormDialog } from "@/components/crm/CustomerFormDialog";
import { BulkActionsBar } from "@/components/crm/BulkActionsBar";
import { listCustomers, type CustomerListFilters, type CustomerWithExtras, type Customer } from "@/lib/crm/api";

export const Route = createFileRoute("/_authenticated/crm/")({
  head: () => ({ meta: [{ title: "Customers — PULSE OS" }] }),
  component: CrmList,
});

function CrmList() {
  const [filters, setFilters] = useState<CustomerListFilters>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<CustomerWithExtras | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers", filters],
    queryFn: () => listCustomers(filters),
    placeholderData: (p) => p,
  });
  const rows = data ?? [];

  const industries = useMemo(() => unique(rows.map((r) => r.industry)).filter(Boolean) as string[], [rows]);
  const countries = useMemo(() => unique(rows.map((r) => r.country)).filter(Boolean) as string[], [rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.status === "active").length;
    const leads = rows.filter((r) => r.status === "lead" || r.status === "prospect").length;
    const overdue = rows.filter((r) => r.next_follow_up_at && new Date(r.next_follow_up_at) < new Date()).length;
    return { total, active, leads, overdue };
  }, [rows]);

  const handleExport = () => {
    const ids = Array.from(selected);
    const subset = rows.filter((r) => ids.includes(r.id));
    const csv = toCsv(subset);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `customers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${subset.length} customers`);
  };

  const hasFilters = !!(filters.search || filters.statuses?.length || filters.priorities?.length || filters.tagIds?.length || filters.assignedEmployeeIds?.length || filters.industries?.length || filters.countries?.length);

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Every relationship across PULSE Visuals — companies, contacts and the work that flows from them."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-1 h-4 w-4" /> New customer
          </Button>
        }
      />

      <div className="px-6 py-8 sm:px-10">
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total customers" value={String(stats.total)} icon={Users} index={0} />
          <StatCard label="Active" value={String(stats.active)} index={1} />
          <StatCard label="Leads & prospects" value={String(stats.leads)} index={2} />
          <StatCard label="Follow-ups overdue" value={String(stats.overdue)} index={3} />
        </div>

        <div className="mt-8 space-y-4">
          <CustomerFilters filters={filters} onChange={setFilters} availableIndustries={industries} availableCountries={countries} />

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading customers…</div>
          ) : rows.length === 0 && !hasFilters ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Start by adding your first customer. Contacts, projects and revenue will live in this profile."
              action={
                <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-1 h-4 w-4" /> Add customer
                </Button>
              }
            />
          ) : (
            <CustomerTable
              rows={rows}
              selected={selected}
              onSelectedChange={setSelected}
              onRowClick={(r) => setDrawer(r)}
              onEdit={(r) => { setEditing(r); setFormOpen(true); }}
            />
          )}
          {isFetching && !isLoading && <div className="text-xs text-muted-foreground">Refreshing…</div>}
        </div>
      </div>

      <CustomerDrawer
        customer={drawer}
        open={!!drawer}
        onOpenChange={(v) => !v && setDrawer(null)}
        onEdit={() => { if (drawer) { setEditing(drawer); setFormOpen(true); setDrawer(null); } }}
      />
      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editing} />
      <BulkActionsBar ids={Array.from(selected)} onClear={() => setSelected(new Set())} onExport={handleExport} />
    </div>
  );
}

function unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function toCsv(rows: CustomerWithExtras[]): string {
  const headers = ["company_name","status","priority","industry","email","phone","website","vat_number","country","city","assigned_to","tags","created_at"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      r.company_name, r.status, r.priority, r.industry, r.email, r.phone, r.website, r.vat_number,
      r.country, r.city, r.assigned_employee?.full_name ?? "", r.tags.map((t) => t.name).join("|"), r.created_at,
    ].map(esc).join(","));
  }
  return lines.join("\n");
}