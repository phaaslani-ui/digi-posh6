# -*- coding: utf-8 -*-
"""می‌سازد: admin-seller.html — پرونده‌ی کامل یک فروشگاه"""
import pathlib, types, re

D = pathlib.Path('/home/user/admin')
_src = (D / 'build.py').read_text(encoding='utf-8')
_cut = _src.index('# ============================================================\n# ۱. ورود')
BA = types.ModuleType('ba'); BA.__dict__['__file__'] = str(D / 'build.py')
exec(compile(_src[:_cut], 'admin_defs', 'exec'), BA.__dict__)

body = '''    <div id="sdRoot">
      <div class="sd-hero" id="sdHero"></div>
      <div class="sd-tabs" id="sdTabs" role="group" aria-label="بخش‌های پرونده"></div>
      <div id="sdBody"></div>
    </div>

    <!-- مودال نرخ کمیسیون -->
    <div class="modal-overlay" id="cModal">
      <div class="modal">
        <div class="modal-head">
          <h3>تنظیم نرخ کمیسیون</h3>
          <button type="button" data-close aria-label="بستن">%(x)s</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label for="cRate">درصد کمیسیون این فروشگاه</label>
            <input class="input num" id="cRate" inputmode="decimal" />
            <span class="hint">عددی بین ۰ تا ۱۰۰. پیش‌فرض پلتفرم ۱۰ درصد است.</span>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-primary" type="button" id="cConfirm">ذخیره</button>
        </div>
      </div>
    </div>

    <!-- مودال ویرایش کد تخفیف -->
    <div class="modal-overlay" id="eModal">
      <div class="modal">
        <div class="modal-head">
          <h3>ویرایش کد تخفیف</h3>
          <button type="button" data-close aria-label="بستن">%(x)s</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="eId" />
          <div class="info-row">
            <span class="k">کد</span>
            <span class="v"><b id="eCode" style="letter-spacing:1.2px"></b></span>
          </div>
          <div class="info-row">
            <span class="k">نوع</span><span class="v" id="eKind"></span>
          </div>
          <p style="font-size:12.5px;color:var(--gray);margin:12px 0">
            خودِ نوشته‌ی کد و نوعش عوض نمی‌شود — ممکن است مشتری‌ها آن را
            جایی ذخیره کرده باشند. فقط مقدار و شرط‌ها قابل تغییرند.
          </p>
          <div class="field" id="eValRow">
            <label for="eVal" id="eValLbl">مقدار تخفیف</label>
            <input class="input num" id="eVal" inputmode="numeric" />
          </div>
          <div class="field" id="eMaxOffRow">
            <label for="eMaxOff">سقف تخفیف (تومان)</label>
            <input class="input num" id="eMaxOff" inputmode="numeric" placeholder="خالی = بدون سقف" />
          </div>
          <div class="field">
            <label for="eUses">سقف تعداد استفاده</label>
            <input class="input num" id="eUses" inputmode="numeric" placeholder="خالی = بی‌نهایت" />
            <span class="hint">اگر کمتر از تعداد مصرف‌شده بگذارید، کد دیگر کار نمی‌کند.</span>
          </div>
          <div class="field">
            <label for="eTo">تاریخ پایان</label>
            <input class="input" id="eTo" type="date" />
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" type="button" data-close>انصراف</button>
          <button class="btn btn-primary" type="button" id="eConfirm">ذخیره‌ی تغییرها</button>
        </div>
      </div>
    </div>''' % {'x': BA.ico('x')}

script = 'initSellerDetail();'

BA.page('admin-seller.html', 'پرونده‌ی فروشگاه',
        'همه‌چیزِ یک فروشنده در یک صفحه', body, script,
        active='admin-sellers.html')

# فایل‌های جانبی این صفحه
f = D / 'admin-seller.html'
s = f.read_text(encoding='utf-8')
s = s.replace('<script src="js/admin-script.js"></script>',
              '<script src="js/admin-script.js"></script>\n'
              '<script src="js/admin-seller.js"></script>', 1)
s = s.replace('<script src="../assets/js/dp-promo.js"></script>',
              '<script src="../assets/js/dp-promo.js"></script>\n'
              '<script src="../assets/js/dp-boost.js"></script>\n'
              '<script src="../assets/js/dp-moderation.js"></script>', 1)
s = s.replace('<div class="page-title">', '<h1 class="page-title">', 1)
s = s.replace('پرونده‌ی فروشگاه</div>', 'پرونده‌ی فروشگاه</h1>', 1)
s = s.replace('<div class="main">', '<main class="main" id="main">', 1)
s = s.replace('</div>\n\n<div class="toast-wrap">', '</main>\n\n<div class="toast-wrap">', 1)
s = s.replace('<body data-dp-panel>',
              '<body data-dp-panel>\n<a class="dp-skip" href="#main">پرش به محتوای اصلی</a>', 1)
f.write_text(s, encoding='utf-8')
print('✔ admin-seller.html')
