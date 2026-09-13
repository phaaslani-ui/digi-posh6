#!/bin/bash
# ============================================================
#   دیجی‌پوش — اجرای سایت روی مک و لینوکس
#   ------------------------------------------------------------
#   دوبار روی این فایل کلیک کنید.
#   اگر باز نشد، در ترمینال بنویسید:
#       chmod +x اجرای-سایت.command
# ============================================================

cd "$(dirname "$0")" || exit 1

echo ""
echo "  ============================================"
echo "     دیجی‌پوش — راه‌اندازی سایت"
echo "  ============================================"
echo ""

# ---------- پیدا کردن پایتون ----------
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "  [!] پایتون نصب نیست."
  echo ""
  echo "  روی مک، در ترمینال بنویسید:"
  echo "      xcode-select --install"
  echo ""
  read -r -p "  برای بستن کلید Enter را بزنید…"
  exit 1
fi

echo "  سایت در حال بالا آمدن…"
echo ""
echo "  ============================================"
echo "     نشانی سایت:  http://localhost:8000"
echo "  ============================================"
echo ""
echo "  [i] این پنجره را نبندید تا سایت بالا بماند."
echo "  [i] برای بستن: کلید Control و C را با هم بزنید."
echo ""

# ---------- باز کردن مرورگر ----------
(
  sleep 2
  if command -v open >/dev/null 2>&1; then
    open "http://localhost:8000/index.html"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:8000/index.html"
  fi
) &

$PY -m http.server 8000
