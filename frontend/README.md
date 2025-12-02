# Portfolio Frontend

React + TypeScript frontend application for the portfolio website.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📚 Features

- **3D Animations**: Hero section with Three.js/React-Three-Fiber
- **Theme System**: Dark/light mode with smooth transitions
- **Responsive Design**: Mobile-first approach
- **Admin Panel**: Protected dashboard for content management
- **SEO Optimized**: Meta tags, structured data
- **Accessibility**: WCAG 2.1 AA compliant

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React-Three-Fiber / Three.js
- React Router

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚢 Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Other Platforms

The built files in the `dist` directory can be deployed to any static hosting service.

## 🔧 Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

