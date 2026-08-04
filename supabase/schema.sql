-- ==========================================================
-- Agency CRM — MVP schema (Phase 1)
-- Modules covered: auth/roles, clients, leads, projects,
-- tasks, content items, approvals, activity log
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- ==========================================================

-- ---------- ENUMS ----------
create type user_role as enum ('owner', 'management', 'employee', 'client');
create type client_health as enum ('healthy', 'attention', 'at_risk', 'critical');
create type lead_stage as enum (
  'new', 'contacted', 'follow_up_required', 'meeting_scheduled',
  'requirement_collected', 'proposal_sent', 'negotiation', 'won', 'lost', 'on_hold'
);
create type task_status as enum (
  'not_started', 'assigned', 'in_progress', 'waiting_internal_review',
  'waiting_client', 'revision_required', 'blocked', 'completed', 'cancelled', 'overdue'
);
create type task_priority as enum ('low', 'normal', 'high', 'urgent', 'critical');
create type content_stage as enum (
  'idea', 'research', 'script', 'internal_review', 'client_approval',
  'shoot_planning', 'shoot_completed', 'editing', 'internal_qc',
  'client_review', 'revision', 'final_approval', 'scheduling', 'published'
);
create type approval_action as enum ('approved', 'rejected', 'revision_requested', 'commented');

-- ---------- PROFILES (extends auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'employee',
  department text,
  client_id uuid, -- set when role = 'client': which client account they belong to
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- CLIENTS ----------
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  account_manager_id uuid references profiles(id),
  health client_health not null default 'healthy',
  contract_start date,
  contract_end date,
  monthly_deliverables int,
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles add constraint profiles_client_fk
  foreign key (client_id) references clients(id) on delete set null;

create table client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  title text,
  created_at timestamptz not null default now()
);

-- ---------- LEADS ----------
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text,
  industry text,
  services_required text,
  estimated_budget numeric,
  stage lead_stage not null default 'new',
  assigned_to uuid references profiles(id),
  expected_value numeric,
  probability int check (probability between 0 and 100),
  follow_up_date date,
  notes text,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROJECTS ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  service text,
  owner_id uuid references profiles(id),
  start_date date,
  end_date date,
  status text not null default 'active',
  priority task_priority not null default 'normal',
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

-- ---------- TASKS ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles(id),
  status task_status not null default 'not_started',
  priority task_priority not null default 'normal',
  due_date date,
  delay_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- CONTENT ITEMS ----------
create table content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_id uuid references projects(id),
  title text not null,
  content_type text,
  platform text,
  stage content_stage not null default 'idea',
  priority task_priority not null default 'normal',
  assigned_strategist uuid references profiles(id),
  scriptwriter uuid references profiles(id),
  videographer uuid references profiles(id),
  editor uuid references profiles(id),
  designer uuid references profiles(id),
  account_manager uuid references profiles(id),
  publish_date date,
  internal_deadline date,
  client_approval_deadline date,
  shoot_date date,
  editing_deadline date,
  qc_deadline date,
  scheduling_date date,
  revision_count int not null default 0,
  final_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- APPROVALS ----------
create table approvals (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references content_items(id) on delete cascade,
  user_id uuid references profiles(id),
  action approval_action not null,
  comment text,
  created_at timestamptz not null default now()
);

-- ---------- ACTIVITY LOG (audit trail) ----------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null, -- 'lead' | 'client' | 'project' | 'task' | 'content_item'
  entity_id uuid not null,
  user_id uuid references profiles(id),
  action text not null,
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table client_contacts enable row level security;
alter table leads enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table content_items enable row level security;
alter table approvals enable row level security;
alter table activity_log enable row level security;

-- Helper: current user's role
create or replace function current_role_name() returns user_role
language sql stable security definer as $$
  select role from profiles where id = auth.uid();
$$;

-- Helper: current user's client_id (if a client user)
create or replace function current_client_id() returns uuid
language sql stable security definer as $$
  select client_id from profiles where id = auth.uid();
$$;

