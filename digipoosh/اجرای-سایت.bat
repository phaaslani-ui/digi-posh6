@echo off
chcp 65001 >nul
title دیجی‌پوش — اجرای سایت
color 0E

echo.
echo   ============================================
echo      دیجی‌پوش — راه‌اندازی سایت
echo   ============================================
echo.

REM ---------- پیدا کردن پایتون ----------
where python >nul 2>&1
if %errorlevel%==0 goto :found

where py >nul 2>&1
if %errorlevel%==0 (
  set "PY=py"
  goto :run
)

echo   [!] پایتون روی این کامپیوتر نصب نیست.
echo.
echo   دو راه دارید:
echo.
echo   راه یک ) پایتون را نصب کنید:
echo            https://www.python.org/downloads/
echo            هنگام نصب، تیک "Add to PATH" را بزنید.
echo.
echo   راه دو ) از افزونه‌ی Live Server در VS Code استفاده کنید.
echo.
pause
exit /b

:found
set "PY=python"

:run
cd /d "%~dp0"

echo   سایت در حال بالا آمدن...
echo.
echo   ============================================
echo      نشانی سایت:  http://localhost:8000
echo   ============================================
echo.
echo   [i] این پنجره را نبندید تا سایت بالا بماند.
echo   [i] برای بستن: کلید Ctrl و C را با هم بزنید.
echo.

REM ---------- باز کردن مرورگر پس از دو ثانیه ----------
start "" cmd /c "timeout /t 2 >nul && start http://localhost:8000/index.html"

%PY% -m http.server 8000

pause
