-- Greenhouse Lab: skema awal (PRD v2.1 bab 10).
-- Jalankan di Supabase Dashboard > SQL Editor, atau dengan Supabase CLI.
-- Prinsip: RLS aktif di semua tabel. Anon/siswa TIDAK punya policy sama sekali;
-- akses siswa hanya lewat server (service role) setelah kode penelitian valid.
-- Staf (admin/researcher) mengakses lewat policy berbasis admin_profiles.

-- ---------------------------------------------------------------- admin
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar not null,
  role varchar not null check (role in ('admin', 'researcher')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and is_active
  );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid() and is_active and role = 'admin'
  );
$$;

-- ------------------------------------------------------------- sessions
create table public.research_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code varchar not null unique,
  title varchar not null,
  class_code varchar,
  academic_year varchar,
  status varchar not null default 'draft'
    check (status in ('draft', 'scheduled', 'active', 'closed', 'archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  participant_code_hash varchar not null,   -- HMAC-SHA256, bukan plaintext
  participant_label varchar,                -- label urut non-identitas, mis. P-017
  status varchar not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  unique (session_id, participant_code_hash)
);
create index participants_session_status_idx on public.participants (session_id, status);

create table public.research_access_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  access_token_hash varchar not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);
create index research_access_expires_idx on public.research_access_sessions (expires_at);
create index research_access_participant_idx on public.research_access_sessions (participant_id, session_id);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  notice_version varchar not null,
  acknowledged_at timestamptz not null default now(),
  guardian_consent varchar not null default 'pending'
    check (guardian_consent in ('confirmed', 'not_required', 'pending')),
  unique (participant_id, session_id, notice_version)
);

-- -------------------------------------------------------------- content
create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  module_code varchar not null unique,
  title varchar not null,
  description text,
  order_index int not null default 0,
  status varchar not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

create table public.learning_contents (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete restrict,
  version int not null,
  content_blocks jsonb not null default '[]'::jsonb,
  learning_objectives jsonb not null default '[]'::jsonb,
  source_notes text,
  status varchar not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  unique (module_id, version)
);

create table public.simulation_configs (
  id uuid primary key default gen_random_uuid(),
  version varchar not null unique,
  model_name varchar not null,
  parameters jsonb not null,
  formula_version varchar not null,
  status varchar not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  experiment_code varchar not null,
  title varchar not null,
  description text,
  version int not null default 1,
  simulation_config_id uuid references public.simulation_configs(id),
  poe_schema jsonb not null default '{}'::jsonb,
  status varchar not null default 'draft' check (status in ('draft', 'published', 'archived')),
  unique (experiment_code, version)
);

-- Penguncian versi per sesi (konten yang dipakai tidak diubah diam-diam)
create table public.session_contents (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  content_id uuid references public.learning_contents(id),
  experiment_id uuid references public.experiments(id),
  simulation_config_id uuid references public.simulation_configs(id),
  locked_at timestamptz not null default now()
);

-- ------------------------------------------------------------ instruments
create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  instrument_code varchar not null,
  title varchar not null,
  instrument_type varchar not null check (instrument_type in ('pretest', 'posttest', 'questionnaire')),
  version int not null default 1,
  status varchar not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  unique (instrument_code, version)
);

create table public.instrument_items (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete restrict,
  item_code varchar not null,
  indicator_code varchar,
  item_type varchar not null check (item_type in ('multiple_choice', 'true_false', 'essay', 'likert')),
  prompt text not null,
  options jsonb,
  scoring_config jsonb,
  answer_key jsonb,                 -- hanya server/staf; tidak pernah dikirim ke siswa
  order_index int not null default 0,
  unique (instrument_id, item_code)
);
create index instrument_items_instrument_idx on public.instrument_items (instrument_id);

create table public.session_instruments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  instrument_id uuid not null references public.instruments(id) on delete restrict,
  purpose varchar not null check (purpose in ('pretest', 'posttest', 'questionnaire')),
  is_required boolean not null default true,
  opens_at timestamptz,
  closes_at timestamptz,
  settings jsonb not null default '{}'::jsonb
);
create index session_instruments_session_idx on public.session_instruments (session_id);

