@echo off
setlocal enabledelayedexpansion

REM ====================================================
REM   Windows Installer Script for eClassify Project
REM ====================================================

echo ==== Starting installation ====

REM Function-like echo
set "status_message=echo ==== "

%status_message%Installing NVM for Windows

REM Check if NVM is installed
where nvm >nul 2>nul
if %errorlevel% neq 0 (
    echo NVM not found, installing NVM for Windows...
    powershell -Command "Invoke-WebRequest https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.zip -OutFile nvm.zip"
    powershell -Command "Expand-Archive nvm.zip -DestinationPath .\nvm"
    del nvm.zip
    echo Please manually run nvm-setup.exe to finish installation, then restart this script.
    pause
    exit /b
)

REM Install Node.js v20
%status_message%Installing Node.js 20
nvm install 20
nvm use 20

REM Verify Node.js installation
node -v

REM Check if PM2 is installed
pm2 -v >nul 2>nul
if %errorlevel% neq 0 (
    %status_message%Installing PM2 globally
    npm install -g pm2
)

REM Find available port
%status_message%Finding an available port
set "PORT="
for /L %%P in (8003,1,9001) do (
    netstat -ano | findstr ":%%P " >nul
    if errorlevel 1 (
        set "PORT=%%P"
        goto :found_port
    )
)
echo No available ports found between 8003 and 9001
exit /b 1

:found_port
echo Found available port: %PORT%

REM Update .htaccess file
if exist .htaccess (
    %status_message%Updating .htaccess file
    powershell -Command "(Get-Content .htaccess) -replace 'http://127\.0\.0\.1:\d+/', 'http://127.0.0.1:%PORT%/' | Set-Content .htaccess"
)

REM Update package.json file
if exist package.json (
    %status_message%Updating package.json file
    powershell -Command "(Get-Content package.json) -replace 'NODE_PORT=\d*', 'NODE_PORT=%PORT%' | Set-Content package.json"
)

REM Install project dependencies
%status_message%Installing project dependencies
npm install --loglevel verbose

REM Build the project
%status_message%Building the project
npm run build

REM Start the project with PM2
%status_message%Starting the project with PM2
pm2 start npm --name "eClassify" -- start

REM Display PM2 processes
%status_message%Displaying PM2 processes
pm2 ls

%status_message%Installation and deployment complete!
pause
exit /b 0
