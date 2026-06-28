import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CUSTOMER_STATUSES, CUSTOMER_PRIORITIES, CUSTOMER_TYPES, LEAD_SOURCES,
  type CustomerStatus, type CustomerPriority, type CustomerType, type LeadSource,
} from "@/lib/crm/constants";
import { createCustomer, updateCustomer, listEmployees, type Customer } from "@/lib/crm/api";

const schema = z.object({
  company_name: z.string().trim().min(1, "Required").max(160),
  company_logo_url: z.string().trim().url("Must be a URL").max(500).optional().or(z.literal("")),
  company_type: z.enum(["company","agency","brand","nonprofit","public_sector","individual"]),
  industry: z.string().trim().max(120).optional().or(z.literal("")),
  status: z.enum(["lead","prospect","active","on_hold","inactive","archived"]),
  priority: z.enum(["low","medium","high","critical"]),
  lead_source: z.enum(["referral","website","inbound_email","cold_outreach","social_media","event","partner","advertising","other"]).optional().or(z.literal("")),
  assigned_employee_id: z.string().uuid().optional().or(z.literal("")),
  website: z.string().trim().max(500).optional().or(z.literal("")),
  vat_number: z.string().trim().max(60).optional().or(z.literal("")),
  tax_office: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(160).optional().or(z.literal("")),
  internal_notes: z.string().trim().max(4000).optional().or(z.literal("")),
  customer_since: z.string().optional().or(z.literal("")),
  next_follow_up_at: z.string().optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

const empty: Values = {
  company_name: "", company_logo_url: "", company_type: "company",
  industry: "", status: "lead", priority: "medium", lead_source: "",
  assigned_employee_id: "", website: "", vat_number: "", tax_office: "",
  country: "", city: "", address: "", postal_code: "", phone: "", email: "",
  internal_notes: "", customer_since: "", next_follow_up_at: "",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer?: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: Props) {
  const qc = useQueryClient();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: listEmployees });

  useEffect(() => {
    if (open) {
      setErrors({});
      if (!customer) { setValues(empty); return; }
      const dateOnly = (v: string | null) => (v ? String(v).slice(0, 10) : "");
      const dateTimeLocal = (v: string | null) => {
        if (!v) return "";
        const d = new Date(v);
        if (isNaN(d.getTime())) return "";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setValues({
        company_name: customer.company_name ?? "",
        company_logo_url: customer.company_logo_url ?? "",
        company_type: customer.company_type,
        industry: customer.industry ?? "",
        status: customer.status,
        priority: customer.priority,
        lead_source: (customer.lead_source ?? "") as LeadSource | "",
        assigned_employee_id: customer.assigned_employee_id ?? "",
        website: customer.website ?? "",
        vat_number: customer.vat_number ?? "",
        tax_office: customer.tax_office ?? "",
        country: customer.country ?? "",
        city: customer.city ?? "",
        address: customer.address ?? "",
        postal_code: customer.postal_code ?? "",
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        internal_notes: customer.internal_notes ?? "",
        customer_since: dateOnly(customer.customer_since),
        next_follow_up_at: dateTimeLocal(customer.next_follow_up_at),
      });
    }
  }, [open, customer]);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((p) => ({ ...p, [k]: v }));

  const mut = useMutation({
    mutationFn: async (parsed: Values) => {
      const payload = {
        ...parsed,
        company_logo_url: parsed.company_logo_url || null,
        industry: parsed.industry || null,
        lead_source: (parsed.lead_source || null) as LeadSource | null,
        assigned_employee_id: parsed.assigned_employee_id || null,
        website: parsed.website || null,
        vat_number: parsed.vat_number || null,
        tax_office: parsed.tax_office || null,
        country: parsed.country || null,
        city: parsed.city || null,
        address: parsed.address || null,
        postal_code: parsed.postal_code || null,
        phone: parsed.phone || null,
        email: parsed.email || null,
        internal_notes: parsed.internal_notes || null,
        customer_since: parsed.customer_since || null,
        next_follow_up_at: parsed.next_follow_up_at || null,
      };
      return customer ? updateCustomer(customer.id, payload) : createCustomer(payload);
    },
    onSuccess: () => {
      toast.success(customer ? "Customer updated" : "Customer created");
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customer", customer?.id] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    mut.mutate(result.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{customer ? "Edit customer" : "New customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update company details." : "Create a customer record. Add contacts and notes from the profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field label="Company name *" error={errors.company_name} className="sm:col-span-2">
            <Input value={values.company_name} onChange={(e) => set("company_name", e.target.value)} required />
          </Field>
          <Field label="Company type">
            <Select value={values.company_type} onValueChange={(v) => set("company_type", v as CustomerType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CUSTOMER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Industry">
            <Input value={values.industry} onChange={(e) => set("industry", e.target.value)} placeholder="e.g. Fashion, Tech, Hospitality" />
          </Field>
          <Field label="Status">
            <Select value={values.status} onValueChange={(v) => set("status", v as CustomerStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CUSTOMER_STATUSES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={values.priority} onValueChange={(v) => set("priority", v as CustomerPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CUSTOMER_PRIORITIES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Lead source">
            <Select value={values.lead_source || "__none__"} onValueChange={(v) => set("lead_source", v === "__none__" ? "" : (v as LeadSource))}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {LEAD_SOURCES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Assigned employee">
            <Select value={values.assigned_employee_id || "__none__"} onValueChange={(v) => set("assigned_employee_id", v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name ?? e.email ?? "Unnamed"}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Website" error={errors.website}>
            <Input value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Logo URL" error={errors.company_logo_url}>
            <Input value={values.company_logo_url} onChange={(e) => set("company_logo_url", e.target.value)} placeholder="https://" />
          </Field>

          <Field label="VAT number">
            <Input value={values.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
          </Field>
          <Field label="Tax office">
            <Input value={values.tax_office} onChange={(e) => set("tax_office", e.target.value)} />
          </Field>

          <Field label="Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="City">
            <Input value={values.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={values.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Postal code">
            <Input value={values.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Customer since">
            <Input type="date" value={values.customer_since} onChange={(e) => set("customer_since", e.target.value)} />
          </Field>
          <Field label="Next follow up">
            <Input type="datetime-local" value={values.next_follow_up_at} onChange={(e) => set("next_follow_up_at", e.target.value)} />
          </Field>

          <Field label="Internal notes" className="sm:col-span-2">
            <Textarea rows={3} value={values.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} />
          </Field>

          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mut.isPending}>Cancel</Button>
            <Button type="submit" disabled={mut.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : customer ? "Save changes" : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}