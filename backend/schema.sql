-- Vedha Mind — Supabase / PostgreSQL schema
create extension if not exists vector;
create extension if not exists pgcrypto;

create table documents (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text check (jurisdiction in ('india','international')) not null,
  doc_type text not null,
  title text not null,
  authority text,
  source_url text,
  language text default 'en',
  version_hash text,
  published_date date,
  last_verified_at timestamptz default now(),
  raw_storage_path text,
  created_at timestamptz default now()
);

create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  jurisdiction text not null,
  chunk_text text not null,
  chunk_text_translated jsonb,
  section_ref text,
  embedding vector(1024),
  token_count int,
  chunk_index int,
  created_at timestamptz default now()
);
create index chunks_hnsw_idx on document_chunks using hnsw (embedding vector_cosine_ops);
create index idx_chunks_jurisdiction on document_chunks(jurisdiction);

create table tkdl_records (
  id uuid primary key default gen_random_uuid(),
  tkdl_id text unique,
  formulation_name text,
  classical_text_source text,
  ingredients jsonb,
  indication text,
  language_original text,
  linked_patent_oppositions jsonb,
  embedding vector(1024)
);

create table patents_india (
  id uuid primary key default gen_random_uuid(),
  application_no text unique,
  publication_no text,
  patent_no text,
  title text,
  applicant text,
  status text,
  filing_date date,
  grant_date date,
  expiry_date date,
  section_3p_flag boolean default false,
  tkdl_prior_art_ref uuid references tkdl_records(id),
  ipc_classification text,
  renewal_status jsonb,
  raw_record jsonb,
  last_synced_at timestamptz default now()
);

create table patents_international (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_office text not null,
  application_no text,
  publication_no text,
  patent_no text,
  title text,
  applicant text,
  status text,
  filing_date date,
  grant_date date,
  expiry_date date,
  pct_national_phase_deadline date,
  priority_claim_india_app text,
  raw_record jsonb,
  last_synced_at timestamptz default now()
);

create table abs_approvals (
  id uuid primary key default gen_random_uuid(),
  applicant text,
  biological_resource text,
  nba_approval_no text,
  approval_date date,
  benefit_sharing_terms text,
  status text
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role text default 'user',
  preferred_language text default 'en',
  created_at timestamptz default now()
);

create table query_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  query_text text,
  jurisdiction_selected text,
  retrieved_chunk_ids uuid[],
  llm_response text,
  confidence_score numeric,
  escalated_to_human boolean default false,
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  query_id uuid references query_log(id),
  report_type text,
  content jsonb,
  citations jsonb,
  pdf_storage_path text,
  created_at timestamptz default now()
);

-- Row-level security (DPDP)
alter table query_log enable row level security;
alter table reports enable row level security;
create policy "own rows only - query_log" on query_log for all using (auth.uid() = user_id);
create policy "own rows only - reports" on reports for all using (auth.uid() = user_id);

-- Expiry recompute job (run daily via cron)
create or replace function recompute_india_expiry() returns void as $$
begin
  update patents_india
  set expiry_date = filing_date + interval '20 years',
      status = case
        when (renewal_status->>'last_paid_year')::int < extract(year from now())::int - 1
        then 'lapsed' else status end
  where grant_date is not null;
end;
$$ language plpgsql;