-- ---------- PROFILES policies ----------
create policy "profiles: read own or staff read all"
  on profiles for select
  using (id = auth.uid() or current_role_name() in ('owner', 'management'));

create policy "profiles: owner manages all"
  on profiles for all
  using (current_role_name() = 'owner')
  with check (current_role_name() = 'owner');

-- ---------- CLIENTS policies ----------
create policy "clients: staff full read"
  on clients for select
  using (current_role_name() in ('owner', 'management', 'employee'));

create policy "clients: client reads own record"
  on clients for select
  using (id = current_client_id());

create policy "clients: owner+management write"
  on clients for insert with check (current_role_name() in ('owner', 'management'));
create policy "clients: owner+management update"
  on clients for update using (current_role_name() in ('owner', 'management'));
create policy "clients: owner delete"
  on clients for delete using (current_role_name() = 'owner');

-- ---------- LEADS policies (internal only — clients never see leads) ----------
create policy "leads: staff read"
  on leads for select using (current_role_name() in ('owner', 'management', 'employee'));
create policy "leads: staff write"
  on leads for insert with check (current_role_name() in ('owner', 'management', 'employee'));
create policy "leads: staff update"
  on leads for update using (current_role_name() in ('owner', 'management', 'employee'));
create policy "leads: owner+management delete"
  on leads for delete using (current_role_name() in ('owner', 'management'));

-- ---------- PROJECTS policies ----------
create policy "projects: staff read"
  on projects for select using (current_role_name() in ('owner', 'management', 'employee'));
create policy "projects: client reads own"
  on projects for select using (client_id = current_client_id());
create policy "projects: management write"
  on projects for insert with check (current_role_name() in ('owner', 'management'));
create policy "projects: management update"
  on projects for update using (current_role_name() in ('owner', 'management'));

-- ---------- TASKS policies ----------
create policy "tasks: staff read all"
  on tasks for select using (current_role_name() in ('owner', 'management'));
create policy "tasks: employee reads own"
  on tasks for select using (assigned_to = auth.uid());
create policy "tasks: management write"
  on tasks for insert with check (current_role_name() in ('owner', 'management'));
create policy "tasks: management or assignee update"
  on tasks for update using (
    current_role_name() in ('owner', 'management') or assigned_to = auth.uid()
  );

-- ---------- CONTENT ITEMS policies ----------
create policy "content: staff read all"
  on content_items for select using (current_role_name() in ('owner', 'management'));
create policy "content: employee reads assigned"
  on content_items for select using (
    auth.uid() in (assigned_strategist, scriptwriter, videographer, editor, designer, account_manager)
  );
create policy "content: client reads own, approvable stages only"
  on content_items for select using (
    client_id = current_client_id()
    and stage in ('client_approval', 'client_review', 'final_approval', 'published')
  );
create policy "content: management write"
  on content_items for insert with check (current_role_name() in ('owner', 'management'));
create policy "content: management or assigned staff update"
  on content_items for update using (
    current_role_name() in ('owner', 'management')
    or auth.uid() in (assigned_strategist, scriptwriter, videographer, editor, designer, account_manager)
  );

-- ---------- APPROVALS policies ----------
create policy "approvals: staff read"
  on approvals for select using (current_role_name() in ('owner', 'management', 'employee'));
create policy "approvals: client reads own content approvals"
  on approvals for select using (
    content_item_id in (select id from content_items where client_id = current_client_id())
  );
create policy "approvals: any authenticated user inserts their own action"
  on approvals for insert with check (user_id = auth.uid());

-- ---------- ACTIVITY LOG policies (internal only) ----------
create policy "activity: staff read"
  on activity_log for select using (current_role_name() in ('owner', 'management'));
create policy "activity: staff insert"
  on activity_log for insert with check (current_role_name() in ('owner', 'management', 'employee'));

-- ==========================================================
-- Auto-create a profile row when a new auth user signs up
-- (defaults to 'employee' — change role manually in Supabase
-- table editor, or build an admin invite flow later)
-- ==========================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'employee');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
