-- ============================================================
--  دیجی‌پوش — بازار عمده‌فروشان
--  ------------------------------------------------------------
--  این فایل جدا از schema.sql است چون بازار عمده یک بازارِ
--  مستقل است: کالاهایش، سفارش‌هایش و نردبانش هیچ‌کدام با
--  خرده‌فروشی قاطی نمی‌شوند.
--
--  ترتیب اجرا:
--    ۱) schema.sql            (پایه — کاربران و فروشندگان)
--    ۲) schema-wholesale.sql  (همین فایل)
-- ============================================================

-- ============================================================
--  ۰. افزودن نوع فروشنده به پروفایل موجود
-- ============================================================
alter table public.seller_profiles
  add column if not exists seller_type text not null default 'retail'
    check (seller_type in ('retail', 'wholesale')),
  add column if not exists company_name   text,
  add column if not exists economic_code  text,
  add column if not exists reg_number     text,
  add column if not exists warehouse      text,
  add column if not exists min_order_value bigint default 0,
  add column if not exists lead_time      int default 0,
  add column if not exists accepts_rfq    boolean default true;

create index if not exists idx_seller_type
  on public.seller_profiles (seller_type, status);


-- ============================================================
--  ۱. کالاهای عمده
--  ------------------------------------------------------------
--  تفاوت کلیدی با کالای خرده‌فروشی: «قیمت پلکانی».
--  هرچه خریدار بیشتر بگیرد، قیمت هر عدد پایین‌تر می‌آید.
--  پله‌ها در ستون jsonb نگه داشته می‌شوند چون تعدادشان
--  متغیر است و همیشه یک‌جا خوانده می‌شوند.
-- ============================================================
create table if not exists public.wholesale_products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.seller_profiles(id) on delete cascade,

  name        text not null,
  code        text not null,
  brand       text,
  description text,

  -- دسته‌بندی سه‌سطحی — مثل خرده‌فروشی
  section     text,
  "group"     text,
  item        text,
  category    text,

  price       bigint not null check (price > 0),
  moq         int    not null default 1 check (moq >= 1),
  stock       int    not null default 0 check (stock >= 0),
  low_at      int    default 0,
  lead_time   int    default 0,

  -- [{ "from": 12, "price": 450000 }, ...]
  tiers       jsonb  not null default '[]'::jsonb,

  material    text,
  colors      text,
  sizes       text,
  packing     text,
  images      text[] default '{}',

  -- draft تا وقتی مدیر فروشگاه را تأیید نکرده
  status      text not null default 'draft'
                check (status in ('draft', 'active', 'archived')),
  -- خواسته‌ی فروشنده؛ پس از تأیید مدیر همین اجرا می‌شود
  wanted      text not null default 'active',

  views       int default 0,
  sold        int default 0,

  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),

  -- کد کالا در هر فروشگاه یکتاست (نه در کل سامانه)
  unique (seller_id, code)
);

create index if not exists idx_wp_seller  on public.wholesale_products (seller_id);
create index if not exists idx_wp_status  on public.wholesale_products (status)
  where status = 'active';
create index if not exists idx_wp_section on public.wholesale_products (section, "group");

-- جست‌وجوی متنی فارسی روی نام و برند
create index if not exists idx_wp_search
  on public.wholesale_products using gin (
    to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(brand,''))
  );


