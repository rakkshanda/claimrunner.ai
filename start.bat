@echo off
REM ============================================================
REM  ClaimRunner - one-click local launcher (Windows)
REM  Double-click this file to build and run the app.
REM  When you see "ClaimRunner backend listening", the app is ready.
REM ============================================================

cd /d "%~dp0"

echo.
echo === ClaimRunner local launcher ===
echo.

REM --- 1. Check Node.js ---------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Please download and install it from https://nodejs.org ^(LTS version^),
  echo then double-click this file again.
  start https://nodejs.org
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo Node.js found: %%v

REM --- 2. Create server\.env if missing -----------------------
if not exist server\.env (
  echo Creating server\.env
  (
    echo SUPABASE_URL=https://yolfaluimelplhjfnyxy.supabase.co
    echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbGZhbHVpbWVscGxoamZueXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjA5NDgsImV4cCI6MjA5NzY5Njk0OH0.YJFwX-DwKa4xx3ISAg7bZLsazLyJkJMdHSPQ6cRGFvY
    echo SUPABASE_SERVICE_ROLE_KEY=sb_secret_Nw9-fm4SDUNtSarwjmMfDw_TYM_Yo7-
    echo PORT=5555
    echo PDF_TEMPLATE_PATH=./templates/notice-of-small-claim-september-2025.pdf
  ) > server\.env
) else (
  echo server\.env already exists
)

REM --- 3. Install dependencies (first run only) ---------------
if not exist node_modules (
  echo Installing frontend dependencies - first run only, a few minutes...
  call npm install
  if errorlevel 1 ( echo ERROR: frontend npm install failed. & pause & exit /b 1 )
)
if not exist server\node_modules (
  echo Installing server dependencies - first run only...
  cd server
  call npm install
  if errorlevel 1 ( echo ERROR: server npm install failed. & cd .. & pause & exit /b 1 )
  cd ..
)
echo Dependencies installed

REM --- 4. Build the frontend (first run only) ------------------
if not exist build\index.html (
  echo Building the frontend - first run only...
  call npm run build
  if errorlevel 1 ( echo ERROR: frontend build failed. & pause & exit /b 1 )
)
echo Frontend build ready

REM --- 5. Build the server (first run only) --------------------
if not exist server\dist\server.js (
  echo Building the server - first run only...
  cd server
  call npm run build
  if errorlevel 1 ( echo ERROR: server build failed. & cd .. & pause & exit /b 1 )
  cd ..
)
echo Server build ready

REM --- 6. Start ------------------------------------------------
echo.
echo Starting ClaimRunner at http://localhost:5555
echo Keep this window open while testing. Close it to stop the app.
echo.
start "" /b cmd /c "timeout /t 3 >nul & start http://localhost:5555"
cd server
call npm start
pause
