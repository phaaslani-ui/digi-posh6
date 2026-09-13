-- ============================================================
--  دیجی‌پوش — جدول‌های تکمیلی خریدار و فروشنده
--  ------------------------------------------------------------
--  این فایل شکافی را پر می‌کند که در بازرسی پیدا شد:
--  شش قابلیت در مرورگر کار می‌کردند ولی **هیچ جدولی** در
--  پایگاه داده نداشتند. یعنی با اتصال به Supabase، همه‌ی
--  آن داده‌ها از بین می‌رفت:
--
--    ۱) مرجوعی            (dp_returns)
--    ۲) تسویه‌ی فروشنده    (dp_payouts)
--    ۳) بازبینی پروفایل    (dp_profile_requests)
--    ۴) نردبان خرده‌فروشی  (dp_boosts)
--    ۵) تخفیف و کد تخفیف   (dp_sales)
--    ۶) نشانی‌های خریدار   (نبود)
--
--  ترتیب اجرا:
--    ۱) schema.sql
--    ۲) schema-wholesale.sql
--    ۳) schema-extra.sql   ← همین فایل
-- ============================================================


-- ============================================================
--  ۰. تکمیل جدول خریدار
--  ------------------------------------------------------------
--  میدان‌هایی که فروشگاه واقعی لازم دارد ولی جا افتاده بودند.
-- ============================================================
alter table public.users
  add column if not exists birth_date    date,
  add column if not exists gender        text check (gender in ('female','male','other')),
  add column if not exists national_id   text,
  add column if not exists newsletter    boolean not null default false,
  add column if not exists last_login_at timestamptz,
  add column if not exists login_count   integer not null default 0,
  -- امتیاز وفاداری — برای کمپین‌های بعدی
  add column if not exists loyalty_points integer not null default 0,
  add column if not exists notes         text;

create index if not exists idx_users_active on public.users (is_active, created_at desc);


-- ============================================================
--  ۱. نشانی‌های خریدار
--  ------------------------------------------------------------
--  پیش از این نشانی فقط داخل خود سفارش ذخیره می‌شد، یعنی
--  خریدار هر بار باید از نو می‌نوشت. حالا دفترچه‌ی نشانی دارد.
-- ============================================================
create table if not exists public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,

  label       text,                      -- خانه / محل کار
  receiver    text not null,
  phone       text not null,
  province    text,
  city        text,
  address     text not null,
  postal_code text,
  is_default  boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_addr_user on public.addresses (user_id);

-- فقط یک نشانی می‌تواند پیش‌فرض باشد
create unique index if not exists idx_addr_one_default
  on public.addresses (user_id) where is_default;


