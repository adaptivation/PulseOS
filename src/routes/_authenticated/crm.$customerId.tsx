import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Globe, Mail, MapPin, Pencil, Phone, Building2,
  Activity, Users, StickyNote, FolderKanban, Calendar, Receipt,
  FileText, Wallet, Folder, BarChart3, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Archive, Trash2, RotateCcw, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyAvatar, PriorityBadge, StatusBadge, TagPill } from "@/components/crm/Badges";
import { CustomerFormDialog } from "@/components/crm/CustomerFormDialog";
import { ContactsTab } from "@/components/crm/profile/ContactsTab";
import { TimelineTab } from "@/components/crm/profile/TimelineTab";
import { NotesTab } from "@/components/crm/profile/NotesTab";
import {
  getCustomer, getStatistics, archiveCustomers, restoreCustomers,
  deleteCustomers, duplicateCustomer,
} from "@/lib/crm/api";

export const Route = createFileRoute("/_authenticated/crm/$customerId")({
  head: () => ({ meta: [{ title: "Customer — PULSE OS" }] }),
  component: CustomerProfile,
});

function CustomerProfile() {
  const { customerId } = useParams({ from: "/_authenticated/crm/$customerId" });
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => getCustomer(customerId),
  });
  const { data: stats } = useQuery({
    queryKey: ["customer-stats", customerId],
    queryFn: () => getStatistics(customerId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["customer", customerId] });
    qc.invalidateQueries({ queryKey: ["customers"] });
  };
  const mArchive = useMutation({
    mutationFn: () => archiveCustomers([customerId]),
    onSuccess: () => { toast.success("Customer archived"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mRestore = useMutation({
    mutationFn: () => restoreCustomers([customerId]),
    onSuccess: () => { toast.success("Customer restored"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mDuplicate = useMutation({
    mutationFn: () => duplicateCustomer(customerId),
    onSuccess: (c) => { toast.success("Customer duplicated"); invalidate(); navigate({ to: "/crm/$customerId", params: { customerId: c.id } }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mDelete = useMutation({
    mutationFn: () => deleteCustomers([customerId]),
    onSuccess: () => { toast.success("Customer deleted"); invalidate(); navigate({ to: "/crm" }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !customer) {
    return (
      <div className="space-y-6 px-6 py-10 sm:px-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border px-6 py-8 sm:px-10"
      >
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 px-2">
            <Link to="/crm"><ArrowLeft className="h-3.5 w-3.5" /> Customers</Link>
          </Button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-5">
            <CompanyAvatar name={customer.company_name} src={customer.company_logo_url} size={72} />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StatusBadge value={customer.status} />
                <PriorityBadge value={customer.priority} />
                {customer.industry && (
                  <span className="border border-border bg-elevated px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{customer.industry}</span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{customer.company_name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {customer.website && <a className="inline-flex items-center gap-1.5 hover:text-accent" href={customer.website} target="_blank" rel="noreferrer"><Globe className="h-3 w-3" />{customer.website.replace(/^https?:\/\//, "")}</a>}
                {customer.email && <a className="inline-flex items-center gap-1.5 hover:text-accent" href={`mailto:${customer.email}`}><Mail className="h-3 w-3" />{customer.email}</a>}
                {customer.phone && <a className="inline-flex items-center gap-1.5 hover:text-accent" href={`tel:${customer.phone}`}><Phone className="h-3 w-3" />{customer.phone}</a>}
                {(customer.city || customer.country) && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />{[customer.city, customer.country].filter(Boolean).join(", ")}</span>}
              </div>
              {customer.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">{customer.tags.map((t) => <TagPill key={t.id} name={t.name} color={t.color} />)}</div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="More actions"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => mDuplicate.mutate()} disabled={mDuplicate.isPending}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  {customer.deleted_at ? (
                    <DropdownMenuItem onClick={() => mRestore.mutate()} disabled={mRestore.isPending}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => mArchive.mutate()} disabled={mArchive.isPending}>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete permanently
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid grid-cols-3 gap-px overflow-hidden border border-border bg-border">
              <Counter label="Projects" value={stats?.projects_count ?? 0} />
              <Counter label="Events" value={stats?.events_count ?? 0} />
              <Counter label="Health" value={stats?.health_score ?? "—"} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-6 py-6 sm:px-10">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent">
            <Tab value="overview" icon={Building2}>Overview</Tab>
            <Tab value="contacts" icon={Users}>Contacts</Tab>
            <Tab value="timeline" icon={Activity}>Timeline</Tab>
            <Tab value="notes" icon={StickyNote}>Notes</Tab>
            <Tab value="statistics" icon={BarChart3}>Statistics</Tab>
            <Tab value="projects" icon={FolderKanban} disabled>Projects</Tab>
            <Tab value="events" icon={Calendar} disabled>Events</Tab>
            <Tab value="invoices" icon={Receipt} disabled>Invoices</Tab>
            <Tab value="quotes" icon={FileText} disabled>Quotes</Tab>
            <Tab value="expenses" icon={Wallet} disabled>Expenses</Tab>
            <Tab value="files" icon={Folder} disabled>Files</Tab>
            <Tab value="history" icon={History} disabled>History</Tab>
          </TabsList>

          <TabsContent value="overview" className="mt-6"><Overview customer={customer} stats={stats} /></TabsContent>
          <TabsContent value="contacts" className="mt-6"><ContactsTab customerId={customer.id} /></TabsContent>
          <TabsContent value="timeline" className="mt-6"><TimelineTab customerId={customer.id} /></TabsContent>
          <TabsContent value="notes" className="mt-6"><NotesTab customerId={customer.id} /></TabsContent>
          <TabsContent value="statistics" className="mt-6"><Statistics stats={stats} /></TabsContent>
        </Tabs>
      </div>

      <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <b>{customer.company_name}</b> and all related contacts, notes and activity. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => mDelete.mutate()}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Tab({ value, icon: Icon, children, disabled }: { value: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; disabled?: boolean }) {
  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      className="h-9 gap-1.5 rounded-none border border-transparent bg-transparent px-3 text-xs text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </TabsTrigger>
  );
}

function Counter({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card p-3 text-right">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

type Stats = Awaited<ReturnType<typeof getStatistics>> | undefined;

function Overview({ customer, stats }: { customer: Awaited<ReturnType<typeof getCustomer>>; stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title="Company">
          <Detail label="Type" value={customer.company_type} />
          <Detail label="Industry" value={customer.industry} />
          <Detail label="Lead source" value={customer.lead_source} />
          <Detail label="Website" value={customer.website} link={customer.website ?? undefined} />
          <Detail label="VAT" value={customer.vat_number} />
          <Detail label="Tax office" value={customer.tax_office} />
        </Card>
        <Card title="Location">
          <Detail label="Country" value={customer.country} />
          <Detail label="City" value={customer.city} />
          <Detail label="Address" value={customer.address} />
          <Detail label="Postal code" value={customer.postal_code} />
        </Card>
        {customer.internal_notes && (
          <Card title="Internal notes">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{customer.internal_notes}</p>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <Card title="Lifecycle">
          <Detail label="Status" value={customer.status} />
          <Detail label="Priority" value={customer.priority} />
          <Detail label="Assignee" value={customer.assigned_employee?.full_name ?? "Unassigned"} />
          <Detail label="Customer since" value={customer.customer_since} />
          <Detail label="Last contact" value={customer.last_contact_at && new Date(customer.last_contact_at).toLocaleString()} />
          <Detail label="Next follow up" value={customer.next_follow_up_at && new Date(customer.next_follow_up_at).toLocaleString()} />
          <Detail label="Created" value={new Date(customer.created_at).toLocaleString()} />
          <Detail label="Updated" value={new Date(customer.updated_at).toLocaleString()} />
        </Card>
        <Card title="At a glance">
          <Detail label="Lifetime revenue" value={fmt(stats?.lifetime_revenue)} />
          <Detail label="Outstanding balance" value={fmt(stats?.outstanding_balance)} />
          <Detail label="Paid invoices" value={stats?.paid_invoices ?? 0} />
          <Detail label="Pending invoices" value={stats?.pending_invoices ?? 0} />
          <Detail label="Avg invoice value" value={fmt(stats?.average_invoice_value)} />
        </Card>
      </div>
    </div>
  );
}

function Statistics({ stats }: { stats: Stats }) {
  const items = [
    { label: "Lifetime revenue", value: fmt(stats?.lifetime_revenue) },
    { label: "Outstanding balance", value: fmt(stats?.outstanding_balance) },
    { label: "Paid invoices", value: stats?.paid_invoices ?? 0 },
    { label: "Pending invoices", value: stats?.pending_invoices ?? 0 },
    { label: "Avg invoice value", value: fmt(stats?.average_invoice_value) },
    { label: "Projects", value: stats?.projects_count ?? 0 },
    { label: "Events", value: stats?.events_count ?? 0 },
    { label: "Health score", value: stats?.health_score ?? "—" },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
      {items.map((i, idx) => (
        <motion.div key={i.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className="bg-card p-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{i.label}</div>
          <div className="mt-3 font-display text-2xl font-bold tabular-nums">{i.value as string | number}</div>
        </motion.div>
      ))}
      <div className="bg-card p-5 text-xs text-muted-foreground md:col-span-4">Financial metrics aggregate automatically once the Finance module is connected.</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <div className="space-y-2 p-4">{children}</div>
    </div>
  );
}

function Detail({ label, value, link }: { label: string; value: React.ReactNode; link?: string }) {
  const v = value === null || value === undefined || value === "" ? "—" : value;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      {link ? (
        <a className="truncate text-xs text-foreground hover:text-accent" href={link} target="_blank" rel="noreferrer">{v}</a>
      ) : (
        <span className="truncate text-xs text-foreground">{v}</span>
      )}
    </div>
  );
}

function fmt(n: number | null | undefined) {
  if (n == null) return "—";
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(n)); }
  catch { return String(n); }
}