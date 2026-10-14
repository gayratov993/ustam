-- ============================================================
-- WorkUp — Supabase Database Schema + Row Level Security
-- Ishga tushirish: Supabase SQL Editor → bu faylni yozing va Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES (auth.users bilan bog'langan)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text check (role in ('worker', 'employer', 'admin')) default 'worker',
  city text,
  district text,
  bio text,
  hourly_rate numeric,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CATEGORIES (kasb kategoriyalari)
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_uz text not null,
  name_ru text not null,
  name_en text not null,
  icon text,
  created_at timestamptz default now()
);

create unique index if not exists categories_name_en_key on public.categories (name_en);

-- ------------------------------------------------------------
-- WORKER_CATEGORIES (ishchi ↔ kategoriya)
-- ------------------------------------------------------------
create table if not exists public.worker_categories (
  worker_id uuid references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id) on delete cascade,
  primary key (worker_id, category_id)
);

-- ------------------------------------------------------------
-- JOBS (ish e'lonlari)
-- ------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.profiles (id) on delete cascade not null,
  title text not null,
  description text,
  category_id uuid references public.categories (id),
  city text,
  district text,
  price numeric not null default 0,
  price_type text check (price_type in ('fixed', 'negotiable', 'per_day')) default 'fixed',
  workers_needed int default 1 check (workers_needed >= 1),
  date_needed date,
  status text check (status in ('open', 'in_progress', 'completed', 'cancelled')) default 'open',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- WORKER_ADS (ishchi e'lonlari — ishchi o'z xizmatini taklif qiladi)
-- ------------------------------------------------------------
create table if not exists public.worker_ads (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references public.profiles (id) on delete cascade not null,
  category_id uuid references public.categories (id) on delete set null,
  title text not null,
  description text,
  price numeric default 0,
  price_type text check (price_type in ('per_hour', 'per_day', 'fixed', 'negotiable')) default 'negotiable',
  city text,
  district text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists worker_ads_worker_idx on public.worker_ads (worker_id);
create index if not exists worker_ads_category_idx on public.worker_ads (category_id);

-- ------------------------------------------------------------
-- APPLICATIONS (zayavkalar)
-- ------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete cascade not null,
  worker_id uuid references public.profiles (id) on delete cascade not null,
  message text,
  proposed_price numeric,
  status text check (status in ('pending', 'accepted', 'rejected', 'cancelled')) default 'pending',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- REVIEWS (reyting / sharhlar)
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete cascade not null,
  reviewer_id uuid references public.profiles (id) on delete cascade not null,
  reviewee_id uuid references public.profiles (id) on delete cascade not null,
  rating int check (rating between 1 and 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique (job_id, reviewer_id)
);

-- ------------------------------------------------------------
-- NOTIFICATIONS (bildirishnomalar)
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade not null,
  type text,
  content text,
  ref_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- CHAT (ixtiyoriy, MVP keyin) — shu bilan realtime xabarlar
-- ------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles (id) on delete cascade not null,
  receiver_id uuid references public.profiles (id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists messages_sender_idx on public.messages (sender_id);
create index if not exists messages_receiver_idx on public.messages (receiver_id);

-- Realtime: xabarlar sahifani yangilamasdan jonli kelishi uchun
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ------------------------------------------------------------
-- TRIGGER: yangi auth user yaratilganda profile avtomatik yaratiladi
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    case
      when new.raw_user_meta_data->>'role' in ('worker', 'employer', 'admin')
        then new.raw_user_meta_data->>'role'
      else 'worker'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- TRIGGER: yangi zayavka kelganda ish beruvchiga bildirishnoma
-- (RLS ni chetlab o'tish uchun security definer)
-- ------------------------------------------------------------
create or replace function public.notify_new_application()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  employer uuid;
begin
  select employer_id into employer from public.jobs where id = new.job_id;
  if employer is not null then
    insert into public.notifications (user_id, type, content, ref_id)
    values (employer, 'new_application', 'new_application', new.job_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_created on public.applications;
create trigger on_application_created
  after insert on public.applications
  for each row execute function public.notify_new_application();

-- ------------------------------------------------------------
-- TRIGGER: zayavka holati o'zgarganda ishchiga bildirishnoma
-- ------------------------------------------------------------
create or replace function public.notify_application_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.status in ('accepted', 'rejected') then
    insert into public.notifications (user_id, type, content, ref_id)
    values (
      new.worker_id,
      case when new.status = 'accepted' then 'application_accepted' else 'application_rejected' end,
      case when new.status = 'accepted' then 'application_accepted' else 'application_rejected' end,
      new.job_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_status_changed on public.applications;
create trigger on_application_status_changed
  after update on public.applications
  for each row execute function public.notify_application_status();

-- ------------------------------------------------------------
-- IDENTIFIKATSION SO'ROVLAR: kategoriyalar, o'rtacha reyting
-- ------------------------------------------------------------
create or replace function public.get_worker_rating(worker uuid)
returns table (avg_rating numeric, review_count bigint)
language sql stable
as $$
  select coalesce(avg(rating), 0)::numeric(2,1), count(*)
  from public.reviews
  where reviewee_id = worker;
$$;

-- Ishchi bajargan ishlar soni (RLS ni chetlab o'tib hamma ko'ra oladi)
create or replace function public.get_worker_completed_jobs(worker uuid)
returns bigint
language sql stable security definer set search_path = public
as $$
  select count(*)
  from public.applications
  where worker_id = worker and status = 'accepted';
$$;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.worker_categories enable row level security;
alter table public.worker_ads enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;

-- PROFILES: hamma o'qiydi, egasi tahrirlaydi
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- CATEGORIES: hamma o'qiydi
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories for select using (true);

-- WORKER_CATEGORIES: egasi boshqaradi, hamma o'qiydi
drop policy if exists "worker_categories_select" on public.worker_categories;
create policy "worker_categories_select" on public.worker_categories for select using (true);
drop policy if exists "worker_categories_insert" on public.worker_categories;
create policy "worker_categories_insert" on public.worker_categories for insert with check (auth.uid() = worker_id);
drop policy if exists "worker_categories_delete" on public.worker_categories;
create policy "worker_categories_delete" on public.worker_categories for delete using (auth.uid() = worker_id);

-- WORKER_ADS: hamma o'qiydi, egasi yaratadi/tahrirlaydi/o'chiradi
drop policy if exists "worker_ads_select" on public.worker_ads;
create policy "worker_ads_select" on public.worker_ads for select using (true);
drop policy if exists "worker_ads_insert" on public.worker_ads;
create policy "worker_ads_insert" on public.worker_ads for insert with check (auth.uid() = worker_id);
drop policy if exists "worker_ads_update" on public.worker_ads;
create policy "worker_ads_update" on public.worker_ads for update using (auth.uid() = worker_id);
drop policy if exists "worker_ads_delete" on public.worker_ads;
create policy "worker_ads_delete" on public.worker_ads for delete using (auth.uid() = worker_id);

-- JOBS: hamma o'qiydi, egasi yaratadi/tahrirlaydi/o'chiradi
drop policy if exists "jobs_select" on public.jobs;
create policy "jobs_select" on public.jobs for select using (true);
drop policy if exists "jobs_insert" on public.jobs;
create policy "jobs_insert" on public.jobs for insert with check (auth.uid() = employer_id);
drop policy if exists "jobs_update" on public.jobs;
create policy "jobs_update" on public.jobs for update using (auth.uid() = employer_id);
drop policy if exists "jobs_delete" on public.jobs;
create policy "jobs_delete" on public.jobs for delete using (auth.uid() = employer_id);

-- APPLICATIONS: job egasi va zayavka egasi ko'radi/yozadi
drop policy if exists "applications_select" on public.applications;
create policy "applications_select" on public.applications for select using (
  auth.uid() = worker_id or
  auth.uid() in (select employer_id from public.jobs where id = job_id)
);
drop policy if exists "applications_insert" on public.applications;
create policy "applications_insert" on public.applications for insert with check (auth.uid() = worker_id);
drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications for update using (
  auth.uid() = worker_id or
  auth.uid() in (select employer_id from public.jobs where id = job_id)
);

-- REVIEWS: hamma o'qiydi, faqat job ishtirokchilari yozadi
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select using (true);
drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews for insert with check (
  exists (
    select 1 from public.jobs j
    where j.id = job_id
      and j.status = 'completed'
      and (auth.uid() = j.employer_id or auth.uid() in (select worker_id from public.applications where job_id = j.id and status = 'accepted'))
  ) and auth.uid() = reviewer_id and auth.uid() <> reviewee_id
);

-- NOTIFICATIONS: faqat egasi ko'radi
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications for insert with check (auth.uid() = user_id);
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update using (auth.uid() = user_id);

-- MESSAGES: faqat qatnashchilar
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);
drop policy if exists "messages_update" on public.messages;
create policy "messages_update" on public.messages for update using (
  auth.uid() = receiver_id
) with check (
  auth.uid() = receiver_id
);

-- ------------------------------------------------------------
-- STORAGE BUCKETS
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('job-images', 'job-images', true) on conflict do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars_public_insert" on storage.objects;
create policy "avatars_public_insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "avatars_public_update" on storage.objects;
create policy "avatars_public_update" on storage.objects for update using (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "avatars_public_delete" on storage.objects;
create policy "avatars_public_delete" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "job_images_public_read" on storage.objects;
create policy "job_images_public_read" on storage.objects for select using (bucket_id = 'job-images');
drop policy if exists "job_images_public_insert" on storage.objects;
create policy "job_images_public_insert" on storage.objects for insert with check (bucket_id = 'job-images' and auth.uid() is not null);
drop policy if exists "job_images_public_update" on storage.objects;
create policy "job_images_public_update" on storage.objects for update using (bucket_id = 'job-images' and auth.uid() is not null);
drop policy if exists "job_images_public_delete" on storage.objects;
create policy "job_images_public_delete" on storage.objects for delete using (bucket_id = 'job-images' and auth.uid() is not null);

-- ------------------------------------------------------------
-- SEED: boshlang'ich kategoriyalar
-- ------------------------------------------------------------
insert into public.categories (name_uz, name_ru, name_en, icon) values
  ('Quruvchi', 'Строитель', 'Builder', 'hammer'),
  ('Santexnik', 'Сантехник', 'Plumber', 'wrench'),
  ('Elektrik', 'Электрик', 'Electrician', 'zap'),
  ('Tozalovchi', 'Уборщик', 'Cleaner', 'sparkles'),
  ('Yuk tashuvchi', 'Грузчик', 'Loader', 'truck'),
  ('Bog''bon', 'Садовник', 'Gardener', 'flower'),
  ('Haydovchi', 'Водитель', 'Driver', 'car'),
  ('Oshpaz', 'Повар', 'Cook', 'chef'),
  ('Tikuvchi', 'Швея', 'Tailor', 'scissors'),
  ('Bo''yoqchi', 'Маляр', 'Painter', 'paint'),
  ('Payvandchi', 'Сварщик', 'Welder', 'flame'),
  ('Usta (remont)', 'Мастер (ремонт)', 'Handyman', 'tools')
on conflict (name_en) do nothing;
