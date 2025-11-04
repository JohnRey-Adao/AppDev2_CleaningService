# Docker Setup Guide

This guide explains how to run the Cleaning Service application using Docker.

## Prerequisites

- Docker Desktop (Windows)
- Docker Compose

## Project Structure

The Docker setup consists of:

- **MySQL Database** - Container running MySQL 8.0
- **Spring Boot Backend** - Container running the REST API

## Quick Start

### Start the Application

```bash
docker-start.bat
```

Or manually:
```bash
docker-compose up -d
```

### Stop the Application

```bash
docker-stop.bat
```

Or manually:
```bash
docker-compose down
```

### View Logs

```bash
docker-logs.bat
```

Or manually:
```bash
docker-compose logs -f
```

View backend logs only:
```bash
docker-compose logs -f backend
```

## Services

### Database (MySQL)
- **Container Name**: `mysql_cleaningservice`
- **Port**: 3306
- **Database**: `cleaningservice`
- **Username**: `root`
- **Password**: `Redneedle-21`

### Backend (Spring Boot)
- **Container Name**: `cleaningservice-backend`
- **Port**: 8080
- **API Base URL**: `http://localhost:8080/api`
- **Profile**: Production

## Environment Variables

The backend uses the following environment variables (set in docker-compose.yml):

- `SPRING_DATASOURCE_URL` - Database connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `SPRING_PROFILES_ACTIVE` - Active Spring profile (prod)

## File Volumes

- **MySQL Data**: `mysql_data` Docker volume (persists data)
- **Uploads**: `./uploads` mounted to container (relative to backend/app directory)

## Building the Application

To rebuild the backend after code changes:

```bash
docker-compose build backend
docker-compose up -d
```

## Database Persistence

Database data is persisted in a Docker volume named `mysql_data`. To remove all data:

```bash
docker-compose down -v
```

## Common Commands

### Check Running Containers
```bash
docker-compose ps
```

### Access MySQL Container
```bash
docker exec -it mysql_cleaningservice mysql -uroot -pRedneedle-21 cleaningservice
```

### Access Backend Container
```bash
docker exec -it cleaningservice-backend sh
```

### Restart Services
```bash
docker-compose restart
```

### View Service Status
```bash
docker-compose ps
```

## Troubleshooting

### Port Already in Use

If port 3306 or 8080 is already in use:

1. Edit `docker-compose.yml`
2. Change the port mapping (e.g., `"3307:3306"`)
3. Restart services

### Database Connection Issues

The backend waits for MySQL to be healthy before starting (healthcheck). If backend fails to start:

1. Check MySQL logs: `docker-compose logs db`
2. Wait 30 seconds for MySQL to fully start
3. Restart backend: `docker-compose restart backend`

### Rebuild After Code Changes

```bash
docker-compose build --no-cache backend
docker-compose up -d
```

## Notes

- The application uses `ddl-auto: update` so tables are created automatically
- Database is empty on first run (no init.sql)
- Frontend continues to run separately on port 4200
- Backend API is accessible at `http://localhost:8080/api`

