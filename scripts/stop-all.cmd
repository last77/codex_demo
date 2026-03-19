@echo off
setlocal EnableExtensions

set "MYSQLADMIN_EXE=D:\mysql-system\mysql-9.6.0-winx64\bin\mysqladmin.exe"

echo [INFO] Stopping frontend, backend, and MySQL...

echo [INFO] Checking frontend on port 5173...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr LISTENING ^| findstr /R /C:":5173 "') do (
  if not "%%P"=="0" (
    taskkill /PID %%P /F >nul 2>nul
    if errorlevel 1 (
      echo [WARN] Failed to stop frontend PID %%P
    ) else (
      echo [OK] Stopped frontend PID %%P
    )
  )
)
netstat -ano | findstr LISTENING | findstr /R /C:":5173 " >nul
if errorlevel 1 (
  echo [OK] Frontend is not listening on 5173.
) else (
  echo [WARN] Frontend is still listening on 5173.
)

echo [INFO] Checking backend on port 3000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr LISTENING ^| findstr /R /C:":3000 "') do (
  if not "%%P"=="0" (
    taskkill /PID %%P /F >nul 2>nul
    if errorlevel 1 (
      echo [WARN] Failed to stop backend PID %%P
    ) else (
      echo [OK] Stopped backend PID %%P
    )
  )
)
netstat -ano | findstr LISTENING | findstr /R /C:":3000 " >nul
if errorlevel 1 (
  echo [OK] Backend is not listening on 3000.
) else (
  echo [WARN] Backend is still listening on 3000.
)

if not exist "%MYSQLADMIN_EXE%" (
  echo [WARN] mysqladmin not found, skip graceful MySQL shutdown.
  echo.
  echo [OK] Stop flow completed.
  exit /b 0
)

"%MYSQLADMIN_EXE%" --protocol=TCP -h 127.0.0.1 -P 3306 -u root -p123456 ping >nul 2>nul
if errorlevel 1 (
  echo [INFO] MySQL is not running on port 3306.
  echo.
  echo [OK] Stop flow completed.
  exit /b 0
)

"%MYSQLADMIN_EXE%" --protocol=TCP -h 127.0.0.1 -P 3306 -u root -p123456 shutdown >nul 2>nul
if errorlevel 1 (
  echo [WARN] Graceful MySQL shutdown failed, trying to force stop by port 3306...
  for /f "tokens=5" %%P in ('netstat -ano ^| findstr LISTENING ^| findstr /R /C:":3306 "') do (
    if not "%%P"=="0" (
      taskkill /PID %%P /F >nul 2>nul
      if errorlevel 1 (
        echo [WARN] Failed to stop MySQL PID %%P
      ) else (
        echo [OK] Stopped MySQL PID %%P
      )
    )
  )
) else (
  echo [OK] MySQL stopped.
)

echo.
echo [OK] Stop flow completed.
exit /b 0


