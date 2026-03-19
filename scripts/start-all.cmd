@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0.."
for %%I in ("%ROOT%") do set "ROOT=%%~fI"

set "MYSQLD_EXE=D:\mysql-system\mysql-9.6.0-winx64\bin\mysqld.exe"
set "MYSQL_INI=D:\mysql-system\my.ini"

set "BACKEND_DIR=%ROOT%\backend"
set "FRONTEND_DIR=%ROOT%\frontend"

echo [INFO] Project root: %ROOT%

call :ensure_mysql
if errorlevel 1 goto :error

call :ensure_backend_env
if errorlevel 1 goto :error

call :start_backend
if errorlevel 1 goto :error

call :start_frontend
if errorlevel 1 goto :error

echo.
echo [OK] Services are ready:
echo   Frontend: http://127.0.0.1:5173/products
echo   Backend:  http://127.0.0.1:3000/api/health
echo [INFO] Open the frontend URL in your browser.
exit /b 0

:error
echo.
echo [ERROR] Startup failed. Please check terminal output and port status.
exit /b 1

:ensure_mysql
if not exist "%MYSQLD_EXE%" (
  echo [ERROR] mysqld not found: %MYSQLD_EXE%
  exit /b 1
)
if not exist "%MYSQL_INI%" (
  echo [ERROR] my.ini not found: %MYSQL_INI%
  exit /b 1
)

call :is_port_listening 3306
if not errorlevel 1 (
  echo [INFO] MySQL is already running on port 3306. Skip.
  exit /b 0
)

echo [INFO] Starting MySQL...
start "" /min cmd /c "\"%MYSQLD_EXE%\" --defaults-file=\"%MYSQL_INI%\""
call :wait_port 3306 20
if errorlevel 1 (
  echo [ERROR] MySQL start timeout. Port 3306 is not listening.
  exit /b 1
)
echo [OK] MySQL started.
exit /b 0

:ensure_backend_env
if exist "%BACKEND_DIR%\.env" (
  echo [INFO] backend\.env already exists.
  exit /b 0
)
if not exist "%BACKEND_DIR%\.env.example" (
  echo [ERROR] backend\.env.example is missing.
  exit /b 1
)
copy /Y "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
echo [OK] backend\.env created.
exit /b 0

:start_backend
call :is_port_listening 3000
if not errorlevel 1 (
  echo [INFO] Backend is already running on port 3000. Skip.
  exit /b 0
)

echo [INFO] Starting backend (3000)...
start "" /min cmd /c "cd /d \"%BACKEND_DIR%\" && npm.cmd run start"
call :wait_port 3000 20
if errorlevel 1 (
  echo [ERROR] Backend start timeout. Port 3000 is not listening.
  exit /b 1
)
echo [OK] Backend started.
exit /b 0

:start_frontend
call :is_port_listening 5173
if not errorlevel 1 (
  echo [INFO] Frontend is already running on port 5173. Skip.
  exit /b 0
)

echo [INFO] Starting frontend (5173)...
start "" /min cmd /c "cd /d \"%FRONTEND_DIR%\" && npm.cmd run dev -- --host 0.0.0.0 --port 5173"
call :wait_port 5173 25
if errorlevel 1 (
  echo [ERROR] Frontend start timeout. Port 5173 is not listening.
  exit /b 1
)
echo [OK] Frontend started.
exit /b 0

:is_port_listening
set "PORT=%~1"
netstat -ano | findstr LISTENING | findstr /R /C:":%PORT% " >nul
exit /b %errorlevel%

:wait_port
set "PORT=%~1"
set "TRY_COUNT=%~2"
for /L %%N in (1,1,%TRY_COUNT%) do (
  call :is_port_listening %PORT%
  if not errorlevel 1 exit /b 0
  ping -n 2 127.0.0.1 >nul
)
exit /b 1



