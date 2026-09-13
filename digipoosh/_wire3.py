# -*- coding: utf-8 -*-
p = 'assets/js/product.js'
s = open(p, encoding='utf8').read()

# ---------- ۱. رویدادهای تازه ----------
old = """      if (e.target.closest('[data-zoom]')) { openLightbox(); return; }
      if (e.target.closest('[data-lbx]')) { closeLightbox(); return; }
      var lbn = e.target.closest('[data-lbnav]');
      if (lbn) { stepShot(Number(lbn.dataset.lbnav)); return; }"""

new = """      if (e.target.closest('[data-zoom]')) { openLightbox(); return; }
      if (e.target.closest('[data-lbx]')) { closeLightbox(); return; }

      /* \\u0628\\u0632\\u0631\\u06af\\u200c\\u0646\\u0645\\u0627\\u06cc\\u06cc \\u062f\\u0631\\u0648\\u0646 \\u0646\\u0645\\u0627\\u06cc \\u06a9\\u0627\\u0645\\u0644 */
      if (e.target.closest('[data-lbzoom]')) { toggleLbZoom(); return; }

      /* \\u067e\\u0631\\u06cc\\u062f\\u0646 \\u0628\\u0647 \\u0639\\u06a9\\u0633 \\u0627\\u0632 \\u0646\\u0648\\u0627\\u0631 \\u0628\\u0646\\u062f\\u0627\\u0646\\u06af\\u0634\\u062a\\u06cc \\u0646\\u0645\\u0627\\u06cc \\u06a9\\u0627\\u0645\\u0644 */
      var lbg = e.target.closest('[data-lbgo]');
      if (lbg) { jumpShot(Number(lbg.dataset.lbgo)); return; }

      var lbn = e.target.closest('[data-lbnav]');
      if (lbn) { stepShot(Number(lbn.dataset.lbnav)); return; }

      /* ---------- \\u06a9\\u0644\\u06cc\\u06a9 \\u0631\\u0648\\u06cc \\u062e\\u0648\\u062f \\u0639\\u06a9\\u0633 ----------
         \\u0645\\u0634\\u062a\\u0631\\u06cc \\u0627\\u0646\\u062a\\u0638\\u0627\\u0631 \\u062f\\u0627\\u0631\\u062f \\u0628\\u0627 \\u06a9\\u0644\\u06cc\\u06a9 \\u0631\\u0648\\u06cc \\u0639\\u06a9\\u0633\\u060c \\u06af\\u0627\\u0644\\u0631\\u06cc \\u0628\\u0627\\u0632
         \\u0634\\u0648\\u062f \\u2014 \\u0647\\u0645\\u0627\\u0646 \\u06a9\\u0627\\u0631\\u06cc \\u06a9\\u0647 \\u062f\\u0631 \\u062f\\u06cc\\u062c\\u06cc\\u200c\\u06a9\\u0627\\u0644\\u0627 \\u0645\\u06cc\\u200c\\u06a9\\u0646\\u062f.
         \\u062f\\u06a9\\u0645\\u0647\\u200c\\u06cc \\u0628\\u0632\\u0631\\u06af\\u200c\\u0646\\u0645\\u0627\\u06cc\\u06cc \\u0647\\u0645 \\u0645\\u06cc\\u200c\\u0645\\u0627\\u0646\\u062f \\u0628\\u0631\\u0627\\u06cc \\u06a9\\u0633\\u06cc \\u06a9\\u0647 \\u0646\\u0645\\u06cc\\u200c\\u062f\\u0627\\u0646\\u062f. */
      if (e.target.closest('#pdStage') && !document.querySelector('.pd-lightbox')) {
        openLightbox();
        return;
      }"""
assert old in s, 'handlers'
s = s.replace(old, new, 1)

