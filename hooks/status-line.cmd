@echo off
setlocal

rem Strictly passive Windows launcher for agy-hud.
rem Resolves node.exe from PATH only (never bare cwd) or standard system paths,
rem then invokes only the bundled local renderer.
if "%AGY_HUD_NESTED%"=="1" (
  "%SystemRoot%\System32\more.com" >nul 2>nul
  exit /b 0
)

set "AGY_HUD_NODE="
for %%i in (node.exe) do set "AGY_HUD_NODE=%%~$PATH:i"
if defined AGY_HUD_NODE (
  for %%f in ("%AGY_HUD_NODE%") do set "AGY_HUD_NODE=%%~ff"
)
if /I "%AGY_HUD_NODE%"=="%CD%\node.exe" set "AGY_HUD_NODE="
if not defined AGY_HUD_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "AGY_HUD_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined AGY_HUD_NODE if exist "%LocalAppData%\Programs\nodejs\node.exe" set "AGY_HUD_NODE=%LocalAppData%\Programs\nodejs\node.exe"
if not defined AGY_HUD_NODE (
  echo agy-hud: node not found on PATH>&2
  exit /b 127
)

"%AGY_HUD_NODE%" "%~dp0..\dist\agy-hud.js" statusline
