@echo off
echo Starting Cleaning Service Frontend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH
    echo Please install npm
    pause
    exit /b 1
)

REM Determine target module (default to webstore)
set TARGET=%1
if "%TARGET%"=="" set TARGET=webstore

echo Target module: %TARGET%

if /I "%TARGET%"=="webstore" (
    if not exist webstore (
        echo Error: webstore directory not found
        pause
        exit /b 1
    )
    cd webstore
) else if /I "%TARGET%"=="admin" (
    if not exist admin (
        echo Error: admin directory not found
        pause
        exit /b 1
    )
    cd admin
) else (
    if not exist frontend (
        echo Error: frontend directory not found
        pause
        exit /b 1
    )
    cd frontend
)

echo Installing dependencies in %cd% ...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting the frontend development server...
echo The application will be available at http://localhost:4200
echo.

npm start

pause
