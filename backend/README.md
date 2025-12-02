# Portfolio Backend API

Express.js backend server with TypeScript, MongoDB, and JWT authentication.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Initialize admin user:
```bash
npm run init-admin
```

4. Start development server:
```bash
npm run dev
```

## 📚 API Endpoints

### Public Endpoints

- `GET /health` - Health check
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get single skill
- `POST /api/contact` - Send contact message
- `GET /api/linkedin/followers` - Get LinkedIn follower count

### Protected Endpoints (Admin Only)

- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/skills` - Create skill
- `PUT /api/skills/:id` - Update skill
- `DELETE /api/skills/:id` - Delete skill

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🛠️ Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run init-admin` - Initialize admin user
- `npm run lint` - Run ESLint

## 🚢 Deployment

The backend can be deployed to:
- Heroku
- Railway
- Render
- AWS/Google Cloud/Azure
- DigitalOcean

Make sure to set all environment variables in your deployment platform.

