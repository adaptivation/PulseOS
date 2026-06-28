import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Mail, Phone, Smartphone, Linkedin, Cake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CompanyAvatar } from "@/components/crm/Badges";
import { EmptyState } from "@/components/common/EmptyState";
import { COMMUNICATION_CHANNELS } from "@/lib/crm/constants";
import { deleteContact, listContacts, upsertContact, type CustomerContact } from "@/lib/crm/api";
import { toast } from "sonner";

export function ContactsTab({ customerId }: { customerId: string }) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["contacts", customerId], queryFn: () => listContacts(customerId) });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerContact | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => { toast.success("Contact removed"); qc.invalidateQueries({ queryKey: ["contacts", customerId] }); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Contacts</h2>
          <p className="text-xs text-muted-foreground">People you work with at this company.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-1 h-4 w-4" /> Add contact
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : data.length === 0 ? (
        <EmptyState icon={Mail} title="No contacts yet" description="Add your first contact person at this company." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.map((c) => (
            <div key={c.id} className="group relative border border-border bg-card p-4 transition-colors hover:border-border-strong">
              <div className="flex items-start gap-3">
                <CompanyAvatar name={c.full_name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-medium">{c.full_name}</div>
                    {c.is_primary && <Star className="h-3.5 w-3.5 fill-accent text-accent" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{[c.job_position, c.department].filter(Boolean).join(" · ") || "—"}</div>
                  <div className="mt-3 space-y-1 text-xs">
                    {c.email && <Info icon={Mail}><a className="hover:text-accent" href={`mailto:${c.email}`}>{c.email}</a></Info>}
                    {c.phone && <Info icon={Phone}><a className="hover:text-accent" href={`tel:${c.phone}`}>{c.phone}</a></Info>}
                    {c.mobile && <Info icon={Smartphone}><a className="hover:text-accent" href={`tel:${c.mobile}`}>{c.mobile}</a></Info>}
                    {c.linkedin_url && <Info icon={Linkedin}><a className="hover:text-accent" href={c.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></Info>}
                    {c.birthday && <Info icon={Cake}><span>{new Date(c.birthday).toLocaleDateString()}</span></Info>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    disabled={del.isPending}
                    onClick={() => {
                      if (window.confirm(`Remove contact "${c.full_name}"? This cannot be undone.`)) del.mutate(c.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactFormDialog customerId={customerId} open={open} onOpenChange={setOpen} contact={editing} />
    </div>
  );
}

function Info({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-3 w-3" />{children}</div>;
}

function ContactFormDialog({ customerId, open, onOpenChange, contact }: { customerId: string; open: boolean; onOpenChange: (v: boolean) => void; contact: CustomerContact | null }) {
  const qc = useQueryClient();
  const [v, setV] = useState(() => initial(contact));

  useEffect(() => { if (open) setV(initial(contact)); }, [open, contact]);

  const save = useMutation({
    mutationFn: () => upsertContact({
      id: contact?.id,
      customer_id: customerId,
      full_name: v.full_name,
      job_position: v.job_position || null,
      department: v.department || null,
      email: v.email || null,
      phone: v.phone || null,
      mobile: v.mobile || null,
      birthday: v.birthday || null,
      linkedin_url: v.linkedin_url || null,
      preferred_communication: (v.preferred_communication || null) as never,
      notes: v.notes || null,
      is_primary: v.is_primary,
    }),
    onSuccess: () => {
      toast.success(contact ? "Contact updated" : "Contact added");
      qc.invalidateQueries({ queryKey: ["contacts", customerId] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" required><Input value={v.full_name} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></Field>
          <Field label="Job position"><Input value={v.job_position} onChange={(e) => setV({ ...v, job_position: e.target.value })} /></Field>
          <Field label="Department"><Input value={v.department} onChange={(e) => setV({ ...v, department: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label="Mobile"><Input value={v.mobile} onChange={(e) => setV({ ...v, mobile: e.target.value })} /></Field>
          <Field label="Birthday"><Input type="date" value={v.birthday} onChange={(e) => setV({ ...v, birthday: e.target.value })} /></Field>
          <Field label="LinkedIn URL"><Input value={v.linkedin_url} onChange={(e) => setV({ ...v, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/…" /></Field>
          <Field label="Preferred communication">
            <Select value={v.preferred_communication || "none"} onValueChange={(val) => setV({ ...v, preferred_communication: val === "none" ? "" : val })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {COMMUNICATION_CHANNELS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Primary contact">
            <div className="flex h-10 items-center gap-2"><Switch checked={v.is_primary} onCheckedChange={(c) => setV({ ...v, is_primary: c })} /><span className="text-xs text-muted-foreground">Mark as primary</span></div>
          </Field>
          <div className="sm:col-span-2"><Field label="Notes"><Textarea rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!v.full_name || save.isPending} onClick={() => save.mutate()} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {save.isPending ? "Saving…" : contact ? "Save changes" : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}{required && <span className="ml-1 text-accent">*</span>}</Label>
      {children}
    </div>
  );
}

function initial(c: CustomerContact | null) {
  return {
    __id: c?.id ?? "new",
    full_name: c?.full_name ?? "",
    job_position: c?.job_position ?? "",
    department: c?.department ?? "",
    email: c?.email ?? "",
    phone: c?.phone ?? "",
    mobile: c?.mobile ?? "",
    birthday: c?.birthday ?? "",
    linkedin_url: c?.linkedin_url ?? "",
    preferred_communication: (c?.preferred_communication ?? "") as string,
    notes: c?.notes ?? "",
    is_primary: c?.is_primary ?? false,
  };
}