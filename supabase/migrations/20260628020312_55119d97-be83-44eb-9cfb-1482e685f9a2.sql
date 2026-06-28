
-- Required extension first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============ ENUMS ============
CREATE TYPE public.customer_status AS ENUM (
  'lead', 'prospect', 'active', 'on_hold', 'inactive', 'archived'
);
CREATE TYPE public.customer_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.customer_type AS ENUM (
  'company', 'agency', 'brand', 'nonprofit', 'public_sector', 'individual'
);
CREATE TYPE public.lead_source AS ENUM (
  'referral', 'website', 'inbound_email', 'cold_outreach',
  'social_media', 'event', 'partner', 'advertising', 'other'
);
CREATE TYPE public.preferred_communication AS ENUM (
  'email', 'phone', 'mobile', 'whatsapp', 'in_person'
);
CREATE TYPE public.activity_type AS ENUM (
  'customer_created', 'customer_updated', 'status_changed',
  'priority_changed', 'employee_assigned', 'note_added',
  'note_updated', 'contact_added', 'contact_updated',
  'contact_removed', 'tag_added', 'tag_removed',
  'customer_archived', 'customer_restored'
);

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_logo_url text,
  company_type public.customer_type NOT NULL DEFAULT 'company',
  industry text,
  status public.customer_status NOT NULL DEFAULT 'lead',
  priority public.customer_priority NOT NULL DEFAULT 'medium',
  lead_source public.lead_source,
  assigned_employee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  website text,
  vat_number text,
  tax_office text,
  country text,
  city text,
  address text,
  postal_code text,
  phone text,
  email text,
  internal_notes text,
  labels text[] NOT NULL DEFAULT '{}',
  customer_since date,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update customers" ON public.customers FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_customers_status ON public.customers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_assigned_employee ON public.customers(assigned_employee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_industry ON public.customers(industry) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_country ON public.customers(country) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX idx_customers_company_name_trgm ON public.customers USING gin (company_name gin_trgm_ops);
CREATE INDEX idx_customers_search ON public.customers
  USING gin (to_tsvector('simple',
    coalesce(company_name,'') || ' ' || coalesce(email,'') || ' ' ||
    coalesce(phone,'') || ' ' || coalesce(vat_number,'') || ' ' ||
    coalesce(industry,'') || ' ' || coalesce(city,'')));

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CONTACTS ============
CREATE TABLE public.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  job_position text,
  department text,
  email text,
  phone text,
  mobile text,
  birthday date,
  linkedin_url text,
  preferred_communication public.preferred_communication,
  notes text,
  is_primary boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_contacts TO authenticated;
