import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, RotateCcw, Trash2, UserCog, Tag as TagIcon, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CUSTOMER_STATUSES } from "@/lib/crm/constants";
import {
  archiveCustomers, restoreCustomers, deleteCustomers, bulkAssignEmployee,
  bulkChangeStatus, bulkApplyTags, listAllTags, listEmployees, type Customer,
} from "@/lib/crm/api";

interface Props {
  ids: string[];
  onClear: () => void;
  onExport: () => void;
}

export function BulkActionsBar({ ids, onClear, onExport }: Props) {
  const qc = useQueryClient();
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });
  const { data: tags = [] } = useQuery({ queryKey: ["crm-tags"], queryFn: listAllTags });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["customers"] });

  const wrap = (label: string, fn: () => Promise<void>) =>
    useMutation({
      mutationFn: fn,
      onSuccess: () => { toast.success(label); invalidate(); onClear(); },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Action failed"),
    });

  const mArchive = wrap("Archived", () => archiveCustomers(ids));
  const mRestore = wrap("Restored", () => restoreCustomers(ids));
  const mDelete = wrap("Deleted", () => deleteCustomers(ids));

  const assign = useMutation({
    mutationFn: (id: string | null) => bulkAssignEmployee(ids, id),
    onSuccess: () => { toast.success("Assignee updated"); invalidate(); onClear(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const status = useMutation({
    mutationFn: (s: Customer["status"]) => bulkChangeStatus(ids, s),
    onSuccess: () => { toast.success("Status updated"); invalidate(); onClear(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const tag = useMutation({
    mutationFn: (tagId: string) => bulkApplyTags(ids, [tagId]),
    onSuccess: () => { toast.success("Tag applied"); invalidate(); onClear(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit max-w-[95vw] items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-elevated backdrop-blur"
        >
          <div className="flex items-center gap-2 px-1 text-sm">
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">{ids.length}</span>
            <span className="text-muted-foreground">selected</span>
          </div>
          <div className="h-5 w-px bg-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5"><UserCog className="h-3.5 w-3.5" /> Assign <ChevronDown className="h-3 w-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Assign to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => assign.mutate(null)}>Unassigned</DropdownMenuItem>
              {employees.map((e) => (
                <DropdownMenuItem key={e.id} onClick={() => assign.mutate(e.id)}>{e.full_name ?? e.email}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5">Status <ChevronDown className="h-3 w-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {CUSTOMER_STATUSES.map((s) => (
                <DropdownMenuItem key={s.value} onClick={() => status.mutate(s.value)}>{s.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-1.5"><TagIcon className="h-3.5 w-3.5" /> Tag <ChevronDown className="h-3 w-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 overflow-y-auto">
              {tags.length === 0 && <DropdownMenuLabel className="text-xs text-muted-foreground">No tags yet</DropdownMenuLabel>}
              {tags.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => tag.mutate(t.id)}>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: t.color }} />{t.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" variant="ghost" onClick={() => mArchive.mutate()}><Archive className="mr-1.5 h-3.5 w-3.5" /> Archive</Button>
          <Button size="sm" variant="ghost" onClick={() => mRestore.mutate()}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Restore</Button>
          <Button size="sm" variant="ghost" onClick={onExport}>Export</Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => {
            if (confirm(`Permanently delete ${ids.length} customer(s)? Admins only.`)) mDelete.mutate();
          }}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>

          <div className="h-5 w-px bg-border" />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClear}><X className="h-4 w-4" /></Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}