-- ============================================================
--  ۲. استعلام قیمت (RFQ)
--  ------------------------------------------------------------
--  ستون فقرات عمده‌فروشی. خریدار تعداد مورد نیازش را
--  می‌گوید، فروشنده قیمت پیشنهاد می‌دهد.
--
--  خریدار ممکن است حساب کاربری نداشته باشد، پس `buyer_id`
--  می‌تواند خالی باشد ولی شماره تماس اجباری است.
-- ============================================================
create table if not exists public.wholesale_rfq (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.seller_profiles(id) on delete cascade,
  product_id   uuid references public.wholesale_products(id) on delete set null,
  product_name text,

  buyer_id     uuid references public.users(id) on delete set null,
  buyer_name   text not null,
  buyer_phone  text not null,
  buyer_email  text,
  buyer_company text,

  qty          int not null check (qty >= 1),
  target_price bigint default 0,
  deadline     date,
  note         text,

  status       text not null default 'open'
                 check (status in ('open', 'answered', 'accepted', 'rejected', 'expired')),

  -- پاسخ فروشنده
  offer_price      bigint,
  offer_lead_time  int,
  offer_valid_days int default 7,
  offer_note       text,
  offered_at       timestamptz,

  reject_reason text,
  order_id      uuid,

  created_at   timestamptz default now()
);

create index if not exists idx_rfq_seller on public.wholesale_rfq (seller_id, status);
create index if not exists idx_rfq_buyer  on public.wholesale_rfq (buyer_phone);
create index if not exists idx_rfq_open   on public.wholesale_rfq (created_at desc)
  where status = 'open';


-- ============================================================
--  ۳. سفارش‌های عمده
-- ============================================================
create table if not exists public.wholesale_orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text unique not null,
  seller_id     uuid not null references public.seller_profiles(id) on delete restrict,

  buyer_id      uuid references public.users(id) on delete set null,
  buyer_name    text not null,
  buyer_phone   text not null,
  buyer_company text,
  address       text,

  item_count    int    not null default 0,
  total         bigint not null default 0,
  paid          bigint not null default 0 check (paid >= 0),

  status        text not null default 'pending'
                  check (status in ('pending','confirmed','preparing',
                                    'shipped','delivered','canceled')),

  note      text,
  from_rfq  uuid references public.wholesale_rfq(id) on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- پرداخت هرگز نباید از مبلغ کل بیشتر شود
  constraint paid_not_over_total check (paid <= total)
);

create index if not exists idx_wo_seller on public.wholesale_orders (seller_id, status);
create index if not exists idx_wo_buyer  on public.wholesale_orders (buyer_phone);
create index if not exists idx_wo_date   on public.wholesale_orders (created_at desc);


create table if not exists public.wholesale_order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.wholesale_orders(id) on delete cascade,
  product_id uuid references public.wholesale_products(id) on delete set null,

  name       text   not null,
  qty        int    not null check (qty >= 1),
  unit_price bigint not null check (unit_price >= 0),
  line_total bigint not null
);

create index if not exists idx_woi_order on public.wholesale_order_items (order_id);


-- ============================================================
--  ۴. دفتر انبار
--  ------------------------------------------------------------
--  هر تغییر موجودی یک ردیف می‌سازد. بدون این، وقتی عددی
--  اشتباه شد هیچ‌کس نمی‌فهمد کجا و چرا.
-- ============================================================
create table if not exists public.wholesale_stock_log (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null references public.seller_profiles(id) on delete cascade,
  product_id uuid references public.wholesale_products(id) on delete set null,
  product_name text,

  delta      int not null,
  after      int not null,
  reason     text,

  created_at timestamptz default now()
);

create index if not exists idx_wsl_seller on public.wholesale_stock_log (seller_id, created_at desc);


-- ============================================================
--  ۵. نردبان بازار عمده — کاملاً جدا از نردبان خرده‌فروشی
-- ============================================================
create table if not exists public.wholesale_boosts (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null references public.seller_profiles(id) on delete cascade,

  plan       text not null check (plan in ('ladder','highlight','featured','hero')),
  weight     int  not null default 0,

  starts_at  timestamptz not null default now(),
  ends_at    timestamptz not null,

  price      bigint default 0,
  is_trial   boolean default false,
  status     text not null default 'active'
               check (status in ('active','expired','canceled')),

  views      int default 0,
  clicks     int default 0,
  rfq_count  int default 0,

  created_at timestamptz default now()
);

create index if not exists idx_wb_active on public.wholesale_boosts (seller_id, status, ends_at);


