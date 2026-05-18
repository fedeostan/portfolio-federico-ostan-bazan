-- Advisor remediations:
--   1. Public bucket already exposes objects via public=true; the SELECT
--      policy on storage.objects added unnecessary list capability. Drop it.
--   2. Tighten anon_insert_leads with a minimal email shape check so the
--      INSERT policy is not literally `with check (true)`.
--   3. Add covering indexes for project_id foreign keys.

drop policy if exists "public_read_project_assets" on storage.objects;

drop policy if exists "anon_insert_leads" on leads;
create policy "anon_insert_leads" on leads
  for insert
  with check (
    length(email) between 3 and 254
    and email like '%@%.%'
  );

create index project_sections_project_id_idx on project_sections (project_id);
create index project_assets_project_id_idx on project_assets (project_id);