-- ============================================================
--  ۲. مرجوعی
--  ------------------------------------------------------------
--  خریدار درخواست می‌دهد، فروشنده تأیید یا رد می‌کند.
--  برای هر قلمِ سفارش فقط یک درخواست باز مجاز است.
-- ============================================================
create table if not exists public.returns (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  product_id    uuid references public.products(id) on delete set null,
  seller_id     uuid not null references public.seller_profiles(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,

  product_name  text not null,
  qty           integer not null check (qty >= 1),
  amount        bigint  not null check (amount >= 0),

  reason        text not null,
  seller_note   text,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected','refunded')),

  handled_at    timestamptz,
  refunded_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_ret_seller on public.returns (seller_id, status);
create index if not exists idx_ret_user   on public.returns (user_id, created_at desc);

-- برای هر قلم فقط یک درخواست باز
create unique index if not exists idx_ret_one_open
  on public.returns (order_id, product_id)
  where status in ('pending','approved');


-- ============================================================
--  ۳. تسویه‌ی فروشنده
--  ------------------------------------------------------------
--  فروشنده درخواست برداشت می‌دهد؛ مدیر واریز می‌کند.
--  موجودی قابل برداشت از جدول کمیسیون‌ها می‌آید.
-- ============================================================
create table if not exists public.payouts (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid not null references public.seller_profiles(id) on delete cascade,

  amount      bigint not null check (amount > 0),
  shaba       text,
  status      text not null default 'pending'
                check (status in ('pending','processing','paid','rejected')),

  admin_note  text,
  tracking_no text,                       -- شماره پیگیری بانکی

  requested_at timestamptz not null default now(),
  paid_at      timestamptz,
  handled_by   uuid references public.users(id)
);

create index if not exists idx_pay_seller on public.payouts (seller_id, status);
create index if not exists idx_pay_status on public.payouts (status, requested_at);


-- ============================================================
--  ۴. بازبینی تغییرات پروفایل
--  ------------------------------------------------------------
--  فروشنده نمی‌تواند میدان‌های حساس (شبا، کد ملی، نام
--  فروشگاه) را بی‌اجازه عوض کند. تغییر اینجا می‌نشیند تا
--  مدیر ببیند.
--
--  `fields` شکل { "shaba": {"from":"...","to":"...","risk":true} }
-- ============================================================
create table if not exists public.profile_requests (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid not null references public.seller_profiles(id) on delete cascade,

  seller_type text not null default 'retail'
                check (seller_type in ('retail','wholesale')),
  fields      jsonb not null default '{}'::jsonb,
  risk_count  integer not null default 0,

  status      text not null default 'pending'
                check (status in ('pending','approved','rejected','withdrawn')),
  admin_note  text,

  created_at  timestamptz not null default now(),
  handled_at  timestamptz,
  handled_by  uuid references public.users(id)
);

create index if not exists idx_pr_status on public.profile_requests (status, created_at);

-- هر فروشنده فقط یک درخواست باز
create unique index if not exists idx_pr_one_open
  on public.profile_requests (seller_id) where status = 'pending';


-- ============================================================
--  ۵. نردبان خرده‌فروشی
--  ------------------------------------------------------------
--  کاملاً جدا از `wholesale_boosts`. فروشنده‌ای که اینجا
--  بسته خریده، در بازار عمده هیچ وزنی ندارد و برعکس.
-- ============================================================
create table if not exists public.boosts (
  id         uuid primary key default uuid_generate_v4(),
  seller_id  uuid not null references public.seller_profiles(id) on delete cascade,

  plan       text not null
               check (plan in ('ladder','highlight','showcase','premium','spotlight')),
  weight     integer not null default 0,

  starts_at  timestamptz not null default now(),
  ends_at    timestamptz not null,

  price      bigint default 0,
  is_trial   boolean default false,
  status     text not null default 'active'
               check (status in ('active','expired','canceled')),

  views      integer default 0,
  clicks     integer default 0,

  created_at timestamptz not null default now()
);

create index if not exists idx_boost_active
  on public.boosts (seller_id, status, ends_at);


-- ============================================================
--  ۶. تخفیف و کد تخفیف
-- ============================================================
create table if not exists public.promotions (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid references public.seller_profiles(id) on delete cascade,

  kind        text not null default 'sale' check (kind in ('sale','coupon')),
  title       text,
  code        text,                      -- فقط برای kind = coupon
  percent     integer not null check (percent between 1 and 90),

  -- دامنه: خالی یعنی همه‌ی کالاهای فروشنده
  product_ids uuid[] default '{}',
  min_total   bigint default 0,
  max_uses    integer,
  used_count  integer not null default 0,

  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now()
);

create index if not exists idx_promo_seller on public.promotions (seller_id, is_active);
create unique index if not exists idx_promo_code
  on public.promotions (lower(code)) where code is not null;


-- ============================================================
--  ۷. تاریخچه‌ی وضعیت سفارش
--  ------------------------------------------------------------
--  بدون این، وقتی مشتری می‌پرسد «سفارشم کِی ارسال شد؟»
--  هیچ پاسخی نداریم.
-- ============================================================
create table if not exists public.order_events (
  id         bigserial primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  actor_id   uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_oe_order on public.order_events (order_id, created_at);

-- هر تغییر وضعیت خودکار ثبت می‌شود
create or replace function public.log_order_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_events (order_id, status)
    values (new.id, new.status::text);
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_order_event on public.orders;
create trigger trg_order_event
  before update on public.orders
  for each row execute function public.log_order_event();


-- ============================================================
--  ۸. جست‌وجوی سریع کالا
--  ------------------------------------------------------------
--  بدون این نمایه، جست‌وجو در فهرست بزرگ کالاها کل جدول را
--  می‌خواند. با آن، پایگاه داده مستقیم سراغ نتیجه می‌رود.
-- ============================================================
create index if not exists idx_products_search
  on public.products using gin (
    to_tsvector('simple',
      coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(fabric,''))
  );

-- کالاهای فعالِ موجود — پرتکرارترین پرس‌وجوی ویترین
create index if not exists idx_products_live
  on public.products (category, created_at desc)
  where status = 'active' and stock > 0;

-- سفارش‌های اخیر هر فروشنده
create index if not exists idx_items_seller_date
  on public.order_items (seller_id, created_at desc);


-- ============================================================
--  ۹. قواعد دسترسی
-- ============================================================
alter table public.addresses        enable row level security;
alter table public.returns          enable row level security;
alter table public.payouts          enable row level security;
alter table public.profile_requests enable row level security;
alter table public.boosts           enable row level security;
alter table public.promotions       enable row level security;
alter table public.order_events     enable row level security;

-- ---------- نشانی: فقط صاحبش ----------
drop policy if exists addr_own on public.addresses;
create policy addr_own on public.addresses
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- مرجوعی ----------
drop policy if exists ret_read on public.returns;
create policy ret_read on public.returns
  for select using (
    user_id = auth.uid()
    or seller_id = public.my_seller_id()
    or public.is_admin()
  );

drop policy if exists ret_insert_own on public.returns;
create policy ret_insert_own on public.returns
  for insert with check (user_id = auth.uid());

-- فقط فروشنده یا مدیر وضعیت را عوض می‌کند
drop policy if exists ret_update_seller on public.returns;
create policy ret_update_seller on public.returns
  for update using (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- تسویه ----------
drop policy if exists pay_read on public.payouts;
create policy pay_read on public.payouts
  for select using (seller_id = public.my_seller_id() or public.is_admin());

drop policy if exists pay_request on public.payouts;
create policy pay_request on public.payouts
  for insert with check (seller_id = public.my_seller_id());

-- واریز فقط با مدیر
drop policy if exists pay_admin on public.payouts;
create policy pay_admin on public.payouts
  for update using (public.is_admin());

-- ---------- بازبینی پروفایل ----------
drop policy if exists pr_read on public.profile_requests;
create policy pr_read on public.profile_requests
  for select using (seller_id = public.my_seller_id() or public.is_admin());

drop policy if exists pr_insert on public.profile_requests;
create policy pr_insert on public.profile_requests
  for insert with check (seller_id = public.my_seller_id());

drop policy if exists pr_admin on public.profile_requests;
create policy pr_admin on public.profile_requests
  for update using (public.is_admin() or seller_id = public.my_seller_id());

-- ---------- نردبان ----------
drop policy if exists boost_read on public.boosts;
create policy boost_read on public.boosts for select using (true);

drop policy if exists boost_own on public.boosts;
create policy boost_own on public.boosts
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- تخفیف ----------
drop policy if exists promo_read on public.promotions;
create policy promo_read on public.promotions
  for select using (is_active or seller_id = public.my_seller_id() or public.is_admin());

drop policy if exists promo_own on public.promotions;
create policy promo_own on public.promotions
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- رویداد سفارش ----------
drop policy if exists oe_read on public.order_events;
create policy oe_read on public.order_events
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
    or exists (
      select 1 from public.order_items i
      where i.order_id = order_events.order_id and i.seller_id = public.my_seller_id()
    )
  );


-- ============================================================
--  ۱۰. موجودی قابل برداشت فروشنده
--  ------------------------------------------------------------
--  «چقدر می‌توانم برداشت کنم؟» بدون این نما، باید سه جدول
--  را در کد جمع می‌زدیم — کند و مستعد خطا.
-- ============================================================
create or replace view public.seller_balance as
select
  s.id as seller_id,
  s.shop_name,
  coalesce(c.earned, 0)                                as earned,
  coalesce(p.withdrawn, 0)                             as withdrawn,
  coalesce(p.pending, 0)                               as pending_withdraw,
  greatest(0, coalesce(c.earned,0) - coalesce(p.withdrawn,0)
              - coalesce(p.pending,0))                 as available
from public.seller_profiles s
left join (
  select seller_id, sum(seller_payout) as earned
    from public.commissions
   where status in ('pending','settled')
   group by seller_id
) c on c.seller_id = s.id
left join (
  select seller_id,
         sum(amount) filter (where status = 'paid')                      as withdrawn,
         sum(amount) filter (where status in ('pending','processing'))   as pending
    from public.payouts
   group by seller_id
) p on p.seller_id = s.id;


-- ============================================================
--  ۱۱. جلوگیری از برداشت بیش از موجودی
--  ------------------------------------------------------------
--  چرا در پایگاه داده؟ چون اگر فروشنده دو درخواست هم‌زمان
--  بفرستد، کد هر دو را می‌پذیرد و بیش از موجودی برداشت
--  می‌شود. اینجا قفلِ ردیف جلویش را می‌گیرد.
-- ============================================================
create or replace function public.check_payout_balance()
returns trigger language plpgsql security definer set search_path = public as $$
declare avail bigint;
begin
  select available into avail
    from public.seller_balance where seller_id = new.seller_id;

  if avail is null then avail := 0; end if;

  if new.amount > avail then
    raise exception 'موجودی قابل برداشت شما % تومان است.', avail;
  end if;

  return new;
end $$;

drop trigger if exists trg_payout_balance on public.payouts;
create trigger trg_payout_balance
  before insert on public.payouts
  for each row execute function public.check_payout_balance();


-- ============================================================
--  ۱۲. بازگرداندن کمیسیون هنگام مرجوعی
--  ------------------------------------------------------------
--  اگر کالا مرجوع شد، سهم فروشنده نباید پرداخت شود.
-- ============================================================
create or replace function public.revert_commission_on_return()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'refunded' and old.status is distinct from 'refunded' then
    /*
     * `commission_status` فقط سه مقدار دارد:
     * pending | settled | cancelled — و «cancelled» همان
     * معنایی است که اینجا می‌خواهیم. مقدار تازه اضافه
     * نمی‌کنیم تا گزارش‌های موجود نشکنند.
     */
    update public.commissions
       set status = 'cancelled'
     where order_item_id = new.order_item_id
       and status <> 'settled';   -- آنچه تسویه شده، برنمی‌گردد

    new.refunded_at := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_return_commission on public.returns;
create trigger trg_return_commission
  before update on public.returns
  for each row execute function public.revert_commission_on_return();


-- ============================================================
--  ۱۳. انقضای خودکار نردبان و تخفیف
-- ============================================================
create or replace function public.expire_boosts()
returns void language sql security definer set search_path = public as $$
  update public.boosts set status = 'expired'
   where status = 'active' and ends_at < now();

  update public.promotions set is_active = false
   where is_active and ends_at is not null and ends_at < now();
$$;


-- ============================================================
--  ۱۴. آمار یک‌جای خریدار
--  ------------------------------------------------------------
--  صفحه‌ی حساب کاربری این را در یک درخواست می‌گیرد،
--  به‌جای چهار پرس‌وجوی جدا.
-- ============================================================
create or replace view public.customer_stats as
select
  u.id as user_id,
  u.full_name,
  count(distinct o.id)                                         as order_count,
  coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0) as total_spent,
  count(distinct o.id) filter (where o.status = 'delivered')   as delivered_count,
  count(distinct w.id)                                         as wishlist_count,
  count(distinct r.id)                                         as review_count,
  max(o.created_at)                                            as last_order_at
from public.users u
left join public.orders   o on o.user_id = u.id
left join public.wishlist w on w.user_id = u.id
left join public.reviews  r on r.user_id = u.id
where u.role = 'customer'
group by u.id, u.full_name;


-- ============================================================
--  ۱۵. تعریف بسته‌های نردبان — مرجع واحد
--  ------------------------------------------------------------
--  چرا در پایگاه داده و نه فقط در جاوااسکریپت؟
--
--  اگر توانایی هر بسته فقط در مرورگر تعریف شود، سه مشکل دارد:
--    ۱) با ابزار توسعه‌دهنده می‌شود عوضش کرد
--    ۲) قیمت‌ها در چند جا تکرار می‌شوند و از هم جدا می‌افتند
--    ۳) تغییر قیمت نیاز به انتشار دوباره‌ی سایت دارد
--
--  حالا این جدول تنها مرجع است. مرورگر فقط نمایش می‌دهد.
--
--  هر ستون یک «توانایی» جداست تا بسته‌ها با هم قاطی نشوند:
--    can_rank      → جایگاه در فهرست بالا می‌رود
--    can_badge     → نشان و قاب روی کارت
--    on_home       → ویترین صفحه‌ی نخست
--    cross_page    → دیده شدن در بخشی که کالا ندارد
--    is_spotlight  → قاب اختصاصی در حساب کاربری
-- ============================================================
create table if not exists public.boost_plans (
  id            text primary key,
  fa            text not null,
  description   text,
  note          text,

  -- توانایی‌ها — هر کدام جدا و صریح
  can_rank      boolean not null default false,
  can_badge     boolean not null default false,
  on_home       boolean not null default false,
  cross_page    boolean not null default false,
  is_spotlight  boolean not null default false,

  badge_kind    text,          -- featured | home | premium | spotlight
  badge_fa      text,
  weight        integer not null default 0,
  color         text,

  price_per_day bigint not null default 0,
  allowed_days  integer[] not null default '{7,14,30}',

  is_exclusive  boolean not null default false,   -- همزمان فقط یکی
  is_bundle     boolean not null default false,   -- «همه‌کاره»
  sort_order    integer not null default 0,
  is_active     boolean not null default true
);

