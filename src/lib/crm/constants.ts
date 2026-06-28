import type { Database } from "@/integrations/supabase/types";

export type CustomerStatus = Database["public"]["Enums"]["customer_status"];
export type CustomerPriority = Database["public"]["Enums"]["customer_priority"];
export type CustomerType = Database["public"]["Enums"]["customer_type"];
export type LeadSource = Database["public"]["Enums"]["lead_source"];
export type PreferredCommunication = Database["public"]["Enums"]["preferred_communication"];
export type ActivityType = Database["public"]["Enums"]["activity_type"];

export const CUSTOMER_STATUSES: { value: CustomerStatus; label: string; tone: string }[] = [
  { value: "lead", label: "Lead", tone: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  { value: "prospect", label: "Prospect", tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  { value: "active", label: "Active", tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  { value: "on_hold", label: "On hold", tone: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30" },
  { value: "inactive", label: "Inactive", tone: "text-zinc-400 bg-zinc-500/5 border-zinc-500/20" },
  { value: "archived", label: "Archived", tone: "text-zinc-500 bg-zinc-500/5 border-zinc-500/15" },
];

export const CUSTOMER_PRIORITIES: { value: CustomerPriority; label: string; tone: string }[] = [
  { value: "low", label: "Low", tone: "text-zinc-300 bg-zinc-500/10 border-zinc-500/30" },
  { value: "medium", label: "Medium", tone: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  { value: "high", label: "High", tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  { value: "critical", label: "Critical", tone: "text-red-300 bg-red-500/10 border-red-500/40" },
];

export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: "company", label: "Company" },
  { value: "agency", label: "Agency" },
  { value: "brand", label: "Brand" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "public_sector", label: "Public sector" },
  { value: "individual", label: "Individual" },
];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "inbound_email", label: "Inbound email" },
  { value: "cold_outreach", label: "Cold outreach" },
  { value: "social_media", label: "Social media" },
  { value: "event", label: "Event" },
  { value: "partner", label: "Partner" },
  { value: "advertising", label: "Advertising" },
  { value: "other", label: "Other" },
];

export const COMMUNICATION_CHANNELS: { value: PreferredCommunication; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "mobile", label: "Mobile" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "in_person", label: "In person" },
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  customer_created: "Customer created",
  customer_updated: "Customer updated",
  status_changed: "Status changed",
  priority_changed: "Priority changed",
  employee_assigned: "Employee assigned",
  note_added: "Note added",
  note_updated: "Note updated",
  contact_added: "Contact added",
  contact_updated: "Contact updated",
  contact_removed: "Contact removed",
  tag_added: "Tag added",
  tag_removed: "Tag removed",
  customer_archived: "Customer archived",
  customer_restored: "Customer restored",
};

export const TAG_COLORS = [
  "#D71920", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7",
  "#EC4899", "#14B8A6", "#F97316", "#64748B", "#FACC15",
];

export function statusMeta(s: CustomerStatus) {
  return CUSTOMER_STATUSES.find((x) => x.value === s)!;
}
export function priorityMeta(p: CustomerPriority) {
  return CUSTOMER_PRIORITIES.find((x) => x.value === p)!;
}