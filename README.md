<div align="center">
  <img src="src/images/Pomodoro_Planner_Logo.png" alt="Pomodoro Planner logo" width="110" />

  # Pomodoro Planner

  Stay organized, be productive. A full-stack productivity app that combines a
  to-do list, a calendar, a Pomodoro work/break timer, and analytics on how you
  spend your time.

  ### 🔗 <a href="https://pomodoro-scheduler.vercel.app" target="_blank" rel="noopener noreferrer">Live Demo</a>
</div>

---

## Features

- **User accounts** — register and log in; sessions keep you signed in.
- **To-Do list** — add and remove daily tasks, check them off, browse tasks by day with a built-in calendar.
- **Pomodoro timer** — configure work and break intervals, run a countdown timer with start/stop/reset/skip, and tie sessions to a task.
- **Analytics** — track total time, work time, and break time, visualized with charts.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7, Vite 6, Tailwind CSS 4, Chart.js |
| Backend | Node.js, Express 5, express-session, bcryptjs |
| Database | MongoDB (Atlas) |
| Hosting | Frontend on Vercel, Backend on Railway |

## Project structure

```
.
├── backend/
│   ├── server.js           # Express app: auth, tasks, work-stats routes
│   └── DatabaseMongo.js     # Thin MongoDB data-access wrapper
├── src/
│   ├── pages/               # Home, Login, Register, To-Do, Work, Analytics
│   ├── Components/          # Navigation, AuthForm
│   ├── images/              # Logo and checkbox icons
│   ├── config.js            # Reads VITE_API_URL (backend base URL)
│   ├── App.jsx              # Routes
│   └── index.jsx            # React entry point
├── public/                  # Static assets (favicon, logo)
├── index.html               # Vite HTML entry
├── styles.css               # App styles
└── package.json             # Shared deps for frontend + backend
```

> This is a single-package project — the frontend and backend share one
> `package.json` at the repository root (there is no separate `backend/package.json`).

## Getting started (local development)

### Prerequisites

- Node.js 18+ and npm
- A MongoDB connection string (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` (see the [table below](#environment-variables)). At minimum you
need `MONGO_URL` and `SESSION_SECRET`. Generate a session secret with:

```bash
openssl rand -hex 32
```

### 3. Run the app

The backend and frontend run as two separate processes:

```bash
# Terminal 1 — backend API (http://localhost:5001)
node backend/server.js

# Terminal 2 — frontend dev server (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173> in your browser.

## Environment variables

All variables live in `.env` (gitignored). See `.env.example` for a template.

| Variable | Used by | Description |
|----------|---------|-------------|
| `MONGO_URL` | Backend | MongoDB connection string (contains credentials). |
| `SESSION_SECRET` | Backend | Secret used to sign session cookies. |
| `CLIENT_ORIGIN` | Backend | Allowed frontend origin for CORS (e.g. `http://localhost:5173`). |
| `PORT` | Backend | Port the API listens on. Defaults to `5001`. Leave unset on hosts that inject it (Railway). |
| `NODE_ENV` | Backend | Set to `production` in production to enable secure, cross-site session cookies. |
| `VITE_API_URL` | Frontend | Base URL of the backend API. **Baked in at build time.** Falls back to `http://localhost:5001`. |

## API endpoints

All endpoints are served by the Express backend. Authenticated routes rely on the session cookie.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/register` | Create an account and start a session. |
| `POST` | `/login` | Authenticate and start a session. |
| `POST` | `/add-task` | Add a to-do task for a date. |
| `GET`  | `/fetchTasks` | Get tasks for a date. |
| `POST` | `/remove-task` | Delete a task. |
| `POST` | `/add-work` | Record a completed work session. |
| `POST` | `/fetchWorkStats` | Get aggregated work/break statistics. |
| `GET`  | `/api/hello` | Health check. |

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite frontend dev server. |
| `npm run build` | Build the frontend for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `node backend/server.js` | Start the backend API. |

## Deployment

The frontend and backend are deployed as two separate services that point at each other.

### Backend (Railway)

- **Start command:** `node backend/server.js`
- **Environment variables:** `MONGO_URL`, `SESSION_SECRET`, `CLIENT_ORIGIN` (your deployed frontend URL), `NODE_ENV=production`. Do **not** set `PORT` — Railway injects it.

### Frontend (Vercel)

- **Environment variable:** `VITE_API_URL` = your deployed backend URL (with `https://`). Because Vite bakes this in at build time, add it **before** deploying and redeploy after any change.

> The two must agree: the backend's `CLIENT_ORIGIN` is the frontend's URL, and
> the frontend's `VITE_API_URL` is the backend's URL. Use exact origins with
> `https://` and no trailing slash so CORS and cross-site cookies work.
