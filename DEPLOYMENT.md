# Deployment Guide

This guide covers deploying the portfolio website to various platforms.

## Prerequisites

- Backend and frontend built successfully
- Environment variables configured
- MongoDB database (local or cloud)

## Deployment Options

### 1. Vercel (Frontend) + Railway/Render (Backend)

#### Frontend on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run `vercel` and follow prompts
4. Set environment variable `VITE_API_URL` in Vercel dashboard

#### Backend on Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project and add MongoDB service
3. Add Node.js service and connect to GitHub repo
4. Set environment variables in Railway dashboard
5. Deploy

### 2. Netlify (Frontend) + Heroku (Backend)

#### Frontend on Netlify

1. Build frontend: `cd frontend && npm run build`
2. Deploy `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

#### Backend on Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add MongoDB addon: `heroku addons:create mongolab`
5. Set environment variables: `heroku config:set KEY=value`
6. Deploy: `git push heroku main`

### 3. Docker Deployment

1. Build and start services:
```bash
docker-compose up -d
```

2. Initialize admin user:
```bash
docker exec -it portfolio-backend npm run init-admin
```

### 4. AWS/GCP/Azure

#### AWS (EC2 + RDS)

1. Launch EC2 instance
2. Install Docker and Docker Compose
3. Clone repository
4. Configure environment variables
5. Start services with docker-compose
6. Set up RDS for MongoDB or use MongoDB Atlas

#### Google Cloud Platform

1. Use Cloud Run for backend
2. Use Cloud Storage + Cloud CDN for frontend
3. Use Cloud SQL or MongoDB Atlas for database

#### Azure

1. Use App Service for backend
2. Use Static Web Apps for frontend
3. Use Cosmos DB or MongoDB Atlas

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Post-Deployment

1. Initialize admin user (if not done automatically)
2. Test all endpoints
3. Verify email functionality
4. Check CORS settings
5. Set up monitoring and logging
6. Configure SSL certificates
7. Set up domain names

## Monitoring

Consider setting up:
- Error tracking (Sentry, Rollbar)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (Lighthouse CI)

## Security Checklist

- [ ] All environment variables set
- [ ] JWT secret is strong and unique
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Admin password changed from default
- [ ] Database credentials secure
- [ ] Email credentials secure

