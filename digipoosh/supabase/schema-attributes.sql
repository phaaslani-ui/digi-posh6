-- ============================================================
--  دیجی‌پوش — ویژگی‌های کالا و نام‌گذاری خودکار
--  ------------------------------------------------------------
--  این فایل روی schema.sql سوار می‌شود و آن را عوض نمی‌کند.
--  اجرا: Supabase Dashboard → SQL Editor → New query → Run
--  ترتیب اجرا: schema.sql → schema-wholesale.sql →
--              schema-extra.sql → schema-attributes.sql
-- ============================================================

-- ============================================================
--  1. گروه‌های ویژگی — پارچه، رنگ، مدل، آستین، یقه، قد، …
-- ============================================================
create table if not exists public.attribute_groups (
  key          text primary key,
  label        text not null,              -- نام فارسی برای نمایش
  label_en     text,
  is_required  boolean not null default false,   -- در فرم فروشنده اجباری است؟
  in_name      boolean not null default false,   -- در نام خودکار کالا می‌آید؟
  name_order   integer not null default 0,       -- جای آن در نام خودکار
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

insert into public.attribute_groups (key, label, label_en, is_required, in_name, name_order, sort_order) values
  ('fabric', 'جنس پارچه', 'Fabric', true, true, 3, 10),
  ('color', 'رنگ اصلی', 'Color', true, true, 4, 20),
  ('style', 'مدل', 'Style', true, true, 5, 30),
  ('sleeve', 'آستین', 'Sleeve', false, true, 6, 40),
  ('collar', 'یقه', 'Collar', false, false, 0, 50),
  ('length', 'قد', 'Length', false, false, 0, 60),
  ('fit', 'فرم برش', 'Fit', false, false, 0, 70),
  ('pattern', 'طرح', 'Pattern', false, false, 0, 80),
  ('season', 'فصل', 'Season', false, false, 0, 90),
  ('size', 'سایز', 'Size', true, false, 0, 100)
on conflict (key) do update set
  label = excluded.label, label_en = excluded.label_en,
  is_required = excluded.is_required, in_name = excluded.in_name,
  name_order = excluded.name_order, sort_order = excluded.sort_order;

-- ============================================================
--  2. گزینه‌های هر ویژگی — محتوای منوهای کشویی
-- ============================================================
create table if not exists public.attribute_options (
  id          serial primary key,
  group_key   text not null references public.attribute_groups(key) on delete cascade,
  name        text not null,              -- کلید انگلیسی، پایدار
  label       text not null,              -- نام فارسی برای نمایش
  label_en    text,
  swatch      text,                       -- کد رنگ، فقط برای گروه رنگ
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (group_key, name)
);

create index if not exists idx_attr_opt_group on public.attribute_options(group_key);
create index if not exists idx_attr_opt_active on public.attribute_options(group_key, is_active);

-- fabric
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('fabric', 'silk', 'ابریشم', 'Silk', 10),
  ('fabric', 'cotton', 'پنبه', 'Cotton', 20),
  ('fabric', 'polyester', 'پلی‌استر', 'Polyester', 30),
  ('fabric', 'wool', 'پشم', 'Wool', 40),
  ('fabric', 'linen', 'کتان', 'Linen', 50),
  ('fabric', 'denim', 'جین', 'Denim', 60),
  ('fabric', 'velvet', 'مخمل', 'Velvet', 70),
  ('fabric', 'chiffon', 'حریر', 'Chiffon', 80),
  ('fabric', 'crepe', 'کرپ', 'Crepe', 90),
  ('fabric', 'satin', 'ساتن', 'Satin', 100),
  ('fabric', 'cashmere', 'کشمیر', 'Cashmere', 110),
  ('fabric', 'viscose', 'ویسکوز', 'Viscose', 120),
  ('fabric', 'leather', 'چرم', 'Leather', 130),
  ('fabric', 'knit', 'بافت', 'Knit', 140),
  ('fabric', 'nylon', 'نایلون', 'Nylon', 150),
  ('fabric', 'jersey', 'جودون', 'Jersey', 160)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- color
insert into public.attribute_options (group_key, name, label, label_en, sort_order, swatch) values
  ('color', 'black', 'مشکی', 'Black', 10, '#1a1a1a'),
  ('color', 'white', 'سفید', 'White', 20, '#ffffff'),
  ('color', 'gold', 'طلایی', 'Gold', 30, '#c9a84c'),
  ('color', 'silver', 'نقره‌ای', 'Silver', 40, '#c0c0c0'),
  ('color', 'red', 'قرمز', 'Red', 50, '#c62828'),
  ('color', 'blue', 'آبی', 'Blue', 60, '#1565c0'),
  ('color', 'navy', 'سرمه‌ای', 'Navy', 70, '#14203a'),
  ('color', 'green', 'سبز', 'Green', 80, '#2e7d32'),
  ('color', 'pink', 'صورتی', 'Pink', 90, '#e91e63'),
  ('color', 'purple', 'بنفش', 'Purple', 100, '#7b1fa2'),
  ('color', 'cream', 'کرم', 'Cream', 110, '#f5f0e8'),
  ('color', 'beige', 'بژ', 'Beige', 120, '#d7c4a3'),
  ('color', 'gray', 'خاکستری', 'Gray', 130, '#757575'),
  ('color', 'brown', 'قهوه‌ای', 'Brown', 140, '#5d4037'),
  ('color', 'yellow', 'زرد', 'Yellow', 150, '#f9a825'),
  ('color', 'orange', 'نارنجی', 'Orange', 160, '#ef6c00'),
  ('color', 'turquoise', 'فیروزه‌ای', 'Turquoise', 170, '#00897b'),
  ('color', 'maroon', 'زرشکی', 'Maroon', 180, '#880e4f')
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order, swatch = excluded.swatch;

-- style
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('style', 'classic', 'کلاسیک', 'Classic', 10),
  ('style', 'modern', 'مدرن', 'Modern', 20),
  ('style', 'sporty', 'اسپرت', 'Sporty', 30),
  ('style', 'elegant', 'مجلسی', 'Elegant', 40),
  ('style', 'casual', 'کژوال', 'Casual', 50),
  ('style', 'minimal', 'مینیمال', 'Minimal', 60),
  ('style', 'vintage', 'وینتیج', 'Vintage', 70),
  ('style', 'bohemian', 'بوهو', 'Bohemian', 80),
  ('style', 'traditional', 'سنتی', 'Traditional', 90),
  ('style', 'street', 'خیابانی', 'Street', 100)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- sleeve
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('sleeve', 'long', 'آستین بلند', 'Long Sleeve', 10),
  ('sleeve', 'short', 'آستین کوتاه', 'Short Sleeve', 20),
  ('sleeve', 'three-quarter', 'آستین سه‌چهارم', '3/4 Sleeve', 30),
  ('sleeve', 'sleeveless', 'بدون آستین', 'Sleeveless', 40),
  ('sleeve', 'cap', 'آستین حلقه‌ای', 'Cap Sleeve', 50),
  ('sleeve', 'none', 'ندارد', 'Not Applicable', 60)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- collar
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('collar', 'round', 'یقه گرد', 'Round Neck', 10),
  ('collar', 'v-neck', 'یقه هفت', 'V-Neck', 20),
  ('collar', 'stand', 'یقه ایستاده', 'Stand Collar', 30),
  ('collar', 'shawl', 'یقه شال', 'Shawl Collar', 40),
  ('collar', 'shirt', 'یقه پیراهنی', 'Shirt Collar', 50),
  ('collar', 'boat', 'یقه قایقی', 'Boat Neck', 60),
  ('collar', 'turtle', 'یقه اسکی', 'Turtleneck', 70),
  ('collar', 'hood', 'کلاه‌دار', 'Hooded', 80),
  ('collar', 'collarless', 'بدون یقه', 'Collarless', 90),
  ('collar', 'none', 'ندارد', 'Not Applicable', 100)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- length
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('length', 'maxi', 'بلند', 'Maxi', 10),
  ('length', 'midi', 'میان‌قد', 'Midi', 20),
  ('length', 'short', 'کوتاه', 'Short', 30),
  ('length', 'mini', 'مینی', 'Mini', 40),
  ('length', 'crop', 'کوتاه (کراپ)', 'Crop', 50),
  ('length', 'none', 'ندارد', 'Not Applicable', 60)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- fit
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('fit', 'slim', 'جذب', 'Slim Fit', 10),
  ('fit', 'regular', 'معمولی', 'Regular Fit', 20),
  ('fit', 'loose', 'گشاد', 'Loose Fit', 30),
  ('fit', 'oversize', 'اورسایز', 'Oversize', 40)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- pattern
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('pattern', 'plain', 'ساده', 'Plain', 10),
  ('pattern', 'textured', 'بافت‌دار', 'Textured', 20),
  ('pattern', 'ribbed', 'کبریتی', 'Ribbed', 30),
  ('pattern', 'melange', 'ملانژ', 'Melange', 40),
  ('pattern', 'pinstripe', 'راه‌راه بسیار ریز', 'Pinstripe', 50),
  ('pattern', 'striped', 'راه‌راه', 'Striped', 60),
  ('pattern', 'widestripe', 'راه‌راه درشت', 'Wide stripe', 70),
  ('pattern', 'breton', 'راه‌راه ملوانی', 'Breton', 80),
  ('pattern', 'gingham', 'چهارخانه ریز', 'Gingham', 90),
  ('pattern', 'checked', 'چهارخانه', 'Checked', 100),
  ('pattern', 'tartan', 'چهارخانه اسکاتلندی', 'Tartan', 110),
  ('pattern', 'houndstooth', 'دندان‌سگی', 'Houndstooth', 120),
  ('pattern', 'windowpane', 'قاب‌پنجره‌ای', 'Windowpane', 130),
  ('pattern', 'argyle', 'لوزی', 'Argyle', 140),
  ('pattern', 'pindot', 'خال ریز', 'Pin dot', 150),
  ('pattern', 'dots', 'خال‌خالی', 'Dots', 160),
  ('pattern', 'polkadot', 'خال درشت', 'Polka dot', 170),
  ('pattern', 'ditsy', 'گل ریز', 'Ditsy', 180),
  ('pattern', 'floral', 'گل‌دار', 'Floral', 190),
  ('pattern', 'botanical', 'برگ و شاخه', 'Botanical', 200),
  ('pattern', 'tropical', 'برگ استوایی', 'Tropical', 210),
  ('pattern', 'paisley', 'بته‌جقه', 'Paisley', 220),
  ('pattern', 'leopard', 'پلنگی', 'Leopard', 230),
  ('pattern', 'zebra', 'گورخری', 'Zebra', 240),
  ('pattern', 'snake', 'پوست ماری', 'Snake', 250),
  ('pattern', 'geometric', 'هندسی', 'Geometric', 260),
  ('pattern', 'chevron', 'زیگزاگ', 'Chevron', 270),
  ('pattern', 'abstract', 'انتزاعی', 'Abstract', 280),
  ('pattern', 'camo', 'ارتشی', 'Camouflage', 290),
  ('pattern', 'tiedye', 'تای‌دای', 'Tie-dye', 300),
  ('pattern', 'ethnic', 'سنتی', 'Ethnic', 310),
  ('pattern', 'kilim', 'گلیمی', 'Kilim', 320),
  ('pattern', 'termeh', 'ترمه', 'Termeh', 330),
  ('pattern', 'embroidered', 'گلدوزی', 'Embroidered', 340),
  ('pattern', 'lace', 'دانتل', 'Lace', 350),
  ('pattern', 'sequin', 'پولک‌دوزی', 'Sequin', 360),
  ('pattern', 'metallic', 'براق فلزی', 'Metallic', 370),
  ('pattern', 'quilted', 'لحافی', 'Quilted', 380),
  ('pattern', 'logo', 'لوگودار', 'Logo', 390),
  ('pattern', 'graphic', 'طرح چاپی', 'Graphic', 400),
  ('pattern', 'text', 'نوشته‌دار', 'Text', 410),
  ('pattern', 'colorblock', 'بلوک رنگی', 'Color block', 420),
  ('pattern', 'ombre', 'طیف رنگی', 'Ombre', 430),
  ('pattern', 'half', 'دورنگ نصف', 'Half-and-half', 440),
  ('pattern', 'multi', 'چندرنگ', 'Multicolor', 450),
  ('pattern', 'patchwork', 'تکه‌دوزی', 'Patchwork', 460)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- season
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('season', 'spring', 'بهاره', 'Spring', 10),
  ('season', 'summer', 'تابستانه', 'Summer', 20),
  ('season', 'autumn', 'پاییزه', 'Autumn', 30),
  ('season', 'winter', 'زمستانه', 'Winter', 40),
  ('season', 'all', 'چهارفصل', 'All Season', 50)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- size
insert into public.attribute_options (group_key, name, label, label_en, sort_order) values
  ('size', 'XS', 'XS', 'XS', 10),
  ('size', 'S', 'S', 'S', 20),
  ('size', 'M', 'M', 'M', 30),
  ('size', 'L', 'L', 'L', 40),
  ('size', 'XL', 'XL', 'XL', 50),
  ('size', 'XXL', 'XXL', 'XXL', 60),
  ('size', '3XL', '3XL', '3XL', 70),
  ('size', 'free', 'فری‌سایز', 'Free Size', 80)
on conflict (group_key, name) do update set
  label = excluded.label, label_en = excluded.label_en, sort_order = excluded.sort_order;

-- ============================================================
--  3. درخت دسته‌بندی — بخش ← سبک ← نوع کالا
--  ------------------------------------------------------------
--  همان درختی که فروشنده در پنلش می‌بیند، اینجا هم هست تا
--  فیلتر مشتری و نام خودکار از یک منبع واحد تغذیه شوند.
-- ============================================================
create table if not exists public.tax_sections (
  key         text primary key,           -- women | men | kids | teen
  label       text not null,
  adjective   text not null,              -- «زنانه» — در نام خودکار می‌آید
  note        text,
  page        text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

insert into public.tax_sections (key, label, adjective, note, page, sort_order) values
  ('women', 'پوشاک زنانه', 'زنانه', 'مانتو، مجلسی، روزمره و اکسسوری', 'woman/index.html', 10),
  ('men', 'پوشاک مردانه', 'مردانه', 'کت و شلوار، پیراهن، اسپرت و کفش', 'man/index.html', 20),
  ('kids', 'پوشاک کودک', 'بچگانه', 'نوزاد تا ۱۲ سال', 'kids/index.html', 30),
  ('teen', 'پوشاک نوجوان', 'نوجوان', 'استریت‌ویر و ترند روز، ۱۲ تا ۱۸ سال', 'teen/index.html', 40)
on conflict (key) do update set
  label = excluded.label, adjective = excluded.adjective,
  note = excluded.note, page = excluded.page, sort_order = excluded.sort_order;

create table if not exists public.tax_groups (
  id           serial primary key,
  section_key  text not null references public.tax_sections(key) on delete cascade,
  key          text not null,             -- formal | party | casual | …
  label        text not null,
  note         text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  unique (section_key, key)
);

create index if not exists idx_tax_groups_section on public.tax_groups(section_key);

insert into public.tax_groups (section_key, key, label, note, sort_order) values
  ('women', 'formal', 'رسمی و اداری', 'برای محیط کار و جلسه‌های رسمی', 10),
  ('women', 'party', 'مجلسی و شب', 'مهمانی، عروسی و مناسبت‌های ویژه', 20),
  ('women', 'casual', 'روزمره و اسپرت', 'راحت برای هر روز', 30),
  ('women', 'outer', 'پاییزه و زمستانه', 'لایه‌های گرم بیرونی', 40),
  ('women', 'home', 'خانگی و راحتی', 'لباس داخل خانه و خواب', 50),
  ('women', 'sport', 'ورزشی', 'باشگاه، پیاده‌روی و یوگا', 60),
  ('women', 'modest', 'پوشش و حجاب', 'چادر، شال و روسری', 70),
  ('women', 'under', 'لباس زیر و جوراب', 'زیرپوش و جوراب', 80),
  ('women', 'shoes', 'کفش', 'همه‌ی مدل‌های کفش', 90),
  ('women', 'accessory', 'کیف و اکسسوری', 'تکمیل‌کننده‌ی استایل', 100),
  ('men', 'formal', 'رسمی و اداری', 'کت و شلوار و پیراهن اداری', 110),
  ('men', 'casual', 'روزمره و اسپرت', 'راحت و شیک برای هر روز', 120),
  ('men', 'outer', 'پاییزه و زمستانه', 'کاپشن و پالتو', 130),
  ('men', 'home', 'خانگی و راحتی', 'لباس داخل خانه', 140),
  ('men', 'sport', 'ورزشی', 'باشگاه و ورزش', 150),
  ('men', 'traditional', 'سنتی و مجلسی', 'لباس‌های سنتی ایرانی', 160),
  ('men', 'under', 'لباس زیر و جوراب', 'زیرپوش و جوراب', 170),
  ('men', 'shoes', 'کفش', 'رسمی، اسپرت و ورزشی', 180),
  ('men', 'accessory', 'کیف و اکسسوری', 'تکمیل‌کننده‌ی استایل', 190),
  ('kids', 'baby', 'نوزادی (۰ تا ۲ سال)', 'مخصوص نوزادان', 200),
  ('kids', 'girl', 'دخترانه', 'برای دختربچه‌ها', 210),
  ('kids', 'boy', 'پسرانه', 'برای پسربچه‌ها', 220),
  ('kids', 'school', 'مدرسه', 'فرم و لوازم مدرسه', 230),
  ('kids', 'outer', 'پاییزه و زمستانه', 'گرم و راحت', 240),
  ('kids', 'home', 'خانگی و خواب', 'لباس راحتی بچه‌ها', 250),
  ('kids', 'party', 'مجلسی و جشن', 'تولد و مهمانی', 260),
  ('kids', 'shoes', 'کفش', 'کفش بچگانه', 270),
  ('kids', 'accessory', 'اکسسوری و اسباب‌بازی', 'وسایل جانبی', 280),
  ('teen', 'street', 'استریت‌ویر', 'استایل خیابانی و ترند', 290),
  ('teen', 'casual', 'روزمره', 'راحت برای مدرسه و بیرون', 300),
  ('teen', 'sport', 'ورزشی', 'ورزش و باشگاه', 310),
  ('teen', 'gaming', 'گیمینگ و فن‌آرت', 'طرح بازی، انیمه و موسیقی', 320),
  ('teen', 'outer', 'پاییزه و زمستانه', 'کاپشن و بافت', 330),
  ('teen', 'party', 'مجلسی و مهمانی', 'جشن و مناسبت', 340),
  ('teen', 'shoes', 'کفش', 'اسنیکر و کتانی', 350),
  ('teen', 'accessory', 'اکسسوری', 'کامل‌کننده‌ی استایل', 360)
on conflict (section_key, key) do update set
  label = excluded.label, note = excluded.note, sort_order = excluded.sort_order;

create table if not exists public.tax_items (
  id           serial primary key,
  section_key  text not null references public.tax_sections(key) on delete cascade,
  group_key    text not null,
  label        text not null,             -- «مانتو اداری» — سرِ نام خودکار
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  unique (section_key, group_key, label),
  foreign key (section_key, group_key)
    references public.tax_groups(section_key, key) on delete cascade
);

create index if not exists idx_tax_items_sec  on public.tax_items(section_key);
create index if not exists idx_tax_items_grp  on public.tax_items(section_key, group_key);

-- ۲۱۱ نوع کالا — همان فهرست پنل فروشنده
insert into public.tax_items (section_key, group_key, label, sort_order) values
  ('women', 'formal', 'مانتو اداری', 10),
  ('women', 'formal', 'کت و دامن', 20),
  ('women', 'formal', 'کت و شلوار زنانه', 30),
  ('women', 'formal', 'پیراهن رسمی', 40),
  ('women', 'formal', 'بلوز رسمی', 50),
  ('women', 'formal', 'دامن مداد‌ی', 60),
  ('women', 'formal', 'جلیقه', 70),
  ('women', 'party', 'لباس شب', 80),
  ('women', 'party', 'پیراهن مجلسی', 90),
  ('women', 'party', 'لباس عروس', 100),
  ('women', 'party', 'لباس نامزدی', 110),
  ('women', 'party', 'کت مجلسی', 120),
  ('women', 'party', 'دامن مجلسی', 130),
  ('women', 'party', 'شنل و پانچو', 140),
  ('women', 'casual', 'مانتو روزمره', 150),
  ('women', 'casual', 'تی‌شرت', 160),
  ('women', 'casual', 'بلوز', 170),
  ('women', 'casual', 'شومیز', 180),
  ('women', 'casual', 'سویشرت و هودی', 190),
  ('women', 'casual', 'شلوار جین', 200),
  ('women', 'casual', 'شلوار پارچه‌ای', 210),
  ('women', 'casual', 'دامن روزمره', 220),
  ('women', 'casual', 'سارافون', 230),
  ('women', 'casual', 'تونیک', 240),
  ('women', 'outer', 'پالتو', 250),
  ('women', 'outer', 'کاپشن', 260),
  ('women', 'outer', 'بارانی و ترنچ', 270),
  ('women', 'outer', 'جلیقه پفی', 280),
  ('women', 'outer', 'ژاکت و بافت', 290),
  ('women', 'outer', 'پانچو', 300),
  ('women', 'home', 'ست راحتی', 310),
  ('women', 'home', 'لباس خواب', 320),
  ('women', 'home', 'روب‌دوشامبر', 330),
  ('women', 'home', 'شلوارک خانگی', 340),
  ('women', 'home', 'تاپ خانگی', 350),
  ('women', 'sport', 'ست ورزشی', 360),
  ('women', 'sport', 'لگ ورزشی', 370),
  ('women', 'sport', 'تاپ ورزشی', 380),
  ('women', 'sport', 'سویشرت ورزشی', 390),
  ('women', 'sport', 'شلوار گرمکن', 400),
  ('women', 'modest', 'چادر', 410),
  ('women', 'modest', 'مقنعه', 420),
  ('women', 'modest', 'شال', 430),
  ('women', 'modest', 'روسری', 440),
  ('women', 'modest', 'کلاه حجاب', 450),
  ('women', 'modest', 'مانتو بلند', 460),
  ('women', 'under', 'لباس زیر', 470),
  ('women', 'under', 'زیرپوش حرارتی', 480),
  ('women', 'under', 'جوراب', 490),
  ('women', 'under', 'جوراب شلواری', 500),
  ('women', 'shoes', 'کفش پاشنه‌دار', 510),
  ('women', 'shoes', 'کفش تخت', 520),
  ('women', 'shoes', 'بوت و نیم‌بوت', 530),
  ('women', 'shoes', 'کتانی', 540),
  ('women', 'shoes', 'صندل', 550),
  ('women', 'shoes', 'دمپایی', 560),
  ('women', 'accessory', 'کیف دستی', 570),
  ('women', 'accessory', 'کیف دوشی', 580),
  ('women', 'accessory', 'کوله‌پشتی', 590),
  ('women', 'accessory', 'کمربند', 600),
  ('women', 'accessory', 'دستکش', 610),
  ('women', 'accessory', 'کلاه', 620),
  ('women', 'accessory', 'عینک آفتابی', 630),
  ('women', 'accessory', 'زیورآلات', 640),
  ('men', 'formal', 'کت و شلوار', 650),
  ('men', 'formal', 'کت تک', 660),
  ('men', 'formal', 'شلوار پارچه‌ای', 670),
  ('men', 'formal', 'پیراهن رسمی', 680),
  ('men', 'formal', 'جلیقه', 690),
  ('men', 'formal', 'کراوات و پاپیون', 700),
  ('men', 'formal', 'ست دامادی', 710),
  ('men', 'casual', 'تی‌شرت', 720),
  ('men', 'casual', 'پولوشرت', 730),
  ('men', 'casual', 'پیراهن اسپرت', 740),
  ('men', 'casual', 'سویشرت و هودی', 750),
  ('men', 'casual', 'شلوار جین', 760),
  ('men', 'casual', 'شلوار کتان', 770),
  ('men', 'casual', 'شلوارک', 780),
  ('men', 'casual', 'ژاکت و بافت', 790),
  ('men', 'outer', 'کاپشن', 800),
  ('men', 'outer', 'پالتو', 810),
  ('men', 'outer', 'بارانی و ترنچ', 820),
  ('men', 'outer', 'جلیقه پفی', 830),
  ('men', 'outer', 'کاپشن چرم', 840),
  ('men', 'outer', 'کاپشن جین', 850),
  ('men', 'home', 'ست راحتی', 860),
  ('men', 'home', 'لباس خواب', 870),
  ('men', 'home', 'شلوارک خانگی', 880),
  ('men', 'home', 'رکابی خانگی', 890),
  ('men', 'sport', 'ست ورزشی', 900),
  ('men', 'sport', 'تی‌شرت ورزشی', 910),
  ('men', 'sport', 'شلوار گرمکن', 920),
  ('men', 'sport', 'شورت ورزشی', 930),
  ('men', 'sport', 'سویشرت ورزشی', 940),
  ('men', 'sport', 'لباس فوتبال', 950),
  ('men', 'traditional', 'پیراهن سنتی', 960),
  ('men', 'traditional', 'شلوار سنتی', 970),
  ('men', 'traditional', 'عبا و قبا', 980),
  ('men', 'traditional', 'ست سنتی', 990),
  ('men', 'under', 'زیرپوش', 1000),
  ('men', 'under', 'شورت', 1010),
  ('men', 'under', 'زیرپوش حرارتی', 1020),
  ('men', 'under', 'جوراب', 1030),
  ('men', 'shoes', 'کفش رسمی چرم', 1040),
  ('men', 'shoes', 'کفش کلاسیک', 1050),
  ('men', 'shoes', 'کتانی', 1060),
  ('men', 'shoes', 'بوت و نیم‌بوت', 1070),
  ('men', 'shoes', 'صندل', 1080),
  ('men', 'shoes', 'دمپایی', 1090),
  ('men', 'accessory', 'کیف اداری', 1100),
  ('men', 'accessory', 'کوله‌پشتی', 1110),
  ('men', 'accessory', 'کیف پول', 1120),
  ('men', 'accessory', 'کمربند', 1130),
  ('men', 'accessory', 'ساعت', 1140),
  ('men', 'accessory', 'عینک آفتابی', 1150),
  ('men', 'accessory', 'کلاه', 1160),
  ('men', 'accessory', 'شال گردن', 1170),
  ('kids', 'baby', 'سرهمی', 1180),
  ('kids', 'baby', 'بادی', 1190),
  ('kids', 'baby', 'ست نوزادی', 1200),
  ('kids', 'baby', 'پیشبند', 1210),
  ('kids', 'baby', 'کلاه نوزادی', 1220),
  ('kids', 'baby', 'پتو قنداق', 1230),
  ('kids', 'baby', 'جوراب نوزادی', 1240),
  ('kids', 'girl', 'پیراهن دخترانه', 1250),
  ('kids', 'girl', 'سارافون', 1260),
  ('kids', 'girl', 'دامن', 1270),
  ('kids', 'girl', 'تی‌شرت دخترانه', 1280),
  ('kids', 'girl', 'شلوار دخترانه', 1290),
  ('kids', 'girl', 'ست دخترانه', 1300),
  ('kids', 'girl', 'مانتو دخترانه', 1310),
  ('kids', 'boy', 'تی‌شرت پسرانه', 1320),
  ('kids', 'boy', 'پیراهن پسرانه', 1330),
  ('kids', 'boy', 'شلوار پسرانه', 1340),
  ('kids', 'boy', 'شلوارک', 1350),
  ('kids', 'boy', 'ست پسرانه', 1360),
  ('kids', 'boy', 'کت پسرانه', 1370),
  ('kids', 'school', 'فرم مدرسه', 1380),
  ('kids', 'school', 'مانتو مدرسه', 1390),
  ('kids', 'school', 'شلوار مدرسه', 1400),
  ('kids', 'school', 'کیف مدرسه', 1410),
  ('kids', 'school', 'جوراب مدرسه', 1420),
  ('kids', 'outer', 'کاپشن بچگانه', 1430),
  ('kids', 'outer', 'پالتو بچگانه', 1440),
  ('kids', 'outer', 'ژاکت و بافت', 1450),
  ('kids', 'outer', 'سویشرت و هودی', 1460),
  ('kids', 'outer', 'شال و کلاه', 1470),
  ('kids', 'home', 'ست راحتی', 1480),
  ('kids', 'home', 'لباس خواب', 1490),
  ('kids', 'home', 'رب‌دوشامبر', 1500),
  ('kids', 'home', 'حوله‌تنی', 1510),
  ('kids', 'party', 'لباس مجلسی دخترانه', 1520),
  ('kids', 'party', 'کت و شلوار پسرانه', 1530),
  ('kids', 'party', 'لباس تولد', 1540),
  ('kids', 'party', 'لباس فانتزی', 1550),
  ('kids', 'shoes', 'کتانی بچگانه', 1560),
  ('kids', 'shoes', 'کفش مدرسه', 1570),
  ('kids', 'shoes', 'صندل', 1580),
  ('kids', 'shoes', 'بوت', 1590),
  ('kids', 'shoes', 'دمپایی', 1600),
  ('kids', 'accessory', 'کوله‌پشتی', 1610),
  ('kids', 'accessory', 'کلاه', 1620),
  ('kids', 'accessory', 'دستکش', 1630),
  ('kids', 'accessory', 'گیره و تل مو', 1640),
  ('kids', 'accessory', 'عروسک', 1650),
  ('kids', 'accessory', 'اسباب‌بازی آموزشی', 1660),
  ('teen', 'street', 'هودی اورسایز', 1670),
  ('teen', 'street', 'سویشرت', 1680),
  ('teen', 'street', 'تی‌شرت اورسایز', 1690),
  ('teen', 'street', 'کراپ‌تاپ', 1700),
  ('teen', 'street', 'شلوار بگی', 1710),
  ('teen', 'street', 'کارگو', 1720),
  ('teen', 'street', 'جلیقه استریت', 1730),
  ('teen', 'casual', 'تی‌شرت', 1740),
  ('teen', 'casual', 'پیراهن', 1750),
  ('teen', 'casual', 'شلوار جین', 1760),
  ('teen', 'casual', 'شلوارک', 1770),
  ('teen', 'casual', 'دامن', 1780),
  ('teen', 'casual', 'ست روزمره', 1790),
  ('teen', 'sport', 'ست ورزشی', 1800),
  ('teen', 'sport', 'لگ', 1810),
  ('teen', 'sport', 'شلوار گرمکن', 1820),
  ('teen', 'sport', 'تاپ ورزشی', 1830),
  ('teen', 'sport', 'تی‌شرت ورزشی', 1840),
  ('teen', 'sport', 'لباس تیمی', 1850),
  ('teen', 'gaming', 'تی‌شرت طرح‌دار', 1860),
  ('teen', 'gaming', 'هودی گیمینگ', 1870),
  ('teen', 'gaming', 'کلاه گیمینگ', 1880),
  ('teen', 'gaming', 'ماسک و بند', 1890),
  ('teen', 'gaming', 'تی‌شرت انیمه', 1900),
  ('teen', 'outer', 'کاپشن', 1910),
  ('teen', 'outer', 'بمبر جکت', 1920),
  ('teen', 'outer', 'کاپشن جین', 1930),
  ('teen', 'outer', 'پافر', 1940),
  ('teen', 'outer', 'ژاکت و بافت', 1950),
  ('teen', 'outer', 'شال گردن', 1960),
  ('teen', 'party', 'پیراهن مجلسی', 1970),
  ('teen', 'party', 'کت اسپرت', 1980),
  ('teen', 'party', 'ست مجلسی', 1990),
  ('teen', 'shoes', 'اسنیکر', 2000),
  ('teen', 'shoes', 'کتانی ساقدار', 2010),
  ('teen', 'shoes', 'کفش اسکیت', 2020),
  ('teen', 'shoes', 'صندل', 2030),
  ('teen', 'shoes', 'دمپایی', 2040),
  ('teen', 'accessory', 'کوله‌پشتی', 2050),
  ('teen', 'accessory', 'کیف کمری', 2060),
  ('teen', 'accessory', 'کلاه', 2070),
  ('teen', 'accessory', 'جوراب طرح‌دار', 2080),
  ('teen', 'accessory', 'دستبند', 2090),
  ('teen', 'accessory', 'گردنبند', 2100),
  ('teen', 'accessory', 'عینک', 2110)
on conflict (section_key, group_key, label) do update set sort_order = excluded.sort_order;

-- ============================================================
--  4. ستون‌های تازه‌ی جدول products
--  ------------------------------------------------------------
--  جدول products دست‌نخورده می‌ماند؛ فقط ستون اضافه می‌شود تا
--  کالاهای ثبت‌شده‌ی فعلی از بین نروند.
-- ============================================================
alter table public.products
  add column if not exists section     text references public.tax_sections(key),
  add column if not exists item_type   text,                  -- «مانتو اداری»
  add column if not exists group_key   text,                  -- formal | party | …
  add column if not exists fabric_key  text,
  add column if not exists color_key   text,
  add column if not exists style_key   text,
  add column if not exists sleeve_key  text,
  add column if not exists collar_key  text,
  add column if not exists length_key  text,
  add column if not exists fit_key     text,
  add column if not exists pattern_key text,
  add column if not exists season_key  text,
  add column if not exists auto_name   text;                  -- نام ساخته‌شده

-- ---------- درستیِ کلیدها: هر کلید باید در گزینه‌ها باشد ----------
-- به‌جای کلید خارجی مستقیم (که چون گزینه‌ها id سریال دارند دشوار
-- می‌شد) از قید بررسی با تابع استفاده می‌کنیم؛ هم خواناتر است هم
-- پیام خطای روشن‌تری می‌دهد.
create or replace function public.attr_exists(p_group text, p_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_name is null
      or exists (
           select 1 from public.attribute_options
           where group_key = p_group and name = p_name and is_active
         );
$$;

do $$ begin
  alter table public.products add constraint products_attr_valid check (
        public.attr_exists('fabric',  fabric_key)
    and public.attr_exists('color',   color_key)
    and public.attr_exists('style',   style_key)
    and public.attr_exists('sleeve',  sleeve_key)
    and public.attr_exists('collar',  collar_key)
    and public.attr_exists('length',  length_key)
    and public.attr_exists('fit',     fit_key)
    and public.attr_exists('pattern', pattern_key)
    and public.attr_exists('season',  season_key)
  );
exception when duplicate_object then null; end $$;

-- توضیح کوتاه — پرامپت سقف ۳۰۰ نویسه خواست
do $$ begin
  alter table public.products
    add constraint products_desc_len check (description is null or length(description) <= 300);
exception when duplicate_object then null; end $$;

-- ============================================================
--  5. نمایه‌ها — هر ستونی که مشتری با آن فیلتر می‌کند
-- ============================================================
create index if not exists idx_products_section  on public.products(section);
create index if not exists idx_products_item     on public.products(item_type);
create index if not exists idx_products_group    on public.products(section, group_key);
create index if not exists idx_products_fabric   on public.products(fabric_key);
create index if not exists idx_products_color    on public.products(color_key);
create index if not exists idx_products_style    on public.products(style_key);
create index if not exists idx_products_sleeve   on public.products(sleeve_key);
create index if not exists idx_products_collar   on public.products(collar_key);
create index if not exists idx_products_length   on public.products(length_key);
create index if not exists idx_products_fit      on public.products(fit_key);
create index if not exists idx_products_pattern  on public.products(pattern_key);
create index if not exists idx_products_season   on public.products(season_key);
create index if not exists idx_products_price    on public.products(price);
create index if not exists idx_products_rating   on public.products(rating desc);
create index if not exists idx_products_created  on public.products(created_at desc);

-- سایز و رنگ آرایه‌اند — نمایه‌ی GIN برای عملگر «شامل بودن»
create index if not exists idx_products_sizes    on public.products using gin (sizes);
create index if not exists idx_products_colors   on public.products using gin (colors);

-- نمایه‌ی ترکیبی پرکاربردترین پرس‌وجو: کالای فعالِ یک بخش، تازه‌ترین اول
create index if not exists idx_products_live
  on public.products(section, status, created_at desc)
  where status = 'active';

-- جست‌وجوی متنی روی نام و توضیح
create index if not exists idx_products_search
  on public.products using gin (
    to_tsvector('simple', coalesce(auto_name, '') || ' ' || coalesce(title, '') || ' ' || coalesce(description, ''))
  );

-- ============================================================
--  6. ساخت خودکار نام کالا
--  ------------------------------------------------------------
--  قاعده: [نوع کالا] [صفت بخش] [پارچه] [رنگ] [مدل] [آستین]
--  نمونه: «پیراهن رسمی مردانه پنبه سرمه‌ای کلاسیک آستین بلند»
--
--  کدام ویژگی در نام بیاید و با چه ترتیبی، از جدول
--  attribute_groups خوانده می‌شود (ستون‌های in_name و name_order)
--  تا بعداً بدون دست‌زدن به کد قابل تغییر باشد.
-- ============================================================
create or replace function public.build_product_name(
  p_section  text,
  p_item     text,
  p_fabric   text,
  p_color    text,
  p_style    text,
  p_sleeve   text
) returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_parts text[] := '{}';
  v_adj   text;
  v_lbl   text;
begin
  -- ۱) نوع کالا — همیشه سرِ نام
  if coalesce(trim(p_item), '') <> '' then
    v_parts := array_append(v_parts, trim(p_item));
  end if;

  -- ۲) صفت بخش: زنانه / مردانه / بچگانه / نوجوان
  select adjective into v_adj from public.tax_sections where key = p_section;
  if coalesce(v_adj, '') <> '' then
    v_parts := array_append(v_parts, v_adj);
  end if;

  -- ۳ تا ۶) ویژگی‌هایی که پرچم in_name دارند، به ترتیب name_order
  for v_lbl in
    select o.label
      from (values
              ('fabric', p_fabric),
              ('color',  p_color),
              ('style',  p_style),
              ('sleeve', p_sleeve)
           ) as sel(gk, nm)
      join public.attribute_groups g on g.key = sel.gk and g.in_name and g.is_active
      join public.attribute_options o
        on o.group_key = sel.gk and o.name = sel.nm and o.is_active
     where sel.nm is not null
       and sel.nm <> 'none'          -- «ندارد» در نام نمی‌آید
     order by g.name_order
  loop
    v_parts := array_append(v_parts, v_lbl);
  end loop;

  -- اگر هیچ چیز نبود، دست‌کم یک نام آبرومند برگردان
  if array_length(v_parts, 1) is null then
    return 'کالای بدون مشخصات';
  end if;

  return array_to_string(v_parts, ' ');
