# Interview Platform

Collaborative technical interview platform with live video, real‑time chat, shared code editor with execution, and curated coding problems. Built with a modern React + Express + MongoDB stack and Stream for video/chat, Clerk for authentication, and Inngest for user sync events.

![Screenshot](./public/screenshot-for-readme.png)

## Features

- **Authentication (Clerk)**
- **Create/join interview sessions** with selected problem and difficulty
- **Live video calls** using Stream Video SDK
- **Real-time chat** per session using Stream Chat
- **Shared code editor** (Monaco) with **code execution** via Piston API (JS/Python/Java)
- **Problems catalog** and detailed problem view
- **Dashboard** with active sessions, recent sessions, and quick stats
- **Role awareness** for host vs participant within a session

## Tech Stack

- **Frontend**: React 19, Vite, React Router, @tanstack/react-query, TailwindCSS + DaisyUI, @monaco-editor/react, Stream Chat & Video React SDK, Clerk React
- **Backend**: Node.js 20+, Express 5, Mongoose (MongoDB), @clerk/express, stream-chat, @stream-io/node-sdk, Inngest
- **Database**: MongoDB (Mongoose models: `User`, `Session`)
- **Infra/Services**:
  - Clerk (Auth)
  - Stream (Video & Chat)
  - Inngest (User lifecycle event handlers)
  - Piston API (Remote code execution)

## Architecture Overview

- **Frontend** (`/frontend`)
  - Routing: `App.jsx` guards routes via `useUser`
  - State & Data: React Query hooks in `src/hooks/useSessions.js`; API client in `src/lib/axios.js`
  - UI Modules:
    - Pages: `HomePage`, `DashboardPage`, `ProblemsPage`, `ProblemPage`, `SessionPage`
    - Components: `VideoCallUI`, `CodeEditorPanel`, `ProblemDescription`, `ActiveSessions`, `RecentSessions`, `CreateSessionModal`, etc.
  - Code Execution: `src/lib/piston.js` posts to Piston `/execute`
  - Stream: `VideoCallUI` renders Stream Video; chat panel uses `stream-chat-react`

- **Backend** (`/backend`)
  - Entry: `src/server.js` with CORS, JSON, Clerk middleware, and routes
  - Routes:
    - `/api/sessions` (CRUD-like operations for interview sessions)
    - `/api/chat/token` (issues Stream Chat token)
    - `/api/inngest` (Inngest function serving)
  - Controllers: `sessionController.js`, `chatController.js`
  - Auth: `protectRoute` uses `@clerk/express` `requireAuth`
  - Stream integration in `src/lib/stream.js` (video calls + chat client)
  - Inngest functions in `src/lib/inngest.js` for user create/delete syncing with DB and Stream
  - DB: `src/lib/db.js` connects to MongoDB; models in `src/models`

### Data Model

- **User**: `name`, `email` (unique), `profileImage`, `clerkId` (unique)
- **Session**: `problem`, `difficulty` (easy|medium|hard), `host`, `participant?`, `status` (active|completed), `callId`

### Session Lifecycle

1. Host creates a session with `problem` + `difficulty`
2. Backend persists session, creates Stream Video call and Chat channel (ID = `callId`)
3. Participant joins; backend validates availability and adds participant + chat membership
4. Both users join video call; optional chat shows alongside
5. Session can be ended (status becomes `completed`)

## Environment Variables

Create separate `.env` files for frontend and backend.

- **Frontend (`/frontend/.env`)**
  - `VITE_API_URL` = http://localhost:5000/api
  - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk publishable key

- **Backend (`/backend/.env`)**
  - `PORT` = 5000
  - `NODE_ENV` = development
  - `CLIENT_URL` = http://localhost:5173
  - `MONGO_URL` = mongodb connection string
  - `CLERK_SECRET_KEY` = your Clerk secret key
  - `CLERK_PUBLISHABLE_KEY` = your Clerk publishable key (for some middlewares/tools)
  - `INNGEST_EVENT_KEY` = optional; for Inngest events
  - `INNGEST_SIGNING_KEY` = optional; for verifying Inngest webhooks
  - `STREAM_API_KEY` = your Stream key
  - `STREAM_API_SECRET` = your Stream secret

Notes:
- `@clerk/express` reads `CLERK_SECRET_KEY` from env to validate requests.
- CORS must allow `CLIENT_URL` from the frontend.

## Getting Started

Prereqs: Node 20+, npm, MongoDB, Stream account, Clerk account

1. Install dependencies
   - Root build installs both apps: `npm run build` (also builds frontend)
   - Or install separately:
     - Backend: `cd backend && npm install`
     - Frontend: `cd frontend && npm install`

2. Configure env
   - Create `/backend/.env` and `/frontend/.env` with values above

3. Run in development
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`
   - Open http://localhost:5173

4. Sign in
   - The app requires Clerk. Configure your Clerk application’s allowed origins and redirect URLs.

## Build and Run (Production)

- Root scripts:
  - `npm run build` → installs deps and builds frontend
  - `npm start` → runs backend (`node src/server.js`) and serves frontend in production (`express.static`)
- Ensure `NODE_ENV=production` and frontend build exists at `/frontend/dist`.

## API Overview

Base URL: `${VITE_API_URL}` for frontend, `/api` on the backend server

- **Sessions**
  - `POST /api/sessions` → create session `{ problem, difficulty }`
  - `GET /api/sessions/active` → list active sessions
  - `GET /api/sessions/my-recent` → list user’s recent completed sessions
  - `GET /api/sessions/:id` → get session by id
  - `POST /api/sessions/:id/join` → join as participant
  - `POST /api/sessions/:id/end` → end session

- **Chat/Video**
  - `GET /api/chat/token` → get Stream Chat token and user info

- **Inngest**
  - `POST /api/inngest` → Inngest function serving

All session and chat routes require auth (`protectRoute`).

## Frontend Highlights

- **Routes**: `/`, `/dashboard`, `/problems`, `/problem/:id`, `/session/:id`
- **React Query**: `useActiveSessions`, `useCreateSession`, `useMyRecentSessions`, `useSessionById`, `useJoinSession`, `useEndSession`
- **Video + Chat**: `VideoCallUI` integrates Stream Video and `stream-chat-react`
- **Editor + Runner**: Monaco editor + Piston execution in `src/lib/piston.js`

## Development Tips

- Set `CLIENT_URL` and `VITE_API_URL` consistently (e.g., 5173 frontend ↔ 5000 backend)
- Ensure Stream and Clerk environments are configured for local origins
- MongoDB must be reachable from the backend server

## License

This project is provided as-is for educational purposes.
