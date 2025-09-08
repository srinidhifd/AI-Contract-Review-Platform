#!/bin/bash

# Start script for Railway deployment
echo "Starting AI Contract Review Platform..."

# Set Python path
export PYTHONPATH=/app

# Run the application
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
