@echo off
echo 🔑 Recreating Environment Variables
echo ===================================

echo.
echo [INFO] Creating backend/.env file...

REM Copy the template to .env
copy "backend\env-template" "backend\.env"

echo [SUCCESS] Created backend/.env file
echo.
echo [IMPORTANT] You need to fill in these values in backend/.env:
echo.
echo 1. OPENAI_API_KEY - Get from https://platform.openai.com/api-keys
echo 2. MONGODB_URL - Get from MongoDB Atlas
echo 3. SECRET_KEY - Generate a random 32+ character string
echo.
echo [INFO] For SECRET_KEY, you can use this online generator:
echo https://generate-secret.vercel.app/32
echo.
echo [INFO] For MongoDB Atlas:
echo 1. Go to https://www.mongodb.com/atlas
echo 2. Create free cluster
echo 3. Create database user
echo 4. Get connection string
echo.
echo [INFO] For OpenAI API:
echo 1. Go to https://platform.openai.com/api-keys
echo 2. Create new secret key
echo 3. Copy the key (starts with sk-)
echo.
pause
