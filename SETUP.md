# Setup Guide

Complete setup instructions for the portfolio website.

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd Portfolio
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
- Set `MONGODB_URI` (local or Atlas)
- Set `JWT_SECRET` (generate a strong secret)
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Configure email settings (optional)

Initialize admin user:
```bash
npm run init-admin
```

Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/portfolio`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `EMAIL_PASS`

### Other Providers

Update `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` accordingly.

## Initial Data

After setup, you can:

1. Login to admin panel at `/admin`
2. Add projects and skills through the admin interface
3. Test contact form

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# Initialize admin user
docker exec -it portfolio-backend npm run init-admin
```

## Troubleshooting

### Backend won't start

- Check MongoDB is running
- Verify `.env` file exists and is configured
- Check port 5000 is not in use

### Frontend can't connect to backend

- Verify backend is running
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend

### Admin login fails

- Run `npm run init-admin` in backend
- Verify credentials in `.env`
- Check MongoDB connection

### Email not sending

- Verify email credentials
- Check SMTP settings
- For Gmail, ensure App Password is used (not regular password)

## Next Steps

1. Customize content (name, bio, etc.)
2. Add your projects and skills via admin panel
3. Configure LinkedIn integration (optional)
4. Deploy to production (see DEPLOYMENT.md)

## Development Tips

- Backend hot-reloads on file changes
- Frontend hot-reloads with Vite
- Check browser console for errors
- Check backend logs in terminal

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ folder
```

See DEPLOYMENT.md for detailed deployment instructions.

