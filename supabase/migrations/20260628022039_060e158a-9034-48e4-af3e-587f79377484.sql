
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_contacts TO authenticated;
GRANT ALL ON public.customer_contacts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_tags TO authenticated;
GRANT ALL ON public.customer_tags TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_tag_assignments TO authenticated;
GRANT ALL ON public.customer_tag_assignments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;

GRANT SELECT, INSERT ON public.customer_note_revisions TO authenticated;
GRANT ALL ON public.customer_note_revisions TO service_role;

GRANT SELECT, INSERT ON public.customer_activities TO authenticated;
GRANT ALL ON public.customer_activities TO service_role;
