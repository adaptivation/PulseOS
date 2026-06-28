import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];
export type CustomerContact = Database["public"]["Tables"]["customer_contacts"]["Row"];
export type CustomerNote = Database["public"]["Tables"]["customer_notes"]["Row"];
export type CustomerTag = Database["public"]["Tables"]["customer_tags"]["Row"];
export type CustomerActivity = Database["public"]["Tables"]["customer_activities"]["Row"];
export type CustomerStatisticsRow = Database["public"]["Views"]["customer_statistics"]["Row"];

export interface CustomerWithExtras extends Customer {
  tags: CustomerTag[];
  assigned_employee: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

export interface CustomerListFilters {
  search?: string;
  statuses?: string[];
  priorities?: string[];
  assignedEmployeeIds?: string[];
  industries?: string[];
  countries?: string[];
  tagIds?: string[];
  includeArchived?: boolean;
}

/* ------------------------------- Customers ------------------------------- */

export async function listCustomers(filters: CustomerListFilters = {}): Promise<CustomerWithExtras[]> {
  let q = supabase
    .from("customers")
    .select(
      `*,
       assigned_employee:profiles!customers_assigned_employee_id_fkey ( id, full_name, avatar_url ),
       customer_tag_assignments ( customer_tags ( * ) )`,
    )
    .order("created_at", { ascending: false });

  if (!filters.includeArchived) q = q.is("deleted_at", null);
  if (filters.search) {
    const s = filters.search.trim();
    q = q.or(
      `company_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,vat_number.ilike.%${s}%,city.ilike.%${s}%,industry.ilike.%${s}%`,
    );
  }
  if (filters.statuses?.length) q = q.in("status", filters.statuses as Customer["status"][]);
  if (filters.priorities?.length) q = q.in("priority", filters.priorities as Customer["priority"][]);
  if (filters.assignedEmployeeIds?.length) q = q.in("assigned_employee_id", filters.assignedEmployeeIds);
  if (filters.industries?.length) q = q.in("industry", filters.industries);
  if (filters.countries?.length) q = q.in("country", filters.countries);

  const { data, error } = await q;
  if (error) throw error;

  let rows = (data ?? []).map((row) => {
    const taggings = (row as unknown as { customer_tag_assignments: { customer_tags: CustomerTag }[] }).customer_tag_assignments ?? [];
    return {
      ...(row as unknown as Customer),
      assigned_employee: (row as unknown as { assigned_employee: CustomerWithExtras["assigned_employee"] }).assigned_employee ?? null,
      tags: taggings.map((t) => t.customer_tags).filter(Boolean),
    } as CustomerWithExtras;
  });

  if (filters.tagIds?.length) {
    const wanted = new Set(filters.tagIds);
    rows = rows.filter((c) => c.tags.some((t) => wanted.has(t.id)));
  }
  return rows;
}

export async function getCustomer(id: string): Promise<CustomerWithExtras> {
  const { data, error } = await supabase
    .from("customers")
    .select(
      `*,
       assigned_employee:profiles!customers_assigned_employee_id_fkey ( id, full_name, avatar_url ),
       customer_tag_assignments ( customer_tags ( * ) )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Customer not found");
  const taggings = (data as unknown as { customer_tag_assignments: { customer_tags: CustomerTag }[] }).customer_tag_assignments ?? [];
  return {
    ...(data as unknown as Customer),
    assigned_employee: (data as unknown as { assigned_employee: CustomerWithExtras["assigned_employee"] }).assigned_employee ?? null,
    tags: taggings.map((t) => t.customer_tags).filter(Boolean),
  };
}

export async function createCustomer(values: CustomerInsert): Promise<Customer> {
  const { data: auth } = await supabase.auth.getUser();
  const payload: CustomerInsert = { ...values, created_by: auth.user?.id, updated_by: auth.user?.id };
  const { data, error } = await supabase.from("customers").insert(payload).select("*").single();
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, values: CustomerUpdate): Promise<Customer> {
  const { data: auth } = await supabase.auth.getUser();
  const payload: CustomerUpdate = { ...values, updated_by: auth.user?.id };
  const { data, error } = await supabase.from("customers").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Customer;
}

export async function archiveCustomers(ids: string[]) {
  const { error } = await supabase.from("customers").update({ deleted_at: new Date().toISOString(), status: "archived" }).in("id", ids);
  if (error) throw error;
}
export async function restoreCustomers(ids: string[]) {
  const { error } = await supabase.from("customers").update({ deleted_at: null }).in("id", ids);
  if (error) throw error;
}
export async function deleteCustomers(ids: string[]) {
  const { error } = await supabase.from("customers").delete().in("id", ids);
  if (error) throw error;
}
export async function duplicateCustomer(id: string): Promise<Customer> {
  const { data: src, error: e1 } = await supabase.from("customers").select("*").eq("id", id).single();
  if (e1) throw e1;
  const { data: auth } = await supabase.auth.getUser();
  const {
    id: _id, created_at: _c, updated_at: _u, created_by: _cb, updated_by: _ub,
    deleted_at: _d, last_contact_at: _l, ...rest
  } = src as Customer;
  const payload: CustomerInsert = {
    ...(rest as CustomerInsert),
    company_name: `${(src as Customer).company_name} (copy)`,
    status: "lead",
    created_by: auth.user?.id,
    updated_by: auth.user?.id,
  };
  const { data, error } = await supabase.from("customers").insert(payload).select("*").single();
  if (error) throw error;
  return data as Customer;
}
export async function bulkAssignEmployee(ids: string[], employeeId: string | null) {
  const { error } = await supabase.from("customers").update({ assigned_employee_id: employeeId }).in("id", ids);
  if (error) throw error;
}
export async function bulkChangeStatus(ids: string[], status: Customer["status"]) {
  const { error } = await supabase.from("customers").update({ status }).in("id", ids);
  if (error) throw error;
}

/* -------------------------------- Contacts ------------------------------- */

export async function listContacts(customerId: string): Promise<CustomerContact[]> {
  const { data, error } = await supabase
    .from("customer_contacts")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomerContact[];
}

export async function upsertContact(values: Database["public"]["Tables"]["customer_contacts"]["Insert"] & { id?: string }) {
  const { data: auth } = await supabase.auth.getUser();
  if (values.id) {
    const { id, ...rest } = values;
    const { data, error } = await supabase.from("customer_contacts").update(rest).eq("id", id).select("*").single();
    if (error) throw error;
    return data as CustomerContact;
  } else {
    const { data, error } = await supabase
      .from("customer_contacts")
      .insert({ ...values, created_by: auth.user?.id })
      .select("*")
      .single();
    if (error) throw error;
    return data as CustomerContact;
  }
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from("customer_contacts").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------------------------- Tags --------------------------------- */

export async function listAllTags(): Promise<CustomerTag[]> {
  const { data, error } = await supabase.from("customer_tags").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as CustomerTag[];
}

export async function createTag(values: { name: string; color: string; description?: string | null }) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("customer_tags")
    .insert({ ...values, created_by: auth.user?.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as CustomerTag;
}

export async function assignTags(customerId: string, tagIds: string[]) {
  if (!tagIds.length) return;
  const { data: auth } = await supabase.auth.getUser();
  const rows = tagIds.map((tag_id) => ({ customer_id: customerId, tag_id, assigned_by: auth.user?.id }));
  const { error } = await supabase.from("customer_tag_assignments").upsert(rows, { onConflict: "customer_id,tag_id" });
  if (error) throw error;
}
export async function unassignTag(customerId: string, tagId: string) {
  const { error } = await supabase.from("customer_tag_assignments").delete().eq("customer_id", customerId).eq("tag_id", tagId);
  if (error) throw error;
}

export async function bulkApplyTags(customerIds: string[], tagIds: string[]) {
  if (!customerIds.length || !tagIds.length) return;
  const { data: auth } = await supabase.auth.getUser();
  const rows = customerIds.flatMap((customer_id) =>
    tagIds.map((tag_id) => ({ customer_id, tag_id, assigned_by: auth.user?.id })),
  );
  const { error } = await supabase.from("customer_tag_assignments").upsert(rows, { onConflict: "customer_id,tag_id" });
  if (error) throw error;
}

/* --------------------------------- Notes --------------------------------- */

export async function listNotes(customerId: string): Promise<(CustomerNote & { author?: { full_name: string | null; avatar_url: string | null } | null })[]> {
  const { data, error } = await supabase
    .from("customer_notes")
    .select(`*, author:profiles!customer_notes_created_by_fkey ( full_name, avatar_url )`)
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

export async function createNote(values: { customer_id: string; title?: string | null; body_html: string; body_text: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("customer_notes")
    .insert({ ...values, created_by: auth.user?.id, updated_by: auth.user?.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as CustomerNote;
}
export async function updateNote(id: string, values: { title?: string | null; body_html: string; body_text: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("customer_notes")
    .update({ ...values, updated_by: auth.user?.id })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as CustomerNote;
}
export async function deleteNote(id: string) {
  const { error } = await supabase.from("customer_notes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

/* ------------------------------ Activities ------------------------------- */

export async function listActivities(customerId: string, limit = 200) {
  const { data, error } = await supabase
    .from("customer_activities")
    .select(`*, actor:profiles!customer_activities_actor_id_fkey ( full_name, avatar_url )`)
    .eq("customer_id", customerId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (CustomerActivity & { actor?: { full_name: string | null; avatar_url: string | null } | null })[];
}

/* ------------------------------ Statistics ------------------------------- */

export async function getStatistics(customerId: string) {
  const { data, error } = await supabase
    .from("customer_statistics")
    .select("*")
    .eq("customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data as CustomerStatisticsRow | null;
}

/* ------------------------------ Employees -------------------------------- */

export async function listEmployees() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email, job_title")
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as { id: string; full_name: string | null; avatar_url: string | null; email: string | null; job_title: string | null }[];
}