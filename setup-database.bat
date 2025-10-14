@echo off
echo Setting up Cleaning Service Database...
echo.

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: MySQL is not installed or not in PATH
    echo Please install MySQL 8.0 or higher
    pause
    exit /b 1
)

echo Please enter your MySQL root password:
set /p mysql_password=

echo.
echo Creating database and user...
mysql -u root -p%mysql_password% -e "CREATE DATABASE IF NOT EXISTS cleaningservice;"
mysql -u root -p%mysql_password% -e "CREATE USER IF NOT EXISTS 'cleaningservice'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p%mysql_password% -e "GRANT ALL PRIVILEGES ON cleaningservice.* TO 'cleaningservice'@'localhost';"
mysql -u root -p%mysql_password% -e "FLUSH PRIVILEGES;"

if %errorlevel% neq 0 (
    echo Error: Failed to create database or user
    pause
    exit /b 1
)

echo.
echo Running database initialization script...
mysql -u cleaningservice -ppassword cleaningservice < database/init.sql

if %errorlevel% neq 0 (
    echo Error: Failed to run initialization script
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
echo Database credentials:
echo - Database: cleaningservice
echo - Username: cleaningservice
echo - Password: password
echo.
echo You can now start the backend application.
echo.

pause
