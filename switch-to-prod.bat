@echo off
echo Switching to production requirements...
copy backend\requirements-production.txt backend\requirements.txt
echo Done! Now using production requirements (pydantic 1.10.13)
echo Ready for Railway deployment.
