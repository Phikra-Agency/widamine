# Widamine Deployment Guide

## Prerequisites
- Docker 20.10+
- Docker Compose V2
- Git

## Production Deployment with PostgreSQL

### 1. Clone Repository
```bash
git clone https://github.com/Phikra-Agency/widamine.git
cd widamine
git checkout latest
```

### 2. Configure Environment
```bash
cp .env.production.example .env.production
nano .env.production
```

**Important:** Update these values:
- `POSTGRES_PASSWORD` - Strong password for PostgreSQL
- `JWT_SECRET` - Random 32+ character string
- `BREVO_API_KEY` - Your Brevo API key for emails
- `FRONTEND_URL` - Your domain (e.g., https://widamineaestheticcenter.com)
- `ADMIN_URL` - Your admin domain (e.g., https://admin.widamineaestheticcenter.com)

### 3. Build and Start Services
```bash
# Build all services
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f
```

### 4. Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# Test backend health
curl http://localhost:3001/health

# Test landing page
curl http://localhost:8081

# Test admin panel
curl http://localhost:8080
```

## Service Ports

| Service | Internal Port | Default External Port |
|---------|--------------|---------------------|
| PostgreSQL | 5432 | 5432 |
| Backend (NestJS) | 3001 | 3001 |
| Admin Panel | 80 | 8080 |
| Landing Page | 80 | 8081 |

## Coolify Deployment

### Fix Repository Name Error

If you see: `Repository not found for widaminee`:

1. Go to your Coolify dashboard
2. Navigate to your project settings
3. Update the GitHub repository from `Phikra-Agency/widaminee` to `Phikra-Agency/widamine`
4. Save and redeploy

### Coolify Configuration

**Build Pack:** Docker Compose

**Docker Compose File:** `docker-compose.production.yml`

**Environment Variables:** Copy from `.env.production.example` and update values

**Health Check:**
- Path: `/health`
- Port: 3001

**Domains:**
- Landing: `widamineaestheticcenter.com`
- Admin: `admin.widamineaestheticcenter.com`
- Backend API: `api.widamineaestheticcenter.com`

## Database Management

### Run Migrations
```bash
docker-compose -f docker-compose.production.yml exec backend npx prisma migrate deploy
```

### Backup Database
```bash
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U widamine widamine_main > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup_20260804.sql | docker-compose -f docker-compose.production.yml exec -T postgres psql -U widamine widamine_main
```

## Updating Deployment

### Pull Latest Changes
```bash
git pull origin latest
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

### Rolling Back
```bash
git checkout <previous-commit-hash>
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs backend

# Verify database connection
docker-compose -f docker-compose.production.yml exec backend npx prisma db push
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.production.yml exec postgres pg_isready -U widamine

# Reset database (WARNING: DATA LOSS)
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

### Port Conflicts
```bash
# Change ports in .env.production
BACKEND_PORT=3002
ADMIN_PORT=8082
LANDING_PORT=8083
```

## Production Checklist

- [ ] Update `.env.production` with secure values
- [ ] Configure SSL certificates
- [ ] Set up domain DNS records
- [ ] Configure firewall rules
- [ ] Enable automatic backups
- [ ] Set up monitoring (optional)
- [ ] Test all endpoints
- [ ] Verify email sending works
- [ ] Test appointment booking flow

## Support

For issues, contact: support@phikra-agency.com
