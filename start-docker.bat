@echo off
echo Starting Financial Management App with Docker...
echo.
echo This will start both the server (port 5000) and client (port 3000)
echo.
echo Building and starting containers...
docker-compose up --build
echo.
echo If you want to run in background, use: docker-compose up -d --build
echo To stop containers: docker-compose down
pause