-- ============================================================
--  ۶. قواعد دسترسی (RLS)
-- ============================================================
alter table public.wholesale_products    enable row level security;
alter table public.wholesale_rfq         enable row level security;
alter table public.wholesale_orders      enable row level security;
alter table public.wholesale_order_items enable row level security;
alter table public.wholesale_stock_log   enable row level security;
alter table public.wholesale_boosts      enable row level security;

-- ---------- کالاها ----------
-- هر کسی کالای فعال را می‌بیند؛ فقط صاحبش ویرایش می‌کند
drop policy if exists wp_read_active on public.wholesale_products;
create policy wp_read_active on public.wholesale_products
  for select using (
    status = 'active'
    or seller_id = public.my_seller_id()
    or public.is_admin()
  );

drop policy if exists wp_write_own on public.wholesale_products;
create policy wp_write_own on public.wholesale_products
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- استعلام ----------
drop policy if exists rfq_read on public.wholesale_rfq;
create policy rfq_read on public.wholesale_rfq
  for select using (
    seller_id = public.my_seller_id()
    or buyer_id = auth.uid()
    or public.is_admin()
  );

-- هر کسی می‌تواند استعلام بفرستد (حتی مهمان)
drop policy if exists rfq_insert on public.wholesale_rfq;
create policy rfq_insert on public.wholesale_rfq
  for insert with check (true);