end;
$$;

-- ---------- تریگر: نام با هر درج و ویرایش تازه می‌شود ----------
create or replace function public.set_product_auto_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.auto_name := public.build_product_name(
    new.section, new.item_type, new.fabric_key,
    new.color_key, new.style_key, new.sleeve_key
  );

  -- عنوان نمایشی همیشه همان نام خودکار است — فروشنده نمی‌تواند
  -- نام دلخواه بنویسد؛ خواسته‌ی صریح مدیر بازارگاه.
  new.title := new.auto_name;

  -- نشانی یکتا از روی نام + شش نویسه‌ی نخست شناسه
  -- نکته: کلاس [:alnum:] در PostgreSQL با تنظیم زبان، حرف فارسی
  -- را هم حرف می‌شمارد؛ پس نیازی به بازه‌ی یونیکد دستی نیست.
  if new.slug is null or new.slug = '' or tg_op = 'UPDATE' then
    new.slug := regexp_replace(
                  regexp_replace(new.auto_name, '[^[:alnum:]]+', '-', 'g'),
                  '(^-+|-+$)', '', 'g'
                ) || '-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  -- موجودی صفر یعنی ناموجود
  if new.stock <= 0 and new.status = 'active' then
    new.status := 'out_of_stock';
  elsif new.stock > 0 and new.status = 'out_of_stock' then
    new.status := 'active';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_product_auto_name on public.products;
