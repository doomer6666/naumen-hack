docker run --name naumen-postgres -e POSTGRES_USER=naumen -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=naumen_db -p 5433:5432 -d postgres:15

docker exec -it naumen-postgres psql -U naumen -d naumen_db

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255) NOT NULL,
role VARCHAR(50) NOT NULL,
team VARCHAR(255) NOT NULL,
password_hash VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/register" -Method Post -ContentType "application/json" -Body '{"name":"Иван Смирнов","role":"newbie","team":"Backend Разработка","password":"password123","email":"ivan@naumen.ru"}'

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/register" -Method Post -ContentType "application/json" -Body '{"name":"Елена Иванова","role":"hr","team":"HR Отдел","password":"password123","email":"elena@naumen.ru"}'

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/register" -Method Post -ContentType "application/json" -Body '{"name":"Алексей Петров","role":"mentor","team":"Backend Разработка","password":"password123","email":"alexey@naumen.ru"}'

go run cmd/auth/main.go
