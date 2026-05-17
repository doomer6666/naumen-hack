docker run --name naumen-postgres -e POSTGRES_USER=naumen -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=naumen_db -p 5433:5432 -d postgres:15

docker exec -it naumen-postgres psql -U naumen -d naumen_db
