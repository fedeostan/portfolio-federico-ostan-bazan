-- Ranked, stem-aware project search (#84).
--
-- Problem: search_projects returned an arbitrary LIMIT-ed subset (no ORDER BY
-- ts_rank), so broad queries like "design" dropped the highest-relevance rows.
-- The 'simple'-only tsvector also meant plural queries ("design systems")
-- matched nothing.
--
-- Fix:
--   1. projects_search_doc now concatenates 'simple' + 'english' vectors per
--      field: 'simple' keeps exact proper-noun/brand/stack tokens (MNEE,
--      Prometheus, SwiftUI), 'english' adds stems so "systems" matches
--      "system". Same A/B/C weights as before.
--   2. search_projects_ranked RPC orders by ts_rank_cd — PostgREST's
--      .textSearch() cannot ORDER BY rank, so ranking must live in SQL.
--
-- A generated column pins its function's stored output, so the column (and its
-- GIN index) must be dropped and recreated for existing rows to re-vectorize.

drop index if exists projects_tsv_idx;
alter table projects drop column if exists search_tsv;

create or replace function public.projects_search_doc(
  title text,
  summary text,
  description text,
  tech_stack text[]
)
returns tsvector
language sql
immutable
set search_path = ''
as $$
  select
    setweight(pg_catalog.to_tsvector('pg_catalog.simple', coalesce(title, '')), 'A') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(title, '')), 'A') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.simple', coalesce(summary, '')), 'B') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(summary, '')), 'B') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.simple', coalesce(description, '')), 'C') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.english', coalesce(description, '')), 'C') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.simple', pg_catalog.array_to_string(coalesce(tech_stack, '{}'), ' ')), 'C') ||
    setweight(pg_catalog.to_tsvector('pg_catalog.english', pg_catalog.array_to_string(coalesce(tech_stack, '{}'), ' ')), 'C')
$$;

alter table projects add column search_tsv tsvector generated always as (
  public.projects_search_doc(title, summary, description, tech_stack)
) stored;

create index projects_tsv_idx on projects using gin (search_tsv);

-- tsquery || tsquery is OR: a row matches if either the exact ('simple') or
-- stemmed ('english') parse of the query hits.
create or replace function public.search_projects_ranked(
  q text,
  p_category text default null,
  p_slug text default null,
  p_limit int default 5
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  category text,
  og_image text,
  tech_stack text[],
  role text,
  year int
)
language sql
stable
set search_path = ''
as $$
  with tsq as (
    select pg_catalog.websearch_to_tsquery('pg_catalog.simple', q)
        || pg_catalog.websearch_to_tsquery('pg_catalog.english', q) as query
  )
  select p.id, p.slug, p.title, p.summary, p.category,
         p.og_image, p.tech_stack, p.role, p.year
  from public.projects p, tsq
  where p.published
    and p.search_tsv @@ tsq.query
    and (p_category is null or p.category = p_category)
    and (p_slug is null or p.slug = p_slug)
  order by pg_catalog.ts_rank_cd(p.search_tsv, tsq.query) desc
  limit p_limit;
$$;
