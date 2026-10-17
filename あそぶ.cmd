@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo 初回セットアップを行います。
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo TINTALE を起動します。終了するときはこの画面で Ctrl+C を押してください。
call npm run dev -- --open