-- --------------------------------------------------------- student data
create table public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  module_id uuid not null references public.learning_modules(id),
  content_version int not null,
  status varchar not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (participant_id, session_id, module_id, content_version)
);

create table public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  session_instrument_id uuid not null references public.session_instruments(id) on delete restrict,
  attempt_number int not null default 1,
  status varchar not null default 'in_progress'
    check (status in ('not_started', 'in_progress', 'submitted', 'expired', 'invalidated')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  total_score numeric,
  max_score numeric,
  scoring_version varchar,
  idempotency_key varchar,
  unique (participant_id, session_instrument_id, attempt_number),
  unique (participant_id, session_instrument_id, idempotency_key),
  check (total_score is null or total_score >= 0),
  check (max_score is null or total_score is null or total_score <= max_score)
);
create index test_attempts_pi_idx on public.test_attempts (participant_id, session_instrument_id);

create table public.test_responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts(id) on delete cascade,
  item_id uuid not null references public.instrument_items(id),
  response jsonb,
  awarded_score numeric check (awarded_score is null or awarded_score >= 0),
  is_correct boolean,
  saved_at timestamptz not null default now(),
  unique (attempt_id, item_id)
);

create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  instrument_id uuid not null references public.instruments(id),
  item_id uuid not null references public.instrument_items(id),
  response jsonb,
  submitted_at timestamptz not null default now(),
  unique (participant_id, session_id, item_id)
);

create table public.experiment_records (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete restrict,
  session_id uuid not null references public.research_sessions(id) on delete restrict,
  experiment_id uuid not null references public.experiments(id),
  experiment_version int not null,
  simulation_version varchar not null,
  prediction jsonb,
  parameter_settings jsonb,
  observation jsonb,
  explanation text,
  status varchar not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  idempotency_key varchar,
  unique (participant_id, session_id, experiment_id, experiment_version)
);

-- ----------------------------------------------------------------- audit
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action varchar not null,
  entity_type varchar,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,   -- jangan simpan password/token/kode plaintext
  created_at timestamptz not null default now()
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  session_id uuid references public.research_sessions(id),
  export_type varchar not null,
  filters jsonb not null default '{}'::jsonb,
  row_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Rate limiting untuk validasi kode (diakses hanya oleh server/service role)
create table public.rate_limits (
  key varchar primary key,
  window_start timestamptz not null,
  count int not null
);

create or replace function public.check_rate_limit(
  p_key varchar, p_limit int, p_window_seconds int
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case
      when r.window_start < now() - make_interval(secs => p_window_seconds)
      then now() else r.window_start end,
    count = case
      when r.window_start < now() - make_interval(secs => p_window_seconds)
      then 1 else r.count + 1 end
  returning count into v_count;
  return v_count <= p_limit;
end;
$$;
revoke all on function public.check_rate_limit(varchar, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(varchar, int, int) to service_role;

-- ------------------------------------------------------------------ RLS
do $$
declare t text;
begin
  foreach t in array array[
    'admin_profiles','research_sessions','participants','research_access_sessions',
    'consent_records','learning_modules','learning_contents','simulation_configs',
    'experiments','session_contents','instruments','instrument_items',
    'session_instruments','learning_progress','test_attempts','test_responses',
    'questionnaire_responses','experiment_records','audit_logs','export_logs','rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;

  -- Staf (admin & researcher) boleh akses penuh pada tabel operasional.
  foreach t in array array[
    'research_sessions','participants','consent_records','learning_modules',
    'learning_contents','simulation_configs','experiments','session_contents',
    'instruments','instrument_items','session_instruments','learning_progress',
    'test_attempts','test_responses','questionnaire_responses','experiment_records'
  ] loop
    execute format(
      'create policy staff_all on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t);
  end loop;
end $$;

-- research_access_sessions, rate_limits: tanpa policy (hanya service role).
-- admin_profiles: staf membaca profil sendiri; hanya admin mengelola.
create policy own_profile_read on public.admin_profiles
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy admin_manage_profiles on public.admin_profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- audit & export log: staf membaca; penulisan lewat server.
create policy staff_read on public.audit_logs for select to authenticated using (public.is_staff());
create policy staff_read on public.export_logs for select to authenticated using (public.is_staff());
