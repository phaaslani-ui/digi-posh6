-- ============================================================
-- schema-digiai.sql — جدول‌های دیجی AI
-- ------------------------------------------------------------
-- این فایل روی schema.sql اصلی سوار می‌شود و فرض می‌کند
-- جدول‌های `products` و `customers` از قبل هستند.
--
-- اجرا: در Supabase → SQL Editor → این فایل را بچسبانید
-- ============================================================

-- ============================================================
-- ۱. پروفایل سبک مشتری
-- ------------------------------------------------------------
-- نتیجه‌ی آزمون سبک. هر مشتری یک ردیف دارد.
-- ============================================================
create table if not exists public.style_profiles (
  user_id       uuid primary key references public.customers(id) on delete cascade,
  occasion      text,
  style         text,
  palette       text,
  fabric        text,
  budget        text,
  body_type     text,
  -- سلیقه‌ی یادگرفته‌شده از رفتار، نه از آزمون
  learned_colors     jsonb default '{}'::jsonb,
  learned_categories jsonb default '{}'::jsonb,
  signal_count  integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

comment on table public.style_profiles is
  'پروفایل سبک هر مشتری — از آزمون سبک و رفتار واقعی';

-- ============================================================
-- ۲. ست‌های ذخیره‌شده (کمد مجازی)
-- ============================================================
create table if not exists public.outfits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.customers(id) on delete cascade,
  name          text not null default 'ست بدون نام',
  hero_id       uuid references public.products(id) on delete set null,
  -- آرایه‌ای از { product_id, slot, sort }
  items         jsonb not null default '[]'::jsonb,
  occasion      text,
  style         text,
  variant       text,                       -- safe | harmony | bold
  score         integer default 0 check (score between 0 and 100),
  total_price   numeric(15,2) default 0,
  is_favorite   boolean default false,
  is_public     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_outfits_user on public.outfits(user_id, created_at desc);
create index if not exists idx_outfits_public on public.outfits(is_public)
  where is_public = true;
create index if not exists idx_outfits_hero on public.outfits(hero_id);

-- ============================================================
-- ۳. بازخورد کاربر — سوخت حلقه‌ی تقویتی
-- ------------------------------------------------------------
-- مهم‌ترین جدول این پرونده. بدون این، سیستم یاد نمی‌گیرد.
--
-- `breakdown` نمره‌ی هر معیار را نگه می‌دارد تا بعداً بشود
-- فهمید کدام معیار درست پیش‌بینی کرده بود.
-- ============================================================
create table if not exists public.ai_feedback (
  id            bigserial primary key,
  user_id       uuid references public.customers(id) on delete set null,
  session_id    text,
  hero_id       uuid references public.products(id) on delete set null,
  item_ids      uuid[] not null default '{}',
  action        text not null check (action in
                  ('shown','accepted','saved','bought','swapped','ignored')),
  reward        numeric(4,2) not null default 0,
  -- نمره‌ی هر معیار هنگام پیشنهاد: {"color":88,"style":72,...}
  breakdown     jsonb default '{}'::jsonb,
  swapped_out   uuid references public.products(id) on delete set null,
  variant       text,
  created_at    timestamptz default now()
);

create index if not exists idx_fb_user on public.ai_feedback(user_id, created_at desc);
create index if not exists idx_fb_action on public.ai_feedback(action, created_at desc);
create index if not exists idx_fb_hero on public.ai_feedback(hero_id);

comment on column public.ai_feedback.breakdown is
  'نمره‌ی هر معیار هنگام پیشنهاد — برای انتساب اعتبار در یادگیری تقویتی';

-- ============================================================
-- ۴. نمره‌ی هم‌نشینی دو کالا — خودبه‌روزرسان
-- ============================================================
create table if not exists public.compatibility_scores (
  product_a     uuid not null references public.products(id) on delete cascade,
  product_b     uuid not null references public.products(id) on delete cascade,
  score         numeric(8,2) not null default 0,
  observations  integer not null default 0,
  updated_at    timestamptz default now(),
  primary key (product_a, product_b),
  -- ترتیب همیشه یکسان باشد تا جفت تکراری ساخته نشود
  constraint chk_pair_order check (product_a < product_b)
);

create index if not exists idx_compat_a on public.compatibility_scores(product_a, score desc);
create index if not exists idx_compat_b on public.compatibility_scores(product_b, score desc);

-- ============================================================
-- ۵. هم‌نشینی رنگ — دانش انباشته
-- ============================================================
create table if not exists public.color_affinity (
  color_a       text not null,
  color_b       text not null,
  weight        numeric(10,2) not null default 0,
  season        text,
  updated_at    timestamptz default now(),
  primary key (color_a, color_b, season),
  constraint chk_color_order check (color_a <= color_b)
);

-- ============================================================
-- ۶. وزن معیارها — حافظه‌ی حلقه‌ی تقویتی
-- ------------------------------------------------------------
-- یک ردیف برای کل سایت. اگر روزی بخواهید وزن جداگانه برای
-- هر بخش (زنانه، مردانه) داشته باشید، `scope` را عوض کنید.
-- ============================================================
create table if not exists public.ai_weights (
  scope         text primary key default 'global',
  weights       jsonb not null default
                  '{"color":0.30,"style":0.25,"occasion":0.20,"taste":0.15,"budget":0.10}'::jsonb,
  credit        jsonb not null default '{}'::jsonb,
  episodes      integer not null default 0,
  last_tuned_at timestamptz,
  updated_at    timestamptz default now()
);

insert into public.ai_weights (scope) values ('global')
on conflict (scope) do nothing;

-- ============================================================
-- ۷. تاریخچه‌ی مشاوره
-- ============================================================
create table if not exists public.ai_chat (
  id            bigserial primary key,
  user_id       uuid references public.customers(id) on delete cascade,
  session_id    text,
  question      text not null,
  answer        text not null,
  intent        text,          -- color | size | occasion | fabric | outfit | unknown
  product_ids   uuid[] default '{}',
  created_at    timestamptz default now()
);

create index if not exists idx_chat_user on public.ai_chat(user_id, created_at desc);

-- ============================================================
-- ۸. به‌روزرسانی خودکار نمره‌ی هم‌نشینی
-- ------------------------------------------------------------
-- این تابع را می‌شود روزی یک بار با pg_cron صدا زد:
--   select cron.schedule('digiai-nightly', '0 3 * * *',
--     $$ select public.refresh_compatibility(); $$);
-- ============================================================
create or replace function public.refresh_compatibility()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  touched integer := 0;
begin
  -- جفت‌های هم‌سفارش را از سفارش‌های تحویل‌شده استخراج کن
  with pairs as (
    select
      least(a.product_id, b.product_id)    as pa,
      greatest(a.product_id, b.product_id) as pb,
      count(*)                             as n
    from public.order_items a
    join public.order_items b
      on a.order_id = b.order_id
     and a.product_id < b.product_id
    join public.orders o on o.id = a.order_id
    where o.status in ('delivered', 'completed')
      and o.created_at > now() - interval '180 days'
    group by 1, 2
  )
  insert into public.compatibility_scores (product_a, product_b, score, observations, updated_at)
  select pa, pb, n * 10, n, now() from pairs
  on conflict (product_a, product_b) do update
    set score        = public.compatibility_scores.score * 0.85 + excluded.score * 0.15,
        observations = excluded.observations,
        updated_at   = now();

  get diagnostics touched = row_count;

  -- بازخورد منفی نمره را پایین بیاورد
  update public.compatibility_scores cs
     set score = greatest(0, cs.score - 5),
         updated_at = now()
    from public.ai_feedback f
   where f.action = 'swapped'
     and f.created_at > now() - interval '1 day'
     and f.swapped_out is not null
     and (cs.product_a = f.swapped_out or cs.product_b = f.swapped_out);

  return touched;
end;
$$;

comment on function public.refresh_compatibility is
  'هر شب اجرا شود — نمره‌ی هم‌نشینی را از سفارش‌های واقعی به‌روز می‌کند';

-- ============================================================
-- ۹. تنظیم وزن معیارها از بازخورد
-- ------------------------------------------------------------
-- همان الگوریتمی که در dp-brain.js پیاده شده، ولی سمت سرور
-- روی داده‌ی همه‌ی کاربران.
-- ============================================================
create or replace function public.tune_ai_weights()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec        record;
  cur        jsonb;
  nxt        jsonb := '{}'::jsonb;
  keys       text[] := array['color','style','occasion','taste','budget'];
  k          text;
  win        numeric;
  loss       numeric;
  rate       numeric;
  mean_rate  numeric := 0;
  n_rates    integer := 0;
  rates      jsonb := '{}'::jsonb;
  w          numeric;
  total      numeric := 0;
  lr         numeric := 0.06;
begin
  select weights into cur from public.ai_weights where scope = 'global';
  if cur is null then
    cur := '{"color":0.30,"style":0.25,"occasion":0.20,"taste":0.15,"budget":0.10}'::jsonb;
  end if;

  -- گام یک: نرخ موفقیت هر معیار
  foreach k in array keys loop
    select
      coalesce(sum(case when reward > 0 then abs(((breakdown->>k)::numeric - 50) / 50 * reward) end), 0),
      coalesce(sum(case when reward < 0 then abs(((breakdown->>k)::numeric - 50) / 50 * reward) end), 0)
      into win, loss
      from public.ai_feedback
     where created_at > now() - interval '90 days'
       and breakdown ? k
       and abs(((breakdown->>k)::numeric - 50) / 50) >= 0.15;

    if (win + loss) >= 2 then
      rate := win / (win + loss);
      rates := rates || jsonb_build_object(k, rate);
      mean_rate := mean_rate + rate;
      n_rates := n_rates + 1;
    end if;
  end loop;

  -- گام دو: مبنای مقایسه
  if n_rates >= 2 then
    mean_rate := (mean_rate / n_rates) * 0.7 + 0.5 * 0.3;
  else
    mean_rate := 0.5;
  end if;

  -- گام سه: جابه‌جایی وزن‌ها
  foreach k in array keys loop
    w := coalesce((cur->>k)::numeric, 0.2);
    if rates ? k then
      w := w + ((rates->>k)::numeric - mean_rate) * 2 * lr;
    end if;
    w := least(0.45, greatest(0.05, w));
    nxt := nxt || jsonb_build_object(k, w);
    total := total + w;
  end loop;

  -- گام چهار: نرمال‌سازی
  if total > 0 then
    foreach k in array keys loop
      nxt := jsonb_set(nxt, array[k],
        to_jsonb(round(((nxt->>k)::numeric / total)::numeric, 3)));
    end loop;
  end if;

  update public.ai_weights
     set weights = nxt,
         episodes = (select count(*) from public.ai_feedback),
         last_tuned_at = now(),
         updated_at = now()
   where scope = 'global';

  return nxt;
end;
$$;

-- ============================================================
-- ۱۰. امنیت سطر — هر کس فقط داده‌ی خودش
-- ============================================================
alter table public.style_profiles enable row level security;
alter table public.outfits        enable row level security;
alter table public.ai_feedback    enable row level security;
alter table public.ai_chat        enable row level security;

-- پروفایل سبک
drop policy if exists sp_own on public.style_profiles;
create policy sp_own on public.style_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ست‌ها: خودم + ست‌های عمومی دیگران
drop policy if exists of_own on public.outfits;
create policy of_own on public.outfits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists of_public_read on public.outfits;
create policy of_public_read on public.outfits
  for select using (is_public = true);

-- بازخورد: فقط نوشتن و خواندن مال خود
drop policy if exists fb_own on public.ai_feedback;
create policy fb_own on public.ai_feedback
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- گفت‌وگو
drop policy if exists chat_own on public.ai_chat;
create policy chat_own on public.ai_chat
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- جدول‌های دانش عمومی‌اند (فقط خواندن)
alter table public.compatibility_scores enable row level security;
drop policy if exists cs_read on public.compatibility_scores;
create policy cs_read on public.compatibility_scores for select using (true);

alter table public.color_affinity enable row level security;
drop policy if exists ca_read on public.color_affinity;
create policy ca_read on public.color_affinity for select using (true);

alter table public.ai_weights enable row level security;
drop policy if exists aw_read on public.ai_weights;
create policy aw_read on public.ai_weights for select using (true);

-- ============================================================
-- ۱۱. نمای گزارش برای پنل مدیریت
-- ============================================================
create or replace view public.ai_stats as
select
  (select count(*) from public.ai_feedback)                         as total_feedback,
  (select count(*) from public.ai_feedback where action = 'bought') as bought,
  (select count(*) from public.ai_feedback where action = 'accepted') as accepted,
  (select count(*) from public.ai_feedback where action = 'swapped') as swapped,
  (select count(*) from public.outfits)                             as saved_outfits,
  (select count(*) from public.style_profiles)                      as profiles,
  (select count(*) from public.compatibility_scores)                as known_pairs,
  (select weights from public.ai_weights where scope = 'global')    as weights,
  (select
     round(100.0 * count(*) filter (where action in ('bought','accepted'))
       / nullif(count(*) filter (where action = 'shown'), 0), 1)
   from public.ai_feedback)                                          as accept_rate;

comment on view public.ai_stats is 'خلاصه‌ی وضعیت دیجی AI برای پنل مدیریت';

-- ============================================================
-- ۱۲. افزودن به نمره‌ی هم‌نشینی
-- ------------------------------------------------------------
-- `upsert` معمولی نمره را **جایگزین** می‌کند، ولی ما باید
-- آن را **جمع** کنیم. پس تابع جدا لازم است.
--
-- این تابع را `/api/ai/feedback` صدا می‌زند.
-- ============================================================
create or replace function public.bump_compatibility(
  pairs jsonb,
  delta numeric default 0
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  item    jsonb;
  a       uuid;
  b       uuid;
  s       numeric;
  n       integer := 0;
begin
  if pairs is null or jsonb_typeof(pairs) <> 'array' then
    return 0;
  end if;

  for item in select * from jsonb_array_elements(pairs) loop
    begin
      a := (item->>'product_a')::uuid;
      b := (item->>'product_b')::uuid;
      s := coalesce((item->>'score')::numeric, delta);
    exception when others then
      continue;   -- ردیف خراب را رد کن، بقیه را خراب نکن
    end;

    if a is null or b is null or a = b then
      continue;
    end if;

    -- ترتیب همیشه یکسان، وگرنه قید جدول می‌شکند
    if a > b then
      declare tmp uuid; begin tmp := a; a := b; b := tmp; end;
    end if;

    insert into public.compatibility_scores (product_a, product_b, score, observations, updated_at)
    values (a, b, greatest(0, s), 1, now())
    on conflict (product_a, product_b) do update
      set score        = greatest(0, public.compatibility_scores.score + s),
          observations = public.compatibility_scores.observations + 1,
          updated_at   = now();

    n := n + 1;
  end loop;

  return n;
end;
$$;

comment on function public.bump_compatibility is
  'نمره‌ی هم‌نشینی را جمع می‌کند (نه جایگزین) — از /api/ai/feedback صدا زده می‌شود';