create trigger trg_product_auto_name
  before insert or update of section, item_type, fabric_key, color_key,
                             style_key, sleeve_key, stock
  on public.products
  for each row execute function public.set_product_auto_name();

-- ============================================================
--  7. نمای فیلتر — همه‌چیز آماده و برچسب‌خورده
--  ------------------------------------------------------------
--  به‌جای هشت JOIN در هر درخواست، یک نما ساخته می‌شود که
--  برچسب فارسی هر ویژگی را کنار کلیدش دارد.
-- ============================================================
create or replace view public.products_full as
select
  p.*,
  s.label       as section_label,
  gr.label      as group_label,
  sp.shop_name  as store_name,
  sp.status     as seller_status,
  of.label      as fabric_label,
  oc.label      as color_label,
  oc.swatch     as color_swatch,
  ost.label     as style_label,
  osl.label     as sleeve_label,
  ocl.label     as collar_label,
  oln.label     as length_label,
  oft.label     as fit_label,
  opt.label     as pattern_label,
  osn.label     as season_label
from public.products p
left join public.tax_sections     s   on s.key = p.section
left join public.tax_groups       gr  on gr.section_key = p.section and gr.key = p.group_key
left join public.seller_profiles  sp  on sp.id = p.seller_id
left join public.attribute_options of  on of.group_key  = 'fabric'  and of.name  = p.fabric_key
left join public.attribute_options oc  on oc.group_key  = 'color'   and oc.name  = p.color_key
left join public.attribute_options ost on ost.group_key = 'style'   and ost.name = p.style_key
left join public.attribute_options osl on osl.group_key = 'sleeve'  and osl.name = p.sleeve_key
left join public.attribute_options ocl on ocl.group_key = 'collar'  and ocl.name = p.collar_key
left join public.attribute_options oln on oln.group_key = 'length'  and oln.name = p.length_key
left join public.attribute_options oft on oft.group_key = 'fit'     and oft.name = p.fit_key
left join public.attribute_options opt on opt.group_key = 'pattern' and opt.name = p.pattern_key
left join public.attribute_options osn on osn.group_key = 'season'  and osn.name = p.season_key;

