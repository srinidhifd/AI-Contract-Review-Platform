@echo off
echo Switching to development requirements...
copy backend\requirements-dev.txt backend\requirements.txt
echo Done! Now using development requirements (pydantic 2.5.0)
echo You can run your local development server.