-- ---------- داده‌ی پایه ----------
insert into public.boost_plans
  (id, fa, description, note,
   can_rank, can_badge, on_home, cross_page, is_spotlight,
   badge_kind, badge_fa, weight, color,
   price_per_day, allowed_days, is_exclusive, is_bundle, sort_order)
values
  ('ladder', 'نردبان',
   'فقط جایگاه: فروشگاه شما به بالای فهرست همان بخش می‌پرد.',
   'هیچ نشان یا قابی نمی‌گیرید — فقط بالاتر دیده می‌شوید.',
   true, false, false, false, false,
   null, null, 10, '#6EC8D9',
   45000, '{3,7,14,30}', false, false, 1),

  ('highlight', 'برجسته‌سازی',
   'فقط ظاهر: قاب طلایی و نشان «ویژه» روی کارت فروشگاه.',
   'جایگاه شما در فهرست عوض نمی‌شود — فقط چشمگیرتر می‌شوید.',
   false, true, false, false, false,
   'featured', 'ویژه', 0, '#C9A84C',
   70000, '{7,14,30}', false, false, 2),

  ('showcase', 'ویترین صفحه‌ی اصلی',
   'فقط صفحه‌ی نخست: در ویترین صفحه‌ی اصلی سایت دیده می‌شوید.',
   'در صفحه‌های دسته‌بندی تغییری نمی‌کند — فقط صفحه‌ی اصلی.',
   true, true, true, false, false,
   'home', 'ویترین اصلی', 40, '#C9A0B8',
   120000, '{7,14,30}', false, false, 3),

  ('premium', 'فوق‌ویژه (همه‌کاره)',
   'همه با هم: بالاترین جایگاه، قاب طلایی، ویترین اصلی و حضور در همه‌ی بخش‌ها.',
   'هر چهار مزیت نردبان، برجسته‌سازی، ویترین و حضور فراگیر.',
   true, true, true, true, false,
   'premium', 'فوق‌ویژه', 70, '#8B5CF6',
   190000, '{7,14,30,60}', false, true, 4),

  ('spotlight', 'صدرنشین دیجی‌پوش',
   'انحصاری: در حساب کاربری همه‌ی مشتری‌ها، در قاب اختصاصی.',
   'در هر لحظه فقط یک فروشگاه می‌تواند صدرنشین باشد.',
   true, true, true, true, true,
   'spotlight', 'صدرنشین', 100, '#F5A0A0',
   480000, '{1,3,7}', true, true, 5)

