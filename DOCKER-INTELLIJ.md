# Running Docker in IntelliJ Terminal

## Prerequisites

- Docker Desktop running
- IntelliJ IDEA with integrated terminal

## Terminal Commands

### Navigate to Backend App Module

```bash
cd C:\WebApps_Proj\cleaningservice\backend\app
```

### Start All Services

```bash
docker-compose up -d
```

### Start with Logs (see output in real-time)

```bash
docker-compose up
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Volumes (clean slate)

```bash
docker-compose down -v
```

### View Logs

**All services:**
```bash
docker-compose logs -f
```

**Backend only:**
```bash
docker-compose logs -f backend
```

**Database only:**
```bash
docker-compose logs -f db
```

### Rebuild Backend After Code Changes

```bash
docker-compose build backend
docker-compose up -d
```

### Restart Services

```bash
docker-compose restart
```

### Check Service Status

```bash
docker-compose ps
```

### Access Database

```bash
docker exec -it mysql_cleaningservice mysql -uroot -pRedneedle-21 cleaningservice
```

### Access Backend Container

```bash
docker exec -it cleaningservice-backend sh
```

## Quick Start Workflow

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Check backend is running:**
   ```bash
   docker-compose logs -f backend
   ```
   Press `Ctrl+C` to exit logs

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## Services URLs

- **Backend API**: http://localhost:8080/api
- **Frontend**: http://localhost:4200 (runs separately)
- **MySQL**: localhost:3306

## Troubleshooting

### Check if containers are running

```bash
docker ps
```

### View all containers (including stopped)

```bash
docker ps -a
```

### Restart a specific service

```bash
docker-compose restart backend
```

### View container resource usage

```bash
docker stats
```

### Clean up everything

```bash
docker-compose down -v
docker system prune -a
```

## Build Commands

### Build only backend

```bash
docker-compose build backend
```

### Force rebuild without cache

```bash
docker-compose build --no-cache backend
```

### Build and start in one command

```bash
docker-compose up -d --build
```

## Useful Docker Commands

### List images
```bash
docker images
```

### Remove unused images
```bash
docker image prune
```

### View disk usage
```bash
docker system df
```

## Notes

- The terminal in IntelliJ can be opened with `Alt+F12` (Windows/Linux) or `⌥F12` (Mac)
- Use `Ctrl+C` to stop viewing logs
- Press `q` to exit from mysql command line
- Data persists between restarts unless you use `-v` flag with `down`

