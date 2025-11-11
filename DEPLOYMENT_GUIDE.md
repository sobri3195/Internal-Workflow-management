# Deployment Guide - Workflow Management System

## Production Deployment Checklist

### Pre-Deployment

#### 1. Environment Configuration
```bash
# Copy and configure production environment
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=workflow_management_prod
DB_USER=your-db-user
DB_PASSWORD=strong-password-here

# Security
JWT_SECRET=very-strong-random-secret-key-min-32-chars
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@domain.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# E-Signature (if using)
ESIGN_API_KEY=your-production-api-key
ESIGN_API_URL=https://api.esign-provider.com

# Retention
RETENTION_YEARS=7
```

#### 2. Database Setup
```bash
# Create production database
createdb workflow_management_prod

# Run migrations
NODE_ENV=production npm run migrate

# (Optional) Create initial admin user
NODE_ENV=production npm run seed
```

#### 3. Security Hardening
- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Setup database backups
- [ ] Enable rate limiting
- [ ] Configure CORS properly

---

## Deployment Options

### Option 1: VPS/Dedicated Server (Ubuntu/Debian)

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Setup Application
```bash
# Clone repository
git clone <your-repo-url> /var/www/workflow-management
cd /var/www/workflow-management

# Install dependencies
npm install
cd client && npm install && cd ..

# Build frontend
cd client && npm run build && cd ..

# Setup environment
cp .env.example .env
nano .env

# Run migrations
npm run migrate

# Start with PM2
pm2 start server/index.js --name workflow-api
pm2 startup
pm2 save
```

#### Configure Nginx
```nginx
# /etc/nginx/sites-available/workflow-management
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React build)
    location / {
        root /var/www/workflow-management/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # File uploads
    client_max_body_size 10M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/workflow-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 2: Docker Deployment

#### Create Dockerfile (Backend)
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server ./server

EXPOSE 5000

CMD ["node", "server/index.js"]
```

#### Create Dockerfile (Frontend)
```dockerfile
# client/Dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: workflow_management
      POSTGRES_USER: workflow_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: workflow_management
      DB_USER: workflow_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
# Set environment variables
export DB_PASSWORD=your-db-password
export JWT_SECRET=your-jwt-secret

# Build and start
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# View logs
docker-compose logs -f
```

---

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create workflow-management-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASSWORD=your-password

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

#### AWS (EC2 + RDS)

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.small or larger
   - Security group: Allow 22, 80, 443

2. **Create RDS PostgreSQL**
   - PostgreSQL 14
   - db.t3.micro or larger
   - Note connection details

3. **Deploy** (Follow VPS instructions)

#### DigitalOcean App Platform

1. Create account
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm install && cd client && npm install && npm run build`
   - Run command: `npm run server`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## Post-Deployment

### 1. Create Admin User
```bash
# SSH to server
ssh user@your-server

# Navigate to app
cd /var/www/workflow-management

# Run seed (creates admin user)
npm run seed
```

### 2. Test Application
- [ ] Access frontend URL
- [ ] Login with admin credentials
- [ ] Create test document
- [ ] Upload file
- [ ] Test workflow
- [ ] Check email notifications
- [ ] Verify archive

### 3. Setup Monitoring

#### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### Application Logs
```bash
# View logs
pm2 logs workflow-api

# Monitor
pm2 monit
```

### 4. Backup Strategy

#### Database Backup
```bash
# Create backup script
cat > /usr/local/bin/backup-workflow-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/workflow"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump workflow_management_prod > $BACKUP_DIR/db_backup_$DATE.sql
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-workflow-db.sh

# Schedule daily backup
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-workflow-db.sh
```

#### File Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### 5. Update Strategy

```bash
# Pull latest changes
cd /var/www/workflow-management
git pull origin main

# Install new dependencies
npm install
cd client && npm install && cd ..

# Rebuild frontend
cd client && npm run build && cd ..

# Run any new migrations
npm run migrate

# Restart application
pm2 restart workflow-api
```

---

## Performance Optimization

### 1. Enable Compression
Already included via `compression` middleware in Express

### 2. Database Optimization
```sql
-- Add indexes (already in schema.sql)
-- Run VACUUM regularly
VACUUM ANALYZE;
```

### 3. Caching (Optional)
```bash
# Install Redis
sudo apt install redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
```

### 4. CDN for Static Assets
- Upload build files to CDN
- Update frontend to use CDN URLs

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs workflow-api --lines 100

# Check database connection
psql -h DB_HOST -U DB_USER -d DB_NAME

# Check environment variables
pm2 env 0
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in .env
- Verify firewall allows connection
- Check PostgreSQL pg_hba.conf

### File Upload Issues
```bash
# Check uploads directory
ls -la uploads/
chmod 755 uploads/

# Check disk space
df -h
```

### Email Not Sending
- Verify SMTP credentials
- Check firewall (port 587)
- Test with telnet: `telnet smtp.gmail.com 587`
- For Gmail: Enable "Less secure apps" or use App Password

---

## Security Best Practices

### 1. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node packages
npm audit
npm audit fix
```

### 2. Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Fail2Ban (Brute Force Protection)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 4. SSL Certificate Renewal
```bash
# Auto-renewal with certbot (cron)
sudo certbot renew --dry-run
```

### 5. Database Security
- Use strong passwords
- Limit database user permissions
- Enable SSL for database connections
- Regular backups

---

## Monitoring & Alerts

### 1. Uptime Monitoring
- UptimeRobot (free)
- Pingdom
- StatusCake

### 2. Error Tracking
- Sentry
- Rollbar
- New Relic

### 3. Log Management
- Papertrail
- Loggly
- ELK Stack

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple application instances
- Shared file storage (NFS/S3)
- Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database read replicas

---

## Support & Maintenance

### Regular Tasks
- [ ] Daily: Check logs
- [ ] Daily: Monitor disk space
- [ ] Weekly: Review errors
- [ ] Weekly: Check backups
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: Performance review

### Emergency Contacts
- Server provider support
- Database administrator
- Development team
- Email service provider

---

## Success! 🎉

Your Workflow Management System is now deployed and ready for production use!

For questions or issues, refer to:
- README.md
- API_DOCUMENTATION.md
- IMPLEMENTATION_NOTES.md

**Remember to backup regularly and monitor your application!**
