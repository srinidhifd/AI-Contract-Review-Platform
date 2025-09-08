@echo off
echo 🧹 Preparing AI Contract Review Platform for GitHub
echo ==================================================

echo.
echo [INFO] Cleaning up repository...

REM Remove node_modules if it exists
if exist "frontend\node_modules" (
    echo [INFO] Removing frontend\node_modules...
    rmdir /s /q "frontend\node_modules"
    echo [SUCCESS] Removed frontend\node_modules
)

REM Remove dist folder if it exists
if exist "frontend\dist" (
    echo [INFO] Removing frontend\dist...
    rmdir /s /q "frontend\dist"
    echo [SUCCESS] Removed frontend\dist
)

REM Remove Python virtual environment if it exists
if exist "backend\venv" (
    echo [INFO] Removing backend\venv...
    rmdir /s /q "backend\venv"
    echo [SUCCESS] Removed backend\venv
)

REM Remove __pycache__ directories
echo [INFO] Removing Python cache files...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d"
del /s /q *.pyc 2>nul
echo [SUCCESS] Removed Python cache files

REM Remove uploaded files (keep the directory structure)
if exist "backend\uploads" (
    echo [INFO] Clearing uploaded files...
    del /q "backend\uploads\*" 2>nul
    echo [SUCCESS] Cleared uploaded files
)

REM Remove vector store data
if exist "backend\data" (
    echo [INFO] Clearing vector store data...
    del /q "backend\data\*" 2>nul
    echo [SUCCESS] Cleared vector store data
)

REM Remove any .env files
echo [INFO] Checking for .env files...
del /s /q .env 2>nul
echo [SUCCESS] Removed .env files

REM Remove IDE files
echo [INFO] Removing IDE files...
rmdir /s /q .vscode 2>nul
rmdir /s /q .idea 2>nul
del /s /q *.swp 2>nul
del /s /q *.swo 2>nul
echo [SUCCESS] Removed IDE files

REM Remove OS files
echo [INFO] Removing OS files...
del /s /q .DS_Store 2>nul
del /s /q Thumbs.db 2>nul
echo [SUCCESS] Removed OS files

REM Remove log files
echo [INFO] Removing log files...
del /s /q *.log 2>nul
echo [SUCCESS] Removed log files

echo.
echo [INFO] Creating necessary directories...

REM Create uploads directory
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "uploads" mkdir "uploads"

REM Create data directory
if not exist "backend\data" mkdir "backend\data"

REM Create .gitkeep files to maintain directory structure
echo. > "backend\uploads\.gitkeep"
echo. > "uploads\.gitkeep"
echo. > "backend\data\.gitkeep"

echo [SUCCESS] Created necessary directories

echo.
echo [INFO] Verifying .gitignore files...

if not exist ".gitignore" (
    echo [ERROR] Root .gitignore file not found!
    pause
    exit /b 1
)

if not exist "frontend\.gitignore" (
    echo [ERROR] Frontend .gitignore file not found!
    pause
    exit /b 1
)

if not exist "backend\.gitignore" (
    echo [ERROR] Backend .gitignore file not found!
    pause
    exit /b 1
)

echo [SUCCESS] All .gitignore files are present

echo.
echo [SUCCESS] Repository cleanup completed!
echo.
echo Next steps:
echo 1. Review the changes: git status
echo 2. Add files: git add .
echo 3. Commit: git commit -m "Initial commit"
echo 4. Push to GitHub: git push origin main
echo.
echo Important:
echo - Make sure to set up environment variables in your hosting platforms
echo - Never commit .env files with real API keys
echo - Test your application after deployment
echo.
pause
