@echo off
cd /d "%~dp0.."
echo Syncing Sanity env vars from .env.local to Vercel (production + preview)...
node --env-file=.env.local scripts\vercel-push-sanity-env.mjs
if errorlevel 1 exit /b 1
echo.
echo Verifying...
node --env-file=.env.local scripts\vercel-verify-sanity-env.mjs
exit /b %errorlevel%
