-- ============================================================
-- schema-fit.sql — جدول‌های تطبیق سایز
-- ------------------------------------------------------------
-- اجرا: Supabase → SQL Editor
-- پیش‌نیاز: schema.sql (جدول‌های products و customers)
-- ============================================================

-- ============================================================
-- ۱. اندازه‌های بدن مشتری
-- ------------------------------------------------------------
-- هر مشتری می‌تواند چند پروفایل داشته باشد (مثلاً «اندازه‌ی
-- خودم» و «اندازه‌ی همسرم»)، ولی یکی فعال است.
-- ============================================================
create table if not exists public.body_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.customers(id) on delete cascade,
  name          text not null default 'اندازه‌های من',

  shoulder_cm   numeric(4,1) check (shoulder_cm between 25 and 70),
  chest_cm      numeric(4,1) check (chest_cm    between 60 and 160),
  waist_cm      numeric(4,1) check (waist_cm    between 50 and 160),
  hip_cm        numeric(4,1) check (hip_cm      between 60 and 170),
  height_cm     numeric(4,1) check (height_cm   between 120 and 220),
  arm_cm        numeric(4,1) check (arm_cm      between 40 and 80),
  inseam_cm     numeric(4,1) check (inseam_cm   between 50 and 110),
  neck_cm       numeric(4,1) check (neck_cm     between 25 and 55),
  thigh_cm      numeric(4,1) check (thigh_cm    between 35 and 90),

  fit_pref      text not null default 'tailored'
                check (fit_pref in ('tight','tailored','relaxed','oversized')),
  is_active     boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_body_user on public.body_profiles(user_id);

-- فقط یک پروفایل فعال برای هر مشتری
create unique index if not exists idx_body_one_active
  on public.body_profiles(user_id) where is_active;

comment on table public.body_profiles is
  'اندازه‌های بدن مشتری — پایه‌ی پیشنهاد سایز';

-- ============================================================
-- ۲. جدول اندازه‌ی هر سایز کالا
-- ============================================================
create table if not exists public.product_sizes (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  label         text not null,

  shoulder_cm   numeric(4,1),
  chest_cm      numeric(4,1),
  waist_cm      numeric(4,1),
  hip_cm        numeric(4,1),
  arm_cm        numeric(4,1),
  length_cm     numeric(4,1),   -- قد کل لباس
  armhole_cm    numeric(4,1),
  neck_cm       numeric(4,1),
  thigh_cm      numeric(4,1),
  inseam_cm     numeric(4,1),

  -- آیا فروشنده خودش وارد کرده یا خودکار ساخته شده؟
  is_generated  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  unique (product_id, label),

  -- دست‌کم دو اندازه لازم است، وگرنه تطبیق بی‌معناست
  constraint chk_min_measures check (
    (case when shoulder_cm is not null then 1 else 0 end) +
    (case when chest_cm    is not null then 1 else 0 end) +
    (case when waist_cm    is not null then 1 else 0 end) +
    (case when hip_cm      is not null then 1 else 0 end) +
    (case when arm_cm      is not null then 1 else 0 end) +
    (case when inseam_cm   is not null then 1 else 0 end) >= 2
  )
);

create index if not exists idx_psize_product on public.product_sizes(product_id, sort_order);

-- ============================================================
-- ۳. سابقه‌ی پیشنهاد سایز — سوخت یادگیری
-- ============================================================
create table if not exists public.size_suggestions (
  id            bigserial primary key,
  user_id       uuid references public.customers(id) on delete set null,
  product_id    uuid references public.products(id) on delete cascade,

  suggested     text not null,
  score         numeric(5,2) not null,
  chosen        text,                    -- چه سایزی واقعاً خرید؟
  fit_pref      text,
  -- بازخورد پس از دریافت: 'good' | 'tight' | 'loose' | null
  outcome       text check (outcome in ('good','tight','loose')),
  created_at    timestamptz default now()
);

create index if not exists idx_ssug_product on public.size_suggestions(product_id, created_at desc);
create index if not exists idx_ssug_user    on public.size_suggestions(user_id, created_at desc);

-- ============================================================
-- ۴. آمار سایز برای فروشنده
-- ------------------------------------------------------------
-- نمای زنده — نیازی به جدول جدا نیست، از سفارش‌ها می‌خوانیم.
-- ============================================================
create or replace view public.seller_size_stats as
select
  p.seller_id,
  p.id                                    as product_id,
  p.name                                  as product_name,
  oi.size                                 as size_label,
  count(*)                                as orders,
  count(*) filter (where o.status in ('returned','canceled')) as returns,
  round(100.0 * count(*) filter (where o.status in ('returned','canceled'))
        / nullif(count(*), 0), 1)         as return_rate,
  -- میانگین نمره‌ی پیشنهاد برای همین سایز
  (select round(avg(s.score), 1) from public.size_suggestions s
    where s.product_id = p.id and s.suggested = oi.size) as avg_score
from public.order_items oi
join public.orders   o on o.id = oi.order_id
join public.products p on p.id = oi.product_id
where oi.size is not null and oi.size <> ''
group by p.seller_id, p.id, p.name, oi.size;

comment on view public.seller_size_stats is
  'آمار فروش و مرجوعی هر سایز — برای پنل فروشنده';

-- ============================================================
-- ۵. پیشنهاد اصلاح جدول سایز
-- ------------------------------------------------------------
-- اگر سایزی مرجوعی بالا دارد، احتمالاً جدولش غلط است.
-- این تابع به فروشنده می‌گوید کجا را اصلاح کند.
-- ============================================================
create or replace function public.size_health(p_seller uuid)
returns table (
  product_id   uuid,
  product_name text,
  size_label   text,
  orders       bigint,
  return_rate  numeric,
  advice       text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.product_id,
    s.product_name,
    s.size_label,
    s.orders,
    s.return_rate,
    case
      when s.orders < 3 then 'داده کم است — هنوز قضاوت نکنید'
      when s.return_rate >= 40 then
        'مرجوعی بالا — اندازه‌های این سایز را دوباره بسنجید'
      when s.return_rate >= 25 then
        'مرجوعی نسبتاً بالا — شاید یک تا دو سانت اختلاف دارد'
      when s.return_rate <= 5 then 'سالم'
      else 'قابل قبول'
    end as advice
  from public.seller_size_stats s
  where s.seller_id = p_seller
  order by s.return_rate desc nulls last, s.orders desc;
$$;

-- ============================================================
-- ۶. امنیت سطر
-- ============================================================
alter table public.body_profiles    enable row level security;
alter table public.product_sizes    enable row level security;
alter table public.size_suggestions enable row level security;

-- اندازه‌های بدن: کاملاً خصوصی
drop policy if exists bp_own on public.body_profiles;
create policy bp_own on public.body_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- جدول سایز: همه می‌خوانند، فقط فروشنده‌ی همان کالا می‌نویسد
drop policy if exists ps_read on public.product_sizes;
create policy ps_read on public.product_sizes for select using (true);

drop policy if exists ps_write on public.product_sizes;
create policy ps_write on public.product_sizes
  for all using (
    exists (select 1 from public.products p
             where p.id = product_id and p.seller_id = auth.uid())
  ) with check (
    exists (select 1 from public.products p
             where p.id = product_id and p.seller_id = auth.uid())
  );

-- سابقه‌ی پیشنهاد: مال خود
drop policy if exists ss_own on public.size_suggestions;
create policy ss_own on public.size_suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
