@echo off
echo Starting Cleaning Service Backend...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo Building and starting the backend...
echo.

REM Build and run the backend using exec:java
mvn -f backend/app/pom.xml clean install
mvn -f backend/app/pom.xml exec:java

pause
