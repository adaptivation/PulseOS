
REVOKE ALL ON FUNCTION public.trg_customer_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_contact_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_note_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_tag_assignment_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_customer_activity(uuid, public.activity_type, text, jsonb) FROM PUBLIC, anon, authenticated;
