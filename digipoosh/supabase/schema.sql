-- ============================================================
--  دیجی‌پوش — Database Schema (PostgreSQL / Supabase)
--  اجرا: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
--  ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('customer', 'seller', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type seller_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'out_of_stock', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type commission_status as enum ('pending', 'settled', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================
--  1. USERS  (extends auth.users)
-- ============================================================
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text unique,
  email        text unique,
  role         user_role not null default 'customer',
  avatar_url   text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);

-- ============================================================
--  2. SELLER PROFILES
-- ============================================================
create table if not exists public.seller_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references public.users(id) on delete cascade,
  shop_name         text not null,
  slug              text not null unique,
  description       text,
  logo_url          text,
  cover_url         text,
  city              text,
  address           text,
  national_id       text,
  shaba_number      text,                       -- شماره شبا برای تسویه
  category          text,                        -- زنانه / مردانه / بچگانه / تینیجر
  status            seller_status not null default 'pending',
  rejection_reason  text,
  commission_rate   numeric(5,2) not null default 10.00,  -- درصد کمیسیون پلتفرم
  rating            numeric(3,2) not null default 0,
  rating_count      integer not null default 0,
  approved_at       timestamptz,
  approved_by       uuid references public.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_seller_status   on public.seller_profiles(status);
create index if not exists idx_seller_category on public.seller_profiles(category);

-- ============================================================
--  3. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  seller_id      uuid not null references public.seller_profiles(id) on delete cascade,
  title          text not null,
  slug           text not null unique,
  description    text,
  category       text not null,                 -- women | men | kids | teen
  subcategory    text,
  price          bigint not null check (price >= 0),   -- ریال (عدد صحیح)
  discount_price bigint check (discount_price >= 0),
  stock          integer not null default 0 check (stock >= 0),
  sizes          text[] default '{}',
  colors         text[] default '{}',
  fabric         text,
  images         text[] default '{}',
  status         product_status not null default 'draft',
  is_featured    boolean not null default false,
  views          integer not null default 0,
  rating         numeric(3,2) not null default 0,
  rating_count   integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_products_seller   on public.products(seller_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_status   on public.products(status);
create index if not exists idx_products_featured on public.products(is_featured);

-- ============================================================
--  4. CART
-- ============================================================
create table if not exists public.cart (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  size        text,
  color       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id, size, color)
);

create index if not exists idx_cart_user on public.cart(user_id);

-- ============================================================
--  5. ORDERS
-- ============================================================
create table if not exists public.orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text not null unique,
  user_id           uuid not null references public.users(id) on delete restrict,
  status            order_status not null default 'pending',
  subtotal          bigint not null default 0,
  shipping_fee      bigint not null default 0,
  discount          bigint not null default 0,
  total             bigint not null default 0,
  commission_total  bigint not null default 0,
  receiver_name     text not null,
  receiver_phone    text not null,
  province          text,
  city              text,
  postal_code       text,
  address           text not null,
  note              text,
  payment_ref       text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_user   on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ============================================================
--  6. ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  seller_id        uuid references public.seller_profiles(id) on delete set null,
  product_title    text not null,        -- snapshot
  product_image    text,
  unit_price       bigint not null,
  quantity         integer not null check (quantity > 0),
  size             text,
  color            text,
  line_total       bigint not null,
  commission_rate  numeric(5,2) not null default 10.00,
  commission_amount bigint not null default 0,
  seller_payout    bigint not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists idx_items_order  on public.order_items(order_id);
create index if not exists idx_items_seller on public.order_items(seller_id);

-- ============================================================
--  7. WISHLIST
-- ============================================================
create table if not exists public.wishlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlist(user_id);

-- ============================================================
--  8. REVIEWS
-- ============================================================
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- ============================================================
--  9. COMMISSIONS
-- ============================================================
create table if not exists public.commissions (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete cascade,
  seller_id     uuid not null references public.seller_profiles(id) on delete cascade,
  gross_amount  bigint not null,     -- مبلغ فروش
  rate          numeric(5,2) not null default 10.00,
  amount        bigint not null,     -- سهم پلتفرم
  seller_payout bigint not null,     -- سهم فروشنده
  status        commission_status not null default 'pending',
  settled_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_comm_seller on public.commissions(seller_id);
create index if not exists idx_comm_status on public.commissions(status);

-- ============================================================
--  10. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null,
  body       text,
  type       text default 'info',   -- info | order | seller | admin
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_user on public.notifications(user_id, is_read);

-- ============================================================
--  TRIGGERS — updated_at
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['users','seller_profiles','products','cart','orders'] loop
    execute format(
      'drop trigger if exists trg_touch_%1$s on public.%1$s;
       create trigger trg_touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;

-- ============================================================
--  TRIGGER — auto-create public.users row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  HELPER — is current user an admin?
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_seller_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.seller_profiles where user_id = auth.uid();
$$;

-- ============================================================
--  ORDER NUMBER GENERATOR
-- ============================================================
create or replace function public.gen_order_number()
returns text language plpgsql as $$
declare n text;
begin
  n := 'DP-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random()*99999))::text, 5, '0');
  return n;
end $$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.users           enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.products        enable row level security;
alter table public.cart            enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.wishlist        enable row level security;
alter table public.reviews         enable row level security;
alter table public.commissions     enable row level security;
alter table public.notifications   enable row level security;

-- ---------- users ----------
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (id = auth.uid() or public.is_admin());

-- ---------- seller_profiles ----------
drop policy if exists sellers_public_read on public.seller_profiles;
create policy sellers_public_read on public.seller_profiles
  for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

drop policy if exists sellers_insert_own on public.seller_profiles;
create policy sellers_insert_own on public.seller_profiles
  for insert with check (user_id = auth.uid());

drop policy if exists sellers_update_own on public.seller_profiles;
create policy sellers_update_own on public.seller_profiles
  for update using (user_id = auth.uid() or public.is_admin());

-- ---------- products ----------
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (
    status = 'active'
    or seller_id = public.my_seller_id()
    or public.is_admin()
  );

drop policy if exists products_seller_write on public.products;
create policy products_seller_write on public.products
  for all using (seller_id = public.my_seller_id() or public.is_admin())
  with check (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- cart ----------
drop policy if exists cart_own on public.cart;
create policy cart_own on public.cart
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- orders ----------
drop policy if exists orders_own_read on public.orders;
create policy orders_own_read on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_own_insert on public.orders;
create policy orders_own_insert on public.orders
  for insert with check (user_id = auth.uid());

-- ---------- order_items ----------
drop policy if exists items_read on public.order_items;
create policy items_read on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    or seller_id = public.my_seller_id()
    or public.is_admin()
  );

-- ---------- wishlist ----------
drop policy if exists wishlist_own on public.wishlist;
create policy wishlist_own on public.wishlist
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- reviews ----------
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews
  for select using (is_approved = true or user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert with check (user_id = auth.uid());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
  for update using (user_id = auth.uid() or public.is_admin());

-- ---------- commissions ----------
drop policy if exists comm_read on public.commissions;
create policy comm_read on public.commissions
  for select using (seller_id = public.my_seller_id() or public.is_admin());

-- ---------- notifications ----------
drop policy if exists notif_own on public.notifications;
create policy notif_own on public.notifications
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ============================================================
--  RATING RECALCULATION
-- ============================================================
create or replace function public.recalc_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating = coalesce((select round(avg(r.rating)::numeric, 2) from public.reviews r
                       where r.product_id = pid and r.is_approved), 0),
    rating_count = (select count(*) from public.reviews r
                    where r.product_id = pid and r.is_approved)
  where p.id = pid;
  return null;
end $$;

drop trigger if exists trg_recalc_rating on public.reviews;
create trigger trg_recalc_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_product_rating();
