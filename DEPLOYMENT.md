# Deployment Guide - Etsy Listing Optimizer

This guide provides comprehensive instructions for deploying the Etsy Listing Optimizer application using Docker to various environments including VPS servers and platforms like Coolify.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Deploying to VPS](#deploying-to-vps)
- [Deploying to Coolify](#deploying-to-coolify)
- [Configuration](#configuration)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Required Credentials

- **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **PostgreSQL Password**: Choose a secure password for your database

## Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/etsy-listing-optimizer.git
cd etsy-listing-optimizer
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# Database Configuration
POSTGRES_DB=etsy_optimizer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Database URL
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/etsy_optimizer

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Application
MAX_OPTIMIZATIONS_PER_DAY=5
CONTACT_EMAIL=support@yourdomain.com
APP_PORT=3000
NODE_ENV=production
```

### 3. Start the Application

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL image
- Build the application image
- Start both containers
- Initialize the database
- Run database migrations
- Start the Next.js application

### 4. Verify Deployment

Check that containers are running:

```bash
docker-compose ps
```

Check application health:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-08T...",
  "database": "connected"
}
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Deploying to VPS

### Option 1: Using Docker Compose (Recommended)

#### 1. Prepare Your VPS

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Transfer Files to VPS

Using Git:
```bash
git clone https://github.com/yourusername/etsy-listing-optimizer.git
cd etsy-listing-optimizer
```

Or using SCP:
```bash
# From your local machine
scp -r /path/to/etsy-listing-optimizer user@your-vps-ip:/home/user/
```

#### 3. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your values
```

#### 4. Deploy

```bash
docker-compose up -d
```

#### 5. Set Up Reverse Proxy (Nginx)

Install Nginx:
```bash
sudo apt install nginx -y
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/etsy-optimizer
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/etsy-optimizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Manual Docker Deployment

If you prefer to run containers individually:

#### 1. Create Docker Network

```bash
docker network create etsy-optimizer-network
```

#### 2. Run PostgreSQL Container

```bash
docker run -d \
  --name etsy-optimizer-db \
  --network etsy-optimizer-network \
  -e POSTGRES_DB=etsy_optimizer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_secure_password \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 3. Build Application Image

```bash
docker build -t etsy-optimizer-app .
```

#### 4. Run Application Container

```bash
docker run -d \
  --name etsy-optimizer-app \
  --network etsy-optimizer-network \
  -e DATABASE_URL=postgresql://postgres:your_secure_password@etsy-optimizer-db:5432/etsy_optimizer \
  -e GEMINI_API_KEY=your_gemini_api_key \
  -e MAX_OPTIMIZATIONS_PER_DAY=5 \
  -e CONTACT_EMAIL=support@yourdomain.com \
  -e NODE_ENV=production \
  -p 3000:3000 \
  etsy-optimizer-app
```

## Deploying to Coolify

Coolify is a self-hosted Heroku/Netlify alternative that makes deployment simple.

### Prerequisites

- Coolify installed on your server
- Git repository (GitHub, GitLab, or Gitea)

### Deployment Steps

#### 1. Add New Resource in Coolify

1. Log into your Coolify dashboard
2. Navigate to your project
3. Click "Add New Resource"
4. Select "Docker Compose" as the resource type

#### 2. Configure the Deployment

1. **Source**: Select your Git repository
2. **Branch**: Choose your deployment branch (e.g., `main`)
3. **Docker Compose Location**: Leave as default (root directory)

#### 3. Set Environment Variables

In Coolify's environment variables section, add:

```env
POSTGRES_DB=etsy_optimizer
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/etsy_optimizer
GEMINI_API_KEY=your_gemini_api_key_here
MAX_OPTIMIZATIONS_PER_DAY=5
CONTACT_EMAIL=support@yourdomain.com
APP_PORT=3000
NODE_ENV=production
```

#### 4. Configure Domain

1. In Coolify, go to "Domains"
2. Add your custom domain or use Coolify's subdomain
3. Enable automatic SSL (Coolify handles Let's Encrypt)

#### 5. Deploy

Click "Deploy" and Coolify will:
- Clone your repository
- Build the Docker images
- Start the containers
- Configure SSL
- Set up health checks

#### 6. Monitor Deployment

- Check logs in real-time through Coolify's interface
- Monitor resource usage (CPU, memory, disk)
- Set up alerts for downtime

### Coolify-Specific Tips

1. **Automatic Deployments**: Enable webhook for automatic deployments on git push
2. **Database Backups**: Configure automated backups in Coolify settings
3. **Scaling**: Adjust container resources in Coolify's resource settings
4. **Monitoring**: Use Coolify's built-in monitoring dashboard

## Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_DB` | Yes | `etsy_optimizer` | PostgreSQL database name |
| `POSTGRES_USER` | Yes | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes | - | PostgreSQL password (secure!) |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |
| `DATABASE_URL` | Yes | - | Full database connection string |
| `GEMINI_API_KEY` | Yes | - | Google Gemini AI API key |
| `MAX_OPTIMIZATIONS_PER_DAY` | No | `5` | Daily optimization limit per email |
| `CONTACT_EMAIL` | No | `support@example.com` | Support contact email |
| `APP_PORT` | No | `3000` | Application port |
| `NODE_ENV` | Yes | `production` | Node environment |

### Security Best Practices

1. **Strong Passwords**: Use complex passwords for database
2. **Secret Management**: Never commit `.env` to version control
3. **API Keys**: Rotate Gemini API keys regularly
4. **HTTPS**: Always use SSL in production
5. **Firewall**: Configure firewall to allow only necessary ports
6. **Updates**: Keep Docker images and dependencies updated

## Maintenance

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Application only
docker-compose logs -f app

# Database only
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app
```

### Stopping the Application

```bash
docker-compose down
```

### Stopping and Removing Volumes (Clean Slate)

⚠️ **Warning**: This will delete all database data!

```bash
docker-compose down -v
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Database Backups

#### Manual Backup

```bash
docker-compose exec db pg_dump -U postgres etsy_optimizer > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore from Backup

```bash
docker-compose exec -T db psql -U postgres etsy_optimizer < backup_file.sql
```

#### Automated Backups

Create a cron job:

```bash
crontab -e
```

Add daily backup at 2 AM:

```cron
0 2 * * * cd /path/to/etsy-listing-optimizer && docker-compose exec -T db pg_dump -U postgres etsy_optimizer > /backups/etsy_optimizer_$(date +\%Y\%m\%d).sql
```

### Monitoring

#### Check Container Health

```bash
docker-compose ps
```

#### Monitor Resource Usage

```bash
docker stats
```

#### Check Application Health Endpoint

```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### Application Won't Start

1. **Check logs**:
   ```bash
   docker-compose logs app
   ```

2. **Verify environment variables**:
   ```bash
   docker-compose config
   ```

3. **Ensure database is ready**:
   ```bash
   docker-compose logs db
   ```

### Database Connection Issues

1. **Check database health**:
   ```bash
   docker-compose exec db pg_isready -U postgres
   ```

2. **Verify DATABASE_URL format**:
   ```
   postgresql://user:password@host:port/database
   ```

3. **Test connection**:
   ```bash
   docker-compose exec app bun run db:push
   ```

### Port Already in Use

Change the port in `.env`:

```env
APP_PORT=8080
```

Or find the process using the port:

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Out of Disk Space

Check disk usage:

```bash
docker system df
```

Clean up unused resources:

```bash
docker system prune -a
```

### Performance Issues

1. **Check resource usage**:
   ```bash
   docker stats
   ```

2. **Increase container resources** (in docker-compose.yml):
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

3. **Scale horizontally**: Use a load balancer with multiple app instances

### SSL Certificate Issues

If using Certbot:

```bash
sudo certbot renew --dry-run
```

### Health Check Failures

1. **Check endpoint directly**:
   ```bash
   docker-compose exec app curl http://localhost:3000/api/health
   ```

2. **Verify database connectivity**:
   ```bash
   docker-compose exec app bun run db:push
   ```

## Production Checklist

Before going live, ensure:

- [ ] Environment variables are properly set
- [ ] Database password is secure
- [ ] SSL certificate is configured
- [ ] Domain DNS is pointing to your server
- [ ] Firewall rules are configured
- [ ] Automated backups are scheduled
- [ ] Monitoring is set up
- [ ] Health checks are passing
- [ ] Logs are accessible
- [ ] Resource limits are configured
- [ ] Contact email is valid
- [ ] API rate limits are appropriate

## Support

For issues or questions:

1. Check the [main README](README.md)
2. Review application logs
3. Consult [CLAUDE.md](CLAUDE.md) for architecture details
4. Open an issue on GitHub

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
