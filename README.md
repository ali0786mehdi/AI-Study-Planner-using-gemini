# AI Study Planner 🧠

A production-ready, full-stack MERN application that generates personalized AI-powered study plans using Google Gemini 2.5 Flash.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript (strict mode)
- **AI**: Google Generative AI SDK (Gemini 2.5 Flash)
- **Dev**: Concurrently (runs both servers from root)

## Project Structure

```
ai-study-planner/
├── package.json              # Root — runs both servers with concurrently
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express entry point (port 5000)
│   │   ├── routes/
│   │   │   └── planner.routes.ts
│   │   ├── controllers/
│   │   │   └── planner.controller.ts
│   │   ├── services/
│   │   │   └── gemini.service.ts
│   │   ├── models/           # Future MongoDB models
│   │   └── types/
│   │       └── index.ts
│   ├── tsconfig.json         # Strict TypeScript config
│   └── .env                  # ⚠️ Add your GEMINI_API_KEY here
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   │   ├── PlannerForm.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── LoadingSkeleton.tsx
    │   │   └── ErrorBanner.tsx
    │   ├── utils/
    │   │   └── api.ts
    │   └── types/
    │       └── index.ts
    ├── tailwind.config.js
    └── postcss.config.js
```

## Quick Start

### 1. Configure your Gemini API Key

```bash
# Edit backend/.env and add your API key
GEMINI_API_KEY=your_actual_key_here
```

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Start development (both servers)

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/planner/health` | Planner service status |
| `POST` | `/api/planner/generate` | Generate AI study plan |

### POST `/api/planner/generate`

**Request Body:**
```json
{
  "subject": "Machine Learning",
  "timeframeDays": 30,
  "currentLevel": "Beginner"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "Machine Learning",
    "overallGoal": "...",
    "dailyPlans": [...],
    "weeklyMilestones": [...],
    "tips": [...]
  }
}
```

## Features

- ✅ Strict TypeScript (both frontend and backend)
- ✅ Glassmorphism dark UI (Vercel/Linear aesthetic)
- ✅ Interactive daily task cards with completion tracking
- ✅ Timeline & Overview grid views
- ✅ Animated loading skeleton during AI generation
- ✅ Graceful error handling (network, API, validation)
- ✅ Modular architecture ready for MongoDB integration
- ✅ SEO-optimized frontend