-- فقط فروشنده پاسخ می‌دهد
drop policy if exists rfq_update_seller on public.wholesale_rfq;
create policy rfq_update_seller on public.wholesale_rfq
  for update using (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- سفارش‌ها ----------
drop policy if exists wo_read on public.wholesale_orders;
create policy wo_read on public.wholesale_orders
  for select using (
    seller_id = public.my_seller_id()
    or buyer_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists wo_write_seller on public.wholesale_orders;
create policy wo_write_seller on public.wholesale_orders
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

drop policy if exists woi_read on public.wholesale_order_items;
create policy woi_read on public.wholesale_order_items
  for select using (
    exists (
      select 1 from public.wholesale_orders o
      where o.id = order_id
        and (o.seller_id = public.my_seller_id()
             or o.buyer_id = auth.uid()
             or public.is_admin())
    )
  );

-- ---------- انبار و نردبان ----------
drop policy if exists wsl_own on public.wholesale_stock_log;
create policy wsl_own on public.wholesale_stock_log
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

drop policy if exists wb_read on public.wholesale_boosts;
create policy wb_read on public.wholesale_boosts
  for select using (true);

drop policy if exists wb_write_own on public.wholesale_boosts;
create policy wb_write_own on public.wholesale_boosts
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());


-- ============================================================
--  ۷. شماره‌ی سفارش یکتا
-- ============================================================
create or replace function public.gen_wholesale_order_number()
returns text language plpgsql as $$
declare n text;
begin
  loop
    n := 'WO-' || to_char(now(), 'YYMMDD') || '-' ||
         upper(substr(md5(random()::text), 1, 4));
    exit when not exists (
      select 1 from public.wholesale_orders where order_number = n
    );
  end loop;
  return n;
end $$;


-- ============================================================
--  ۸. کاهش موجودی هنگام آماده‌سازی
--  ------------------------------------------------------------
--  چرا در پایگاه داده و نه در کد؟
--  چون اگر دو درخواست هم‌زمان برسند، کد ممکن است هر دو را
--  رد کند و انبار منفی شود. اینجا قفلِ ردیف این را می‌گیرد.
-- ============================================================
create or replace function public.apply_wholesale_stock()
returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  -- ورود به مرحله‌ی آماده‌سازی → کم کردن
  if new.status = 'preparing' and old.status is distinct from 'preparing' then
    for r in select product_id, qty, name from public.wholesale_order_items
             where order_id = new.id and product_id is not null
    loop
      update public.wholesale_products
         set stock = stock - r.qty, updated_at = now()
       where id = r.product_id and stock >= r.qty;

      if not found then
        raise exception 'موجودی «%» کافی نیست.', r.name;
      end if;

      insert into public.wholesale_stock_log
        (seller_id, product_id, product_name, delta, after, reason)
      select new.seller_id, r.product_id, r.name, -r.qty, p.stock,
             'سفارش ' || new.order_number
        from public.wholesale_products p where p.id = r.product_id;
    end loop;
  end if;

  -- لغو پس از کم شدن → برگرداندن
  if new.status = 'canceled'
     and old.status in ('preparing', 'shipped') then
    for r in select product_id, qty, name from public.wholesale_order_items
             where order_id = new.id and product_id is not null
    loop
      update public.wholesale_products
         set stock = stock + r.qty, updated_at = now()
       where id = r.product_id;

      insert into public.wholesale_stock_log
        (seller_id, product_id, product_name, delta, after, reason)
      select new.seller_id, r.product_id, r.name, r.qty, p.stock,
             'لغو سفارش ' || new.order_number
        from public.wholesale_products p where p.id = r.product_id;
    end loop;
  end if;

  -- تحویل → شمارش فروش
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    update public.wholesale_products p
       set sold = p.sold + i.qty
      from public.wholesale_order_items i
     where i.order_id = new.id and i.product_id = p.id;
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_wholesale_stock on public.wholesale_orders;
create trigger trg_wholesale_stock
  before update on public.wholesale_orders
  for each row execute function public.apply_wholesale_stock();


-- ============================================================
--  ۹. انقضای خودکار نردبان
-- ============================================================
create or replace function public.expire_wholesale_boosts()
returns void language sql security definer set search_path = public as $$
  update public.wholesale_boosts
     set status = 'expired'
   where status = 'active' and ends_at < now();
$$;


-- ============================================================
--  ۱۰. نمای آمار هر تأمین‌کننده
--  ------------------------------------------------------------
--  بدون این، بازار برای نمایش «۴۸ کالا، شروع از ۳۹۰٬۰۰۰»
--  باید کل جدول را برای هر فروشنده بخواند.
-- ============================================================
create or replace view public.wholesale_seller_stats as
select
  s.id                                   as seller_id,
  s.shop_name,
  s.city,
  s.lead_time,
  count(p.id) filter (where p.status = 'active')      as product_count,
  coalesce(sum(p.stock) filter (where p.status = 'active'), 0) as total_units,
  min(p.price) filter (where p.status = 'active')     as lowest_price,
  coalesce(sum(p.sold), 0)                            as total_sold
from public.seller_profiles s
left join public.wholesale_products p on p.seller_id = s.id
where s.seller_type = 'wholesale' and s.status = 'approved'
group by s.id, s.shop_name, s.city, s.lead_time;


-- ============================================================
--  ۱۱. دفتر رویدادهای حساس
--  ------------------------------------------------------------
--  هر کار مهم (تأیید فروشگاه، لغو سفارش، تغییر قیمت) اینجا
--  ثبت می‌شود. وقتی روزی چیزی اشتباه شد، باید بشود فهمید
--  چه کسی و کِی آن را عوض کرده است.
-- ============================================================
create table if not exists public.audit_log (
  id          bigserial primary key,
  actor_id    uuid references public.users(id) on delete set null,
  actor_email text,
  action      text not null,
  detail      jsonb default '{}'::jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz default now()
);

create index if not exists idx_audit_actor  on public.audit_log (actor_id, created_at desc);
create index if not exists idx_audit_action on public.audit_log (action, created_at desc);
create index if not exists idx_audit_date   on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- فقط مدیر می‌بیند؛ نوشتن از سمت سرور (service role) انجام می‌شود
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());

-- ============================================================
--  ۱۲. پاک‌سازی دوره‌ای دفتر رویداد
--  ------------------------------------------------------------
--  بدون این، جدول تا ابد بزرگ می‌شود. یک سال کافی است.
-- ============================================================
create or replace function public.prune_audit_log()
returns void language sql security definer set search_path = public as $$
  delete from public.audit_log where created_at < now() - interval '365 days';
$$;
