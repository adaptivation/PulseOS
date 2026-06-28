import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, StickyNote, Bold, Italic, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { CompanyAvatar } from "@/components/crm/Badges";
import { createNote, deleteNote, listNotes, updateNote } from "@/lib/crm/api";
import { toast } from "sonner";

type Note = Awaited<ReturnType<typeof listNotes>>[number];

export function NotesTab({ customerId }: { customerId: string }) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["notes", customerId], queryFn: () => listNotes(customerId) });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => { toast.success("Note removed"); qc.invalidateQueries({ queryKey: ["notes", customerId] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Notes</h2>
          <p className="text-xs text-muted-foreground">Rich notes, briefs and reminders. Edits keep revision history.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1 h-4 w-4" /> New note
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState icon={StickyNote} title="No notes yet" description="Capture meeting summaries, briefs and decisions." />
      ) : (
        <div className="space-y-3">
          {data.map((n) => (
            <div key={n.id} className="group border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {n.title && <div className="mb-1 font-display text-base font-semibold tracking-tight">{n.title}</div>}
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {n.author && <CompanyAvatar name={n.author.full_name ?? "?"} src={n.author.avatar_url} size={16} />}
                    <span>{n.author?.full_name ?? "Unknown"}</span>
                    <span>·</span>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(n); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    disabled={del.isPending}
                    onClick={() => { if (window.confirm("Delete this note?")) del.mutate(n.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="prose prose-invert mt-3 max-w-none text-sm" dangerouslySetInnerHTML={{ __html: n.body_html || escapeHtml(n.body_text ?? "") }} />
            </div>
          ))}
        </div>
      )}

      <NoteDialog customerId={customerId} note={editing} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NoteDialog({ customerId, note, open, onOpenChange }: { customerId: string; note: Note | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (open) { setTitle(note?.title ?? ""); setBody(note?.body_html ?? note?.body_text ?? ""); }
  }, [open, note]);

  const save = useMutation({
    mutationFn: () => {
      const stripped = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (note) return updateNote(note.id, { title: title || null, body_html: body, body_text: stripped });
      return createNote({ customer_id: customerId, title: title || null, body_html: body, body_text: stripped });
    },
    onSuccess: () => {
      toast.success(note ? "Note updated" : "Note added");
      qc.invalidateQueries({ queryKey: ["notes", customerId] });
      qc.invalidateQueries({ queryKey: ["activities", customerId] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const exec = (cmd: string) => document.execCommand(cmd, false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="border border-border">
            <div className="flex items-center gap-1 border-b border-border bg-elevated/40 px-2 py-1">
              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("bold")}><Bold className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("italic")}><Italic className="h-3.5 w-3.5" /></Button>
              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => exec("insertUnorderedList")}><List className="h-3.5 w-3.5" /></Button>
            </div>
            <div
              contentEditable
              suppressContentEditableWarning
              className="prose prose-invert min-h-[180px] max-w-none bg-card p-3 text-sm outline-none"
              dangerouslySetInnerHTML={{ __html: body }}
              onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={save.isPending} onClick={() => save.mutate()} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {save.isPending ? "Saving…" : note ? "Save changes" : "Add note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}