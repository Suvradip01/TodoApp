# Start Todo App in Docker

Write-Host "Starting Todo App Containers..."
docker-compose down
docker-compose up -d --build

Write-Host "Containers started. Checking status..."
docker ps

Write-Host "
Access the app at: http://localhost:5173
Backend API at: http://localhost:5000
"