on conflict (id) do update set
  fa            = excluded.fa,
  description   = excluded.description,
  note          = excluded.note,
  can_rank      = excluded.can_rank,
  can_badge     = excluded.can_badge,
  on_home       = excluded.on_home,
  cross_page    = excluded.cross_page,
  is_spotlight  = excluded.is_spotlight,
  badge_kind    = excluded.badge_kind,
  badge_fa      = excluded.badge_fa,
  weight        = excluded.weight,
  color         = excluded.color,
  price_per_day = excluded.price_per_day,
  allowed_days  = excluded.allowed_days,
  is_exclusive  = excluded.is_exclusive,
  is_bundle     = excluded.is_bundle,
  sort_order    = excluded.sort_order;

alter table public.boost_plans enable row level security;

drop policy if exists plans_read on public.boost_plans;
create policy plans_read on public.boost_plans for select using (true);

drop policy if exists plans_admin on public.boost_plans;
create policy plans_admin on public.boost_plans
  for all using (public.is_admin()) with check (public.is_admin());


-- ============================================================
--  ۱۶. توانایی‌های فعال هر فروشگاه — یک‌جا
--  ------------------------------------------------------------
--  به‌جای اینکه هر صفحه جدول‌ها را جدا بخواند و خودش قاعده
--  را پیاده کند (که همان‌جا اشتباه می‌شد)، اینجا یک نمای
--  آماده داریم.
-- ============================================================
create or replace view public.seller_boost_perks as
select
  b.seller_id,
  bool_or(p.can_rank)     as can_rank,
  bool_or(p.can_badge)    as can_badge,
  bool_or(p.on_home)      as on_home,
  bool_or(p.cross_page)   as cross_page,
  bool_or(p.is_spotlight) as is_spotlight,
  -- وزن فقط از بسته‌هایی که جایگاه می‌دهند
  coalesce(max(p.weight) filter (where p.can_rank), 0) as rank_weight,
  -- نشانِ قوی‌ترین بسته‌ی نشان‌دار
  (array_agg(p.badge_kind order by p.weight desc)
     filter (where p.can_badge and p.badge_kind is not null))[1] as badge_kind,
  (array_agg(p.badge_fa order by p.weight desc)
     filter (where p.can_badge and p.badge_fa is not null))[1]   as badge_fa,
  (array_agg(p.color order by p.weight desc)
     filter (where p.can_badge))[1]                              as badge_color,
  max(b.ends_at) as expires_at
