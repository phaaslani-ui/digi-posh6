#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سازنده‌ی صفحه‌های پنل عمده‌فروشی.

هر صفحه پوسته‌ی یکسانی دارد (منوی کناری، نوار بالا، اسکریپت‌ها)
و فقط محتوای میانی و منطق خودش فرق می‌کند. این فایل آن پوسته
را یک‌جا نگه می‌دارد تا هشت صفحه از هم جدا نیفتند.

اجرا:  python3 build.py
"""

import os

HERE = os.path.dirname(os.path.abspath(__file__))

SHELL = '''<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0b1220" />
  <meta name="robots" content="noindex" />
  <title>{title} | پنل عمده‌فروشی دیجی‌پوش</title>

  <link rel="icon" href="../../favicon.svg" type="image/svg+xml" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="./css/wholesale-panel.css" />
  <link rel="stylesheet" href="../../assets/css/dp-stock.css" />
  <link rel="stylesheet" href="../../assets/css/dp-cursor.css" />
</head>
<body data-dp-page="wholesale-panel">
<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>

<aside class="wp-side" id="wpSide"></aside>

<main class="wp-main" id="main">

  <header class="wp-top">
    <button class="wp-burger" type="button" id="wpBurger" aria-label="منو">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <div class="wp-title">
      <h1>{title}</h1>
      <span>{sub}</span>
    </div>
    <div class="wp-top-acts">{acts}</div>
  </header>

  <div class="wp-content">
{body}
  </div>

</main>

{modals}

<script src="../../seller/js/dp-config.js"></script>
<script src="../../seller/js/dp-store.js"></script>
<script src="../../assets/js/dp-safe.js"></script>
<script src="../../assets/js/dp-stock.js"></script>
<script src="../../assets/js/dp-taxonomy.js"></script>
<script src="../../assets/js/dp-moderation.js"></script>
<script src="../../assets/js/dp-reviews.js"></script>
<script src="../../assets/js/dp-user.js"></script>
<script src="./js/dpw-store.js"></script>
<script src="./js/dpw-boost.js"></script>
<script src="./js/dpw-ui.js"></script>
<script>
{script}
</script>
</body>
</html>
'''


def build(name, title, sub, body, script, acts='', modals=''):
    html = SHELL.format(
        title=title, sub=sub, body=body,
        script=script, acts=acts, modals=modals,
    )
    path = os.path.join(HERE, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  ساخته شد: {name}')


if __name__ == '__main__':
    import pages
    pages.build_all(build)
    print('\n  همه‌ی صفحه‌های پنل عمده‌فروشی ساخته شد.')
