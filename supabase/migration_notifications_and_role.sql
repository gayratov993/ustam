-- ============================================================
-- Ustam — mavjud bazaga qo'llanadigan tuzatishlar (migration)
-- Supabase SQL Editor → bu faylni yozing va Run.
-- schema.sql ni qaytadan ishga tushirmasangiz ham bo'ladi.
-- ============================================================

-- 1) Yangi foydalanuvchi profili role'ni ham metadata'dan olsin.
--    (Email tasdiqlash yoqilganda Register'dagi updateProfile ishlamaydi,
--     shu sababli employer roli yo'qolib qolardi.)
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

-- 2) Bildirishnomalarni DB trigger orqali yaratish.
--    Ilgari client boshqa user uchun notification insert qilardi va
--    RLS (auth.uid() = user_id) uni bloklardi — bildirishnoma hech qachon
--    yetib bormasdi. Endi security definer funksiya orqali yaratiladi.
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

-- 3) Ishchi bajargan ishlar soni (RLS ni chetlab o'tadi).
create or replace function public.get_worker_completed_jobs(worker uuid)
returns bigint
language sql stable security definer set search_path = public
as $$
  select count(*)
  from public.applications
  where worker_id = worker and status = 'accepted';
$$;

-- 4) Kategoriya nomining takrorlanishini oldini olish (seed idempotent bo'lsin).
--    Agar allaqachon dublikat bo'lsa, avval quyidagi qatorni ishlatib tozalang:
--    delete from public.categories a using public.categories b
--      where a.ctid < b.ctid and a.name_en = b.name_en;
create unique index if not exists categories_name_en_key on public.categories (name_en);

-- 5) Ilgari seed qilingan DEMO ishchi e'lonlarini o'chirish.
--    Faqat real akkauntlar yaratgan e'lonlar qoladi.
delete from public.worker_ads
where title in (
  'Qurilish ishlarini bajaraman',
  'Elektromontaj ishlari',
  'Santexnika xizmatlari',
  'Uy va ofis tozalash xizmati',
  'Payvandlash ishlari',
  'Bog'' va ko''kalamzorlashtirish'
);

-- 6) Chat uchun realtime. `messages` jadvalini realtime publikatsiyasiga
--    qo'shamiz — shundan keyin yangi xabarlar sahifani yangilamasdan,
--    jonli (realtime) keladi. Allaqachon qo'shilgan bo'lsa xato bermaydi.
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

-- 7) Xabarni "o'qilgan" deb belgilash uchun UPDATE policy.
--    Busiz receiver is_read=true ni yangilay olmasdi (RLS jimgina bloklar
--    edi) va chatda o'qilmagan xabarlar doim qolib ketardi.
drop policy if exists "messages_update" on public.messages;
create policy "messages_update" on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- 8) Storage bucket'lar (avatar va e'lon rasmlari). Faqat schema.sql
--    ishga tushirilgan bo'lsa yaratilgan edi — endi migration ham yaratadi.
--    Bucket yo'q bo'lsa rasm yuklash "Bucket not found" xatosi bilan
--    ishlamay qolardi.
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('job-images', 'job-images', true)
  on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "avatars_public_insert" on storage.objects;
create policy "avatars_public_insert" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "avatars_public_update" on storage.objects;
create policy "avatars_public_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid() is not null);
drop policy if exists "avatars_public_delete" on storage.objects;
create policy "avatars_public_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid() is not null);

drop policy if exists "job_images_public_read" on storage.objects;
create policy "job_images_public_read" on storage.objects
  for select using (bucket_id = 'job-images');
drop policy if exists "job_images_public_insert" on storage.objects;
create policy "job_images_public_insert" on storage.objects
  for insert with check (bucket_id = 'job-images' and auth.uid() is not null);
drop policy if exists "job_images_public_update" on storage.objects;
create policy "job_images_public_update" on storage.objects
  for update using (bucket_id = 'job-images' and auth.uid() is not null);
drop policy if exists "job_images_public_delete" on storage.objects;
create policy "job_images_public_delete" on storage.objects
  for delete using (bucket_id = 'job-images' and auth.uid() is not null);

-- 9) Ishchi reytingi (o'rtacha baho + sharhlar soni). profileApi va
--    applicationsApi shu RPC'ni chaqiradi, lekin u faqat schema.sql'da
--    bor edi — migration bilan qo'shilmasa reyting/sharlar doim 0 ko'rinardi.
create or replace function public.get_worker_rating(worker uuid)
returns table (avg_rating numeric, review_count bigint)
language sql stable
as $$
  select coalesce(avg(rating), 0)::numeric(2,1), count(*)
  from public.reviews
  where reviewee_id = worker;
$$;