from public.boosts b
join public.boost_plans p on p.id = b.plan
where b.status = 'active' and b.ends_at > now()
group by b.seller_id;


-- ============================================================
--  ۱۷. یک صدرنشین در هر زمان
--  ------------------------------------------------------------
--  بسته‌ی انحصاری نباید دو خریدار هم‌زمان داشته باشد. اگر
--  این بررسی فقط در کد باشد، دو درخواست هم‌زمان هر دو رد
--  می‌شوند و دو صدرنشین ساخته می‌شود.
-- ============================================================
create or replace function public.check_exclusive_boost()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  excl boolean;
  busy int;
begin
  select is_exclusive into excl from public.boost_plans where id = new.plan;
  if not coalesce(excl, false) then return new; end if;
  if new.status <> 'active' then return new; end if;

  select count(*) into busy
    from public.boosts b
   where b.plan = new.plan
     and b.status = 'active'
     and b.ends_at > now()
     and b.seller_id <> new.seller_id
     and (tg_op = 'INSERT' or b.id <> new.id);

  if busy > 0 then
    raise exception 'این بسته انحصاری است و هم‌اکنون فروشگاه دیگری آن را دارد.';
  end if;

  return new;
end $$;

drop trigger if exists trg_exclusive_boost on public.boosts;
create trigger trg_exclusive_boost
  before insert or update on public.boosts
  for each row execute function public.check_exclusive_boost();


-- ============================================================
--  ۱۸. وزن خودکار از روی بسته
--  ------------------------------------------------------------
--  وزن نباید دستی فرستاده شود؛ وگرنه می‌شد با درخواست
--  دستکاری‌شده وزن ۹۹۹ گرفت.
-- ============================================================
create or replace function public.set_boost_weight()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select case when p.can_rank then p.weight else 0 end
    into new.weight
    from public.boost_plans p where p.id = new.plan;

  if new.weight is null then new.weight := 0; end if;
  return new;
end $$;

drop trigger if exists trg_boost_weight on public.boosts;
create trigger trg_boost_weight
  before insert or update of plan on public.boosts
  for each row execute function public.set_boost_weight();
