import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpDown, ChevronDown, ChevronUp, ExternalLink, MoreHorizontal, Settings2, Copy, Archive, RotateCcw, Trash2, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityBadge, TagPill, CompanyAvatar } from "./Badges";
import {
  archiveCustomers, restoreCustomers, deleteCustomers, duplicateCustomer,
  type CustomerWithExtras,
} from "@/lib/crm/api";

type SortKey = "company_name" | "status" | "priority" | "industry" | "country" | "last_contact_at" | "created_at";
type SortDir = "asc" | "desc";

interface Column {
  key: string;
  label: string;
  defaultVisible: boolean;
  sortable?: SortKey;
  width?: string;
}

const COLUMNS: Column[] = [
  { key: "company_name", label: "Company", defaultVisible: true, sortable: "company_name", width: "minmax(260px,1.4fr)" },
  { key: "status", label: "Status", defaultVisible: true, sortable: "status", width: "140px" },
  { key: "priority", label: "Priority", defaultVisible: true, sortable: "priority", width: "110px" },
  { key: "industry", label: "Industry", defaultVisible: true, sortable: "industry", width: "140px" },
  { key: "assignee", label: "Assignee", defaultVisible: true, width: "180px" },
  { key: "country", label: "Location", defaultVisible: true, sortable: "country", width: "150px" },
  { key: "tags", label: "Tags", defaultVisible: true, width: "minmax(160px,1fr)" },
  { key: "last_contact_at", label: "Last contact", defaultVisible: false, sortable: "last_contact_at", width: "150px" },
  { key: "created_at", label: "Created", defaultVisible: true, sortable: "created_at", width: "140px" },
];

interface Props {
  rows: CustomerWithExtras[];
  selected: Set<string>;
  onSelectedChange: (s: Set<string>) => void;
  onRowClick: (c: CustomerWithExtras) => void;
  onEdit: (c: CustomerWithExtras) => void;
}

export function CustomerTable({ rows, selected, onSelectedChange, onRowClick, onEdit }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.key, c.defaultVisible])),
  );
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [confirmDelete, setConfirmDelete] = useState<CustomerWithExtras | null>(null);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["customers"] });
  const mDuplicate = useMutation({
    mutationFn: (id: string) => duplicateCustomer(id),
    onSuccess: () => { toast.success("Customer duplicated"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mArchive = useMutation({
    mutationFn: (id: string) => archiveCustomers([id]),
    onSuccess: () => { toast.success("Customer archived"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mRestore = useMutation({
    mutationFn: (id: string) => restoreCustomers([id]),
    onSuccess: () => { toast.success("Customer restored"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const mDelete = useMutation({
    mutationFn: (id: string) => deleteCustomers([id]),
    onSuccess: () => { toast.success("Customer deleted"); invalidate(); setConfirmDelete(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const sorted = useMemo(() => {
    const a = [...rows];
    a.sort((x, y) => {
      const av = (x as never as Record<string, unknown>)[sortKey];
      const bv = (y as never as Record<string, unknown>)[sortKey];
      const as = av == null ? "" : String(av);
      const bs = bv == null ? "" : String(bv);
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return a;
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
    else pageRows.forEach((r) => next.add(r.id));
    onSelectedChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectedChange(next);
  };

  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const visibleCols = COLUMNS.filter((c) => visible[c.key]);
  const gridTemplate = `40px ${visibleCols.map((c) => c.width ?? "1fr").join(" ")} 48px`;

  return (
    <div className="border border-border bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-xs text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? "customer" : "customers"}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5"><Settings2 className="h-3.5 w-3.5" /> Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLUMNS.map((c) => (
              <DropdownMenuCheckboxItem
                key={c.key}
                checked={visible[c.key]}
                onCheckedChange={(v) => setVisible((p) => ({ ...p, [c.key]: !!v }))}
              >
                {c.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header (sticky) */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="grid items-center gap-3 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground" style={{ gridTemplateColumns: gridTemplate }}>
          <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} aria-label="Select all" />
          {visibleCols.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => c.sortable && setSort(c.sortable)}
              className={cn("flex items-center gap-1.5 truncate text-left", c.sortable && "hover:text-foreground")}
            >
              {c.label}
              {c.sortable && sortKey === c.sortable && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
              {c.sortable && sortKey !== c.sortable && <ArrowUpDown className="h-3 w-3 opacity-30" />}
            </button>
          ))}
          <span />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {pageRows.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
            className={cn(
              "group grid cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-elevated/60",
              selected.has(r.id) && "bg-elevated/40",
            )}
            style={{ gridTemplateColumns: gridTemplate }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-stop]")) return;
              onRowClick(r);
            }}
          >
            <div data-stop onClick={(e) => e.stopPropagation()}>
              <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} aria-label="Select" />
            </div>
            {visibleCols.map((c) => (
              <Cell key={c.key} colKey={c.key} row={r} />
            ))}
            <div data-stop onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/crm/$customerId" params={{ customerId: r.id }}>
                      <ExternalLink className="mr-2 h-4 w-4" /> Open profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(r)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => mDuplicate.mutate(r.id)} disabled={mDuplicate.isPending}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  {r.deleted_at ? (
                    <DropdownMenuItem onClick={() => mRestore.mutate(r.id)} disabled={mRestore.isPending}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => mArchive.mutate(r.id)} disabled={mArchive.isPending}>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setConfirmDelete(r)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
        {pageRows.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">No customers match these filters.</div>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div>Page {page} of {pageCount}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <b>{confirmDelete?.company_name}</b> and all related contacts, notes and activity. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && mDelete.mutate(confirmDelete.id)}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Cell({ colKey, row }: { colKey: string; row: CustomerWithExtras }) {
  switch (colKey) {
    case "company_name":
      return (
        <div className="flex min-w-0 items-center gap-3">
          <CompanyAvatar name={row.company_name} src={row.company_logo_url} size={32} />
          <div className="min-w-0">
            <div className="truncate font-medium">{row.company_name}</div>
            <div className="truncate text-xs text-muted-foreground">{row.email ?? row.website ?? "—"}</div>
          </div>
        </div>
      );
    case "status": return <StatusBadge value={row.status} />;
    case "priority": return <PriorityBadge value={row.priority} />;
    case "industry": return <span className="truncate text-muted-foreground">{row.industry ?? "—"}</span>;
    case "assignee":
      return row.assigned_employee ? (
        <div className="flex min-w-0 items-center gap-2">
          <CompanyAvatar name={row.assigned_employee.full_name ?? "?"} src={row.assigned_employee.avatar_url} size={22} />
          <span className="truncate text-xs">{row.assigned_employee.full_name ?? "—"}</span>
        </div>
      ) : <span className="text-muted-foreground">Unassigned</span>;
    case "country":
      return <span className="truncate text-xs text-muted-foreground">{[row.city, row.country].filter(Boolean).join(", ") || "—"}</span>;
    case "tags":
      return (
        <div className="flex min-w-0 flex-wrap gap-1">
          {row.tags.slice(0, 3).map((t) => <TagPill key={t.id} name={t.name} color={t.color} />)}
          {row.tags.length > 3 && <span className="text-xs text-muted-foreground">+{row.tags.length - 3}</span>}
        </div>
      );
    case "last_contact_at":
      return <span className="text-xs text-muted-foreground">{row.last_contact_at ? new Date(row.last_contact_at).toLocaleDateString() : "—"}</span>;
    case "created_at":
      return <span className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>;
    default: return null;
  }
}