-- ============================================================
--  8. شمارنده‌ی گزینه‌های فیلتر
--  ------------------------------------------------------------
--  کنار هر گزینه‌ی فیلتر باید بنویسیم چند کالا دارد، وگرنه
--  مشتری روی گزینه‌ای می‌زند که نتیجه‌اش خالی است.
-- ============================================================
create or replace view public.filter_facets as
with live as (
  select p.*
    from public.products p
    join public.seller_profiles sp on sp.id = p.seller_id
   where p.status in ('active', 'out_of_stock')
     and sp.status = 'approved'
)
select 'fabric' as group_key, fabric_key  as name, section, count(*)::int as n
  from live where fabric_key  is not null group by fabric_key,  section
union all
select 'color',   color_key,   section, count(*)::int from live where color_key   is not null group by color_key,   section
union all
select 'style',   style_key,   section, count(*)::int from live where style_key   is not null group by style_key,   section
union all
select 'sleeve',  sleeve_key,  section, count(*)::int from live where sleeve_key  is not null group by sleeve_key,  section
union all
select 'collar',  collar_key,  section, count(*)::int from live where collar_key  is not null group by collar_key,  section
union all
select 'length',  length_key,  section, count(*)::int from live where length_key  is not null group by length_key,  section
union all
select 'fit',     fit_key,     section, count(*)::int from live where fit_key     is not null group by fit_key,     section
union all
select 'pattern', pattern_key, section, count(*)::int from live where pattern_key is not null group by pattern_key, section
union all
select 'season',  season_key,  section, count(*)::int from live where season_key  is not null group by season_key,  section
union all
select 'item',    item_type,   section, count(*)::int from live where item_type   is not null group by item_type,   section;

-- ============================================================
--  9. بازه‌ی قیمت هر بخش — برای لغزنده‌ی قیمت
-- ============================================================
create or replace view public.price_bounds as
select
  p.section,
  min(p.price)::bigint as min_price,
  max(p.price)::bigint as max_price
from public.products p
join public.seller_profiles sp on sp.id = p.seller_id
where p.status = 'active' and sp.status = 'approved'
group by p.section;

-- ============================================================
--  10. امنیت سطر — جدول‌های تازه
--  ------------------------------------------------------------
--  فهرست ویژگی‌ها و درخت دسته‌بندی داده‌ی عمومی است: همه
--  می‌خوانند، فقط مدیر می‌نویسد.
-- ============================================================
alter table public.attribute_groups  enable row level security;
alter table public.attribute_options enable row level security;
alter table public.tax_sections      enable row level security;
alter table public.tax_groups        enable row level security;
alter table public.tax_items         enable row level security;

do $$ begin
  create policy attr_groups_read on public.attribute_groups
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy attr_options_read on public.attribute_options
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_sections_read on public.tax_sections
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_groups_read on public.tax_groups
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_items_read on public.tax_items
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy attr_groups_admin on public.attribute_groups
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy attr_options_admin on public.attribute_options
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_sections_admin on public.tax_sections
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_groups_admin on public.tax_groups
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy tax_items_admin on public.tax_items
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- ============================================================
--  11. برگرداندن اتمی موجودی
--  ------------------------------------------------------------
--  چرا لازم شد؟
--
--  مسیر لغو سفارش، موجودی را این‌طور برمی‌گرداند:
--      ۱) موجودی را بخوان        → مثلاً ۵
--      ۲) در جاوااسکریپت جمع بزن → ۵ + ۲ = ۷
--      ۳) بنویس                  → ۷
--
--  اگر مشتری دوبار پشت‌سرهم روی «لغو» بزند، هر دو درخواست
--  عدد ۵ را می‌خوانند و هر دو ۷ می‌نویسند. یعنی به‌جای ۹،
--  موجودی ۷ می‌شود — دو عدد کالا برای همیشه گم می‌شود.
--
--  این تابع جمع را در خود پایگاه داده انجام می‌دهد، پس دو
--  درخواست هم‌زمان پشت هم صف می‌کشند و هیچ‌کدام گم نمی‌شود.
-- ============================================================
create or replace function public.restock_product(
  p_product uuid,
  p_qty     integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new integer;
begin
  if p_qty is null or p_qty <= 0 then
    return null;
  end if;

  update public.products
     set stock = stock + p_qty,
         /* کالایی که ناموجود شده بود، دوباره فعال می‌شود */
         status = case
                    when status = 'out_of_stock' then 'active'::product_status
                    else status
                  end,
         updated_at = now()
   where id = p_product
  returning stock into v_new;

  return v_new;
end;
$$;

-- ============================================================
--  12. کاهش اتمی موجودی — همان مشکل، جهت مخالف
--  ------------------------------------------------------------
--  اگر دو مشتری هم‌زمان آخرین کالا را بخرند، بدون این تابع
--  هر دو موفق می‌شوند و موجودی منفی می‌شود.
--  خروجی: تعداد واقعاً کسرشده (اگر کافی نبود، صفر)
-- ============================================================
create or replace function public.take_stock(
  p_product uuid,
  p_qty     integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_taken integer := 0;
begin
  if p_qty is null or p_qty <= 0 then
    return 0;
  end if;

  update public.products
     set stock = stock - p_qty,
         status = case
                    when stock - p_qty <= 0 then 'out_of_stock'::product_status
                    else status
                  end,
         updated_at = now()
   /* شرط `stock >= p_qty` داخل خود دستور است — پس بررسی و
      کسر در یک عملیات اتمی رخ می‌دهد و فاصله‌ای برای رقابت
      باقی نمی‌ماند. */
   where id = p_product
     and stock >= p_qty
  returning p_qty into v_taken;

  return coalesce(v_taken, 0);
end;
$$;

-- ============================================================
--  13. نمایه‌های جاافتاده روی کلیدهای خارجی
--  ------------------------------------------------------------
--  PostgreSQL روی کلید خارجی خودکار نمایه نمی‌سازد — فقط روی
--  کلید اصلی. بدون این نمایه‌ها:
--
--    • هر JOIN روی این ستون‌ها کل جدول را می‌پیماید
--    • حذف سطر والد، برای بررسی وابستگی‌ها کل جدول فرزند را
--      می‌خواند (کندی خاموشِ عملیات حذف)
--
--  با چند هزار سطر محسوس نیست؛ با چند صد هزار، فاجعه است.
-- ============================================================
create index if not exists idx_seller_approved_by
  on public.seller_profiles(approved_by);

create index if not exists idx_wrfq_buyer
  on public.wholesale_rfq(buyer_id);

create index if not exists idx_worders_buyer
  on public.wholesale_orders(buyer_id);

create index if not exists idx_worders_from_rfq
  on public.wholesale_orders(from_rfq);

create index if not exists idx_payouts_handled_by
  on public.payouts(handled_by);

create index if not exists idx_profreq_handled_by
  on public.profile_requests(handled_by);

create index if not exists idx_returns_order_item
  on public.returns(order_item_id);

create index if not exists idx_commissions_order_item
  on public.commissions(order_item_id);

-- ============================================================
--  14. تم ویترین فروشگاه
--  ------------------------------------------------------------
--  هر فروشگاه حال‌وهوای بخشی را می‌گیرد که مشتری از آن آمده.
--  این جدول فقط برای فروشنده‌هایی است که تم را «قفل» کرده‌اند
--  تا ویترین‌شان همیشه یک شکل باشد.
--
--  چرا ستون custom_css نداریم؟
--  ------------------------------------------------------------
--  پرامپت اولیه چنین ستونی داشت. ولی CSS دلخواه یعنی اجازه‌ی
--  `background: url(...)` برای ردیابی کاربر، `position: fixed`
--  برای پوشاندن دکمه‌ی پرداخت، و در برخی مرورگرهای قدیمی حتی
--  اجرای کد. به‌جایش فقط چند مقدار مشخص و اعتبارسنجی‌شده
--  پذیرفته می‌شود.
-- ============================================================
do $$ begin
  create type store_theme_kind as enum ('women', 'men', 'kids', 'teen');
exception when duplicate_object then null; end $$;

create table if not exists public.store_themes (
  id            uuid primary key default uuid_generate_v4(),
  seller_id     uuid not null unique references public.seller_profiles(id) on delete cascade,

  -- تم انتخاب‌شده
  section       store_theme_kind not null default 'women',

  -- قفل: اگر false باشد، تم از مسیر ورود مشتری می‌آید
  is_locked     boolean not null default false,

  -- سفارشی‌سازی محدود — هر سه اختیاری
  primary_color text check (primary_color is null or primary_color ~ '^#[0-9a-fA-F]{6}$'),
  second_color  text check (second_color  is null or second_color  ~ '^#[0-9a-fA-F]{6}$'),
  accent_color  text check (accent_color  is null or accent_color  ~ '^#[0-9a-fA-F]{6}$'),

  -- گردی گوشه، بین ۰ تا ۳۲ پیکسل
  radius        smallint check (radius is null or (radius >= 0 and radius <= 32)),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_store_themes_seller on public.store_themes(seller_id);

-- ---------- به‌روزرسانی خودکار زمان ----------
create or replace function public.touch_store_theme()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_store_theme_touch on public.store_themes;
create trigger trg_store_theme_touch
  before update on public.store_themes
  for each row execute function public.touch_store_theme();

-- ============================================================
--  15. حدس تم پیش‌فرض هر فروشگاه
--  ------------------------------------------------------------
--  اگر فروشنده تم را قفل نکرده باشد، بخشی که بیشترین کالای
--  فعال را در آن دارد پیشنهاد می‌شود.
-- ============================================================
create or replace view public.store_theme_resolved as
with busiest as (
  select distinct on (p.seller_id)
         p.seller_id,
         p.section,
         count(*) over (partition by p.seller_id, p.section) as n
    from public.products p
   where p.status = 'active' and p.section is not null
   order by p.seller_id, n desc, p.section
)
select
  sp.id                                   as seller_id,
  sp.shop_name,
  coalesce(
    case when st.is_locked then st.section::text else null end,
    b.section,
    sp.category,
    'women'
  )                                       as section,
  coalesce(st.is_locked, false)           as is_locked,
  st.primary_color,
  st.second_color,
  st.accent_color,
  st.radius
from public.seller_profiles sp
left join public.store_themes st on st.seller_id = sp.id
left join busiest b on b.seller_id = sp.id;

-- ---------- امنیت سطر ----------
alter table public.store_themes enable row level security;

do $$ begin
  -- تم فروشگاه داده‌ی عمومی است؛ صفحه‌ی فروشگاه باید بخواندش
  create policy store_themes_read on public.store_themes
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  -- فقط خود فروشنده تم فروشگاهش را می‌نویسد
  create policy store_themes_own on public.store_themes
    for all using (
      exists (
        select 1 from public.seller_profiles sp
        where sp.id = store_themes.seller_id and sp.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy store_themes_admin on public.store_themes
    for all using (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- ============================================================
--  16. گسترش تم — کنترل کامل فروشنده
--  ------------------------------------------------------------
--  فروشنده حالا می‌تواند همه‌ی رنگ‌ها، شکل شناور، نوع حرکت و
--  تراکم را انتخاب کند. هر ستون قید خودش را دارد، پس حتی
--  نوشتن مستقیم در جدول هم مقدار نامعتبر نمی‌پذیرد.
-- ============================================================
alter table public.store_themes
  add column if not exists bg_color      text,
  add column if not exists surface_color text,
  add column if not exists ink_color     text,
  add column if not exists mute_color    text,
  add column if not exists shapes        text,
  add column if not exists motion        text,
  add column if not exists density       smallint,
  add column if not exists border_width  smallint,
  add column if not exists theme_name    text;

do $$ begin
  alter table public.store_themes add constraint store_themes_colors_ok check (
        (bg_color      is null or bg_color      ~ '^#[0-9a-fA-F]{6}$')
    and (surface_color is null or surface_color ~ '^#[0-9a-fA-F]{6}$')
    and (ink_color     is null or ink_color     ~ '^#[0-9a-fA-F]{6}$')
    and (mute_color    is null or mute_color    ~ '^#[0-9a-fA-F]{6}$')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.store_themes add constraint store_themes_shape_ok check (
    shapes is null or shapes in ('petals', 'geo', 'balloons', 'neon', 'none')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.store_themes add constraint store_themes_motion_ok check (
    motion is null or motion in ('drift', 'spin', 'bounce', 'pulse', 'none')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.store_themes add constraint store_themes_density_ok check (
    density is null or density in (0, 4, 7, 11)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.store_themes add constraint store_themes_bw_ok check (
    border_width is null or (border_width >= 0 and border_width <= 6)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.store_themes add constraint store_themes_name_ok check (
    theme_name is null or length(theme_name) <= 30
  );
exception when duplicate_object then null; end $$;

-- نما هم باید ستون‌های تازه را بدهد
create or replace view public.store_theme_resolved as
with busiest as (
  select distinct on (p.seller_id)
         p.seller_id,
         p.section,
         count(*) over (partition by p.seller_id, p.section) as n
    from public.products p
   where p.status = 'active' and p.section is not null
   order by p.seller_id, n desc, p.section
)
select
  sp.id                                   as seller_id,
  sp.shop_name,
  coalesce(
    case when st.is_locked then st.section::text else null end,
    b.section,
    sp.category,
    'women'
  )                                       as section,
  coalesce(st.is_locked, false)           as is_locked,
  st.primary_color,
  st.second_color,
  st.accent_color,
  st.bg_color,
  st.surface_color,
  st.ink_color,
  st.mute_color,
  st.radius,
  st.border_width,
  st.shapes,
  st.motion,
  st.density,
  st.theme_name
from public.seller_profiles sp
left join public.store_themes st on st.seller_id = sp.id
left join busiest b on b.seller_id = sp.id;
