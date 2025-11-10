# Deployment Guide

Deploy Killjoy to production in 3 options.

## Option 1: Railway (Recommended - Easiest)

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Deploy Backend

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize Railway project in root directory
railway init

# Add PostgreSQL plugin
railway add

# Deploy
railway up
```

### Step 3: Deploy Frontend

```bash
cd frontend

# Update vite.config.ts with backend URL
# Then build
npm run build

# Deploy to Vercel (see Option 3)
# Or deploy dist/ manually
```

## Option 2: Render.com (Docker-based)

### Step 1: Prepare

Create `Dockerfile` in root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

Create `.dockerignore`:

```
node_modules
frontend/node_modules
frontend/dist
dist
.env
.git
```

### Step 2: Deploy

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Select root directory
5. Build command: `npm run build`
6. Start command: `npm start`
7. Add environment variables from `.env`
8. Deploy

## Option 3: Vercel (Frontend)

### Deploy Frontend

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Connect to GitHub repo for auto-deploys
```

### Configure Environment

In Vercel dashboard:

1. Go to Settings → Environment Variables
2. Add `VITE_API_BASE_URL=https://your-backend.railway.app`
3. Update `frontend/src/api/client.ts` baseURL

## Option 4: AWS (Advanced)

### Backend on EC2:

1. Create EC2 instance (Ubuntu 22.04)
2. SSH into instance
3. Install Node.js and PostgreSQL
4. Clone repo
5. Configure `.env`
6. Run `npm run build && npm start`
7. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start dist/index.js --name killjoy
pm2 startup
pm2 save
```

### Frontend on S3:

1. Build frontend: `npm run build`
2. Create S3 bucket
3. Upload `dist/` contents
4. Enable CloudFront CDN
5. Configure domain

## Production Environment Variables

Update these for production:

```env
NODE_ENV=production
PORT=3000

# Database (Use managed service)
DB_HOST=your-db-host.railway.dev
DB_PORT=5432
DB_NAME=killjoy
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Telegram
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_WEBHOOK_SECRET=your_secret

# Notion (if using)
NOTION_API_KEY=your_key
NOTION_CALENDAR_DB_ID=your_id

# Frontend
FRONTEND_URL=https://your-domain.com

# Workout Bot
WORKOUT_BOT_TOKEN=8585822791:AAEl9hwTzz0bLNv6ZUln-mrfwwUSrX9M88o
```

## Update Telegram Bot

1. Message @BotFather
2. Select your bot
3. "Bot Settings" → "Menu Button"
4. Update URL to your production domain:
   ```
   https://your-killjoy-domain.com
   ```

## Setup HTTPS

### Option 1: Railway/Render (Automatic)
- Both services provide free HTTPS automatically

### Option 2: Let's Encrypt
```bash
sudo apt install certbot nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Option 3: Cloudflare
1. Add domain to Cloudflare
2. Enable SSL/TLS (Full mode)
3. Update DNS records

## Database Backups

### Railway
- Automatic daily backups in Railway dashboard

### Render
- Configure automated backups in Postgres settings

### Manual
```bash
# Backup
pg_dump killjoy_db > backup.sql

# Restore
psql killjoy_db < backup.sql
```

## Monitoring

### Logs

**Railway:**
```bash
railway logs
```

**Render:**
- Check dashboard → Logs

**Custom Server:**
```bash
pm2 logs killjoy
```

### Health Checks

Monitor endpoint:
```
https://your-domain.com/health
```

Set up monitoring with:
- Uptime Robot (free)
- Better Stack (recommended)
- Datadog

## Scaling

### Increase Backend Capacity
- Railway: Upgrade plan
- Render: Configure auto-scaling
- AWS: Use load balancer + multiple instances

### Database Scaling
- Use connection pooling (pgBouncer)
- Add read replicas for scaling reads
- Archive old data regularly

## Troubleshooting Deployment

### "Build failed"
- Check build logs
- Ensure all dependencies installed
- Verify TypeScript compiles: `npm run build`

### "Cannot connect to database"
- Verify database is accessible
- Check credentials in environment
- Ensure firewall allows connection

### "Frontend blank/errors"
- Check API URL in vite.config.ts
- Verify CORS is enabled
- Check browser console for errors

### "Telegram Mini App not responding"
- Verify Mini App URL is correct
- Check bot token is valid
- Ensure frontend URL is HTTPS

## Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build && vite-analyze
```

### Backend
- Enable query result caching
- Implement database connection pooling
- Use CDN for static assets

## SSL Certificate

For custom domains:

```bash
# Update nginx config to use certificates
sudo nano /etc/nginx/sites-available/default

# Add:
ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;

# Restart nginx
sudo systemctl restart nginx
```

## Auto-Renewal

```bash
# Auto-renew Let's Encrypt certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Next Steps

1. Test in production thoroughly
2. Set up monitoring/alerts
3. Create runbook for common issues
4. Plan for scaling
5. Enable analytics

## Support

For deployment issues:
- Railway: https://railway.app/support
- Render: https://render.com/docs
- AWS: https://aws.amazon.com/support
