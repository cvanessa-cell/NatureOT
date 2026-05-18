@echo off
cd /d "%~dp0.."
node scripts\sanity-login.mjs %*
exit /b %errorlevel%