GRANT ALL ON public.customer_contacts TO service_role;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view contacts" ON public.customer_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert contacts" ON public.customer_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update contacts" ON public.customer_contacts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete contacts" ON public.customer_contacts FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_customer_contacts_customer ON public.customer_contacts(customer_id);
CREATE INDEX idx_customer_contacts_email ON public.customer_contacts(email);
CREATE TRIGGER trg_customer_contacts_updated_at BEFORE UPDATE ON public.customer_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ TAGS ============
CREATE TABLE public.customer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT '#D71920',
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_tags TO authenticated;
GRANT ALL ON public.customer_tags TO service_role;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view tags" ON public.customer_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert tags" ON public.customer_tags FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update tags" ON public.customer_tags FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete tags" ON public.customer_tags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.customer_tag_assignments (
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_tag_assignments TO authenticated;
GRANT ALL ON public.customer_tag_assignments TO service_role;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view tag assignments" ON public.customer_tag_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage tag assignments" ON public.customer_tag_assignments FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_tag_assignments_tag ON public.customer_tag_assignments(tag_id);

-- ============ NOTES ============
CREATE TABLE public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title text,
  body_html text NOT NULL DEFAULT '',
  body_text text NOT NULL DEFAULT '',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  mentions uuid[] NOT NULL DEFAULT '{}',
  is_pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view notes" ON public.customer_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert notes" ON public.customer_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors or admins can update notes" ON public.customer_notes FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors or admins can delete notes" ON public.customer_notes FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_customer_notes_customer ON public.customer_notes(customer_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_customer_notes_updated_at BEFORE UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.customer_note_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.customer_notes(id) ON DELETE CASCADE,
  body_html text NOT NULL,
  body_text text NOT NULL,
  edited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  edited_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.customer_note_revisions TO authenticated;
GRANT ALL ON public.customer_note_revisions TO service_role;
ALTER TABLE public.customer_note_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view revisions" ON public.customer_note_revisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert revisions" ON public.customer_note_revisions FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_note_revisions_note ON public.customer_note_revisions(note_id, edited_at DESC);

-- ============ ACTIVITIES ============
CREATE TABLE public.customer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  source_module text,
  source_table text,
  source_id uuid,
  summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.customer_activities TO authenticated;
GRANT ALL ON public.customer_activities TO service_role;
ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view activities" ON public.customer_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert activities" ON public.customer_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX idx_activities_customer ON public.customer_activities(customer_id, occurred_at DESC);
CREATE INDEX idx_activities_type ON public.customer_activities(activity_type);
CREATE INDEX idx_activities_source ON public.customer_activities(source_module, source_table, source_id);

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.log_customer_activity(
  _customer_id uuid, _type public.activity_type, _summary text, _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.customer_activities (customer_id, activity_type, source_module, summary, metadata, actor_id)
  VALUES (_customer_id, _type, 'crm', _summary, _metadata, auth.uid());
END;
$$;
REVOKE ALL ON FUNCTION public.log_customer_activity(uuid, public.activity_type, text, jsonb) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.trg_customer_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_customer_activity(NEW.id, 'customer_created', 'Customer created: ' || NEW.company_name, '{}'::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM public.log_customer_activity(NEW.id, 'status_changed',
        'Status changed from ' || OLD.status::text || ' to ' || NEW.status::text,
        jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
      PERFORM public.log_customer_activity(NEW.id, 'priority_changed',
        'Priority changed from ' || OLD.priority::text || ' to ' || NEW.priority::text,
        jsonb_build_object('from', OLD.priority, 'to', NEW.priority));
    END IF;
    IF NEW.assigned_employee_id IS DISTINCT FROM OLD.assigned_employee_id THEN
      PERFORM public.log_customer_activity(NEW.id, 'employee_assigned', 'Assigned employee updated',
        jsonb_build_object('from', OLD.assigned_employee_id, 'to', NEW.assigned_employee_id));
    END IF;
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      IF NEW.deleted_at IS NOT NULL THEN
        PERFORM public.log_customer_activity(NEW.id, 'customer_archived', 'Customer archived', '{}'::jsonb);
      ELSE
        PERFORM public.log_customer_activity(NEW.id, 'customer_restored', 'Customer restored', '{}'::jsonb);
      END IF;
    END IF;
    IF (NEW.company_name, NEW.industry, NEW.website, NEW.phone, NEW.email, NEW.country, NEW.city)
       IS DISTINCT FROM (OLD.company_name, OLD.industry, OLD.website, OLD.phone, OLD.email, OLD.country, OLD.city) THEN
      PERFORM public.log_customer_activity(NEW.id, 'customer_updated', 'Customer details updated', '{}'::jsonb);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_customers_activity AFTER INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.trg_customer_activity();

CREATE OR REPLACE FUNCTION public.trg_contact_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_customer_activity(NEW.customer_id, 'contact_added',
      'Contact added: ' || NEW.full_name, jsonb_build_object('contact_id', NEW.id));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_customer_activity(NEW.customer_id, 'contact_updated',
      'Contact updated: ' || NEW.full_name, jsonb_build_object('contact_id', NEW.id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_customer_activity(OLD.customer_id, 'contact_removed',
      'Contact removed: ' || OLD.full_name, jsonb_build_object('contact_id', OLD.id));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trg_contacts_activity AFTER INSERT OR UPDATE OR DELETE ON public.customer_contacts
  FOR EACH ROW EXECUTE FUNCTION public.trg_contact_activity();

CREATE OR REPLACE FUNCTION public.trg_note_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_customer_activity(NEW.customer_id, 'note_added',
      COALESCE(NEW.title, 'Note added'), jsonb_build_object('note_id', NEW.id));
  ELSIF TG_OP = 'UPDATE' AND OLD.body_html IS DISTINCT FROM NEW.body_html THEN
    INSERT INTO public.customer_note_revisions (note_id, body_html, body_text, edited_by)
    VALUES (OLD.id, OLD.body_html, OLD.body_text, auth.uid());
    PERFORM public.log_customer_activity(NEW.customer_id, 'note_updated',
      COALESCE(NEW.title, 'Note updated'), jsonb_build_object('note_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notes_activity AFTER INSERT OR UPDATE ON public.customer_notes
  FOR EACH ROW EXECUTE FUNCTION public.trg_note_activity();

CREATE OR REPLACE FUNCTION public.trg_tag_assignment_activity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tag_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT name INTO _tag_name FROM public.customer_tags WHERE id = NEW.tag_id;
    PERFORM public.log_customer_activity(NEW.customer_id, 'tag_added',
      'Tag added: ' || COALESCE(_tag_name, 'unknown'), jsonb_build_object('tag_id', NEW.tag_id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT name INTO _tag_name FROM public.customer_tags WHERE id = OLD.tag_id;
    PERFORM public.log_customer_activity(OLD.customer_id, 'tag_removed',
      'Tag removed: ' || COALESCE(_tag_name, 'unknown'), jsonb_build_object('tag_id', OLD.tag_id));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER trg_tag_assignment_activity AFTER INSERT OR DELETE ON public.customer_tag_assignments
  FOR EACH ROW EXECUTE FUNCTION public.trg_tag_assignment_activity();

-- ============ STATISTICS VIEW ============
CREATE OR REPLACE VIEW public.customer_statistics
WITH (security_invoker = on) AS
SELECT
  c.id AS customer_id,
  c.customer_since,
  GREATEST(c.last_contact_at,
    (SELECT MAX(a.occurred_at) FROM public.customer_activities a WHERE a.customer_id = c.id)
  ) AS last_activity_at,
  (SELECT COUNT(*) FROM public.customer_contacts ct WHERE ct.customer_id = c.id) AS contacts_count,
  (SELECT COUNT(*) FROM public.customer_notes n WHERE n.customer_id = c.id AND n.deleted_at IS NULL) AS notes_count,
  (SELECT COUNT(*) FROM public.customer_tag_assignments ta WHERE ta.customer_id = c.id) AS tags_count,
  0::numeric AS lifetime_revenue,
  0::numeric AS outstanding_balance,
  0::int AS paid_invoices,
  0::int AS pending_invoices,
  0::numeric AS average_invoice_value,
  0::int AS projects_count,
  0::int AS events_count,
  NULL::int AS health_score
FROM public.customers c
WHERE c.deleted_at IS NULL;

GRANT SELECT ON public.customer_statistics TO authenticated;
