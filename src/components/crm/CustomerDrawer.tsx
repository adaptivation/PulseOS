import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Mail, MapPin, Phone, Pencil } from "lucide-react";
import { CompanyAvatar, PriorityBadge, StatusBadge, TagPill } from "./Badges";
import type { CustomerWithExtras } from "@/lib/crm/api";

interface Props {
  customer: CustomerWithExtras | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: () => void;
}

export function CustomerDrawer({ customer, open, onOpenChange, onEdit }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-xl border-l-border bg-card p-0 sm:max-w-xl">
        {customer && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border p-6">
              <div className="flex items-start gap-4">
                <CompanyAvatar name={customer.company_name} src={customer.company_logo_url} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={customer.status} />
                    <PriorityBadge value={customer.priority} />
                  </div>
                  <SheetTitle className="mt-2 font-display text-2xl tracking-tight">{customer.company_name}</SheetTitle>
                  <SheetDescription className="mt-1 text-xs">{customer.industry ?? "—"} · {[customer.city, customer.country].filter(Boolean).join(", ") || "—"}</SheetDescription>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/crm/$customerId" params={{ customerId: customer.id }}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open profile
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
              {customer.tags.length > 0 && (
                <Section title="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((t) => <TagPill key={t.id} name={t.name} color={t.color} />)}
                  </div>
                </Section>
              )}

              <Section title="Contact">
                <Row icon={Mail} value={customer.email} href={customer.email ? `mailto:${customer.email}` : undefined} />
                <Row icon={Phone} value={customer.phone} href={customer.phone ? `tel:${customer.phone}` : undefined} />
                <Row icon={Globe} value={customer.website} href={customer.website ?? undefined} external />
                <Row icon={MapPin} value={[customer.address, customer.city, customer.country].filter(Boolean).join(", ") || null} />
              </Section>

              <Section title="Company">
                <Detail label="Type" value={customer.company_type} />
                <Detail label="Industry" value={customer.industry} />
                <Detail label="Lead source" value={customer.lead_source} />
                <Detail label="VAT" value={customer.vat_number} />
                <Detail label="Tax office" value={customer.tax_office} />
              </Section>

              <Section title="Lifecycle">
                <Detail label="Customer since" value={customer.customer_since} />
                <Detail label="Last contact" value={customer.last_contact_at && new Date(customer.last_contact_at).toLocaleString()} />
                <Detail label="Next follow up" value={customer.next_follow_up_at && new Date(customer.next_follow_up_at).toLocaleString()} />
                <Detail label="Assigned to" value={customer.assigned_employee?.full_name ?? "Unassigned"} />
              </Section>

              {customer.internal_notes && (
                <Section title="Internal notes">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{customer.internal_notes}</p>
                </Section>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      <div className="space-y-2 border border-border bg-elevated/40 p-3">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, value, href, external }: { icon: React.ComponentType<{ className?: string }>; value?: string | null; href?: string; external?: boolean }) {
  if (!value) return null;
  const inner = (
    <span className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </span>
  );
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="block text-foreground hover:text-accent">{inner}</a>
  ) : <div className="text-foreground">{inner}</div>;
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-xs text-foreground">{value || "—"}</span>
    </div>
  );
}