# ---------- ۲. تابع jumpShot ----------
old2 = "  function stepShot(d) {"
new2 = """  /** \\u067e\\u0631\\u06cc\\u062f\\u0646 \\u0645\\u0633\\u062a\\u0642\\u06cc\\u0645 \\u0628\\u0647 \\u06cc\\u06a9 \\u0639\\u06a9\\u0633 */
  function jumpShot(i) {
    var imgs = arr(P.images);
    if (!imgs.length) return;
    shot = Math.max(0, Math.min(imgs.length - 1, Number(i) || 0));
    syncShot();
  }

  /** \\u0647\\u0645\\u0627\\u0647\\u0646\\u06af\\u200c\\u06a9\\u0631\\u062f\\u0646 \\u0647\\u0645\\u0647\\u200c\\u06cc \\u062c\\u0627\\u0647\\u0627\\u06cc\\u06cc \\u06a9\\u0647 \\u0639\\u06a9\\u0633 \\u062f\\u06cc\\u062f\\u0647 \\u0645\\u06cc\\u200c\\u0634\\u0648\\u062f */
  function syncShot() {
    var imgs = arr(P.images);

    var big = document.getElementById('pdLbImg');
    if (big) {
      big.src = imgs[shot];
      /* \\u0628\\u0627 \\u0639\\u0648\\u0636 \\u0634\\u062f\\u0646 \\u0639\\u06a9\\u0633\\u060c \\u0628\\u0632\\u0631\\u06af\\u200c\\u0646\\u0645\\u0627\\u06cc\\u06cc \\u0635\\u0641\\u0631 \\u0645\\u06cc\\u200c\\u0634\\u0648\\u062f */
      big.style.transform = '';
      var stg = document.querySelector('[data-lbstage]');
      if (stg) stg.classList.remove('is-zoom');
    }

    var c = document.querySelector('.pd-lbcount b');
    if (c) c.textContent = FA(shot + 1);

    /* \\u0646\\u0648\\u0627\\u0631 \\u0628\\u0646\\u062f\\u0627\\u0646\\u06af\\u0634\\u062a\\u06cc \\u0646\\u0645\\u0627\\u06cc \\u06a9\\u0627\\u0645\\u0644 */
    document.querySelectorAll('.pd-lb-thumb').forEach(function (t, i) {
      var on = i === shot;
      t.classList.toggle('on', on);
      t.setAttribute('aria-pressed', String(on));
      /* \\u0639\\u06a9\\u0633 \\u0641\\u0639\\u0627\\u0644 \\u0647\\u0645\\u06cc\\u0634\\u0647 \\u062f\\u0631 \\u062f\\u06cc\\u062f \\u0628\\u0645\\u0627\\u0646\\u062f */
      if (on && t.scrollIntoView) {
        try { t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        catch (e) { /* \\u0628\\u06cc\\u200c\\u0627\\u0647\\u0645\\u06cc\\u062a */ }
      }
    });

    paintGallery();
  }

  function stepShot(d) {"""
assert old2 in s, 'stepShot'
s = s.replace(old2, new2, 1)

# ---------- ۳. stepShot از syncShot استفاده کند ----------
old3 = """  function stepShot(d) {
    var imgs = arr(P.images);
    if (imgs.length < 2) return;
    shot = (shot + d + imgs.length) % imgs.length;
    var big = document.getElementById('pdLbImg');
    if (big) big.src = imgs[shot];
    var c = document.querySelector('.pd-lbcount');
    if (c) c.textContent = FA(shot + 1) + ' \\u0627\\u0632 ' + FA(imgs.length);
    paintGallery();
  }"""
new3 = """  function stepShot(d) {
    var imgs = arr(P.images);
    if (imgs.length < 2) return;
    shot = (shot + d + imgs.length) % imgs.length;
    syncShot();
  }"""
assert old3 in s, 'stepShot body'
s = s.replace(old3, new3, 1)

open(p, 'w', encoding='utf8').write(s)
print('ok wire')
