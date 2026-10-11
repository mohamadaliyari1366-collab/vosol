@echo off
chcp 65001 >nul
title سامانه داشبورد مدیریتی وصول مطالبات
cls
echo ===================================================================
echo     سامانه داشبورد مدیریتی کنترل و تحلیل وصول مطالبات
echo ===================================================================
echo.
echo در حال بررسی پیش‌نیازها و راه‌اندازی سرور محلی...
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [خطا] نرم‌افزار Node.js روی سیستم شما نصب نیست.
    echo لطفاً ابتدا Node.js را از https://nodejs.org نصب کنید.
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist node_modules (
    echo پوشه کتابخانه‌ها یافت نشد. در حال نصب خودکار وابستگی‌ها (npm install)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [خطا] نصب وابستگی‌ها با مشکل مواجه شد.
        pause
        exit /b 1
    )
)

echo در حال اجرای سامانه بر روی پورت 3000...
echo مرورگر شما تا چند ثانیه دیگر به صورت خودکار باز خواهد شد.
echo آدرس سامانه: http://localhost:3000
echo برای متوقف کردن سرور، کلیدهای Ctrl+C را فشار دهید.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm run dev

pause
