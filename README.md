# TripPlanner AI (MVP)

This repository contains a lightweight MVP for **TripPlanner AI** that mirrors the architecture described in the specification:
a TypeScript/Express backend with mocked data and AI-inspired recommendations plus a React/Vite web UI to exercise the workflows.

## Structure

```
backend/
  src/
    app.ts            # Express app with all API routes
    server.ts         # Server bootstrap with env support
    data.ts           # In-memory mock database with seed data
    types.ts          # Shared TypeScript types
    recommendation.ts # Simple scoring and itinerary builder
frontend/
  src/
    pages/            # Auth, dashboard, planner, itinerary detail screens
    components/       # Shared UI widgets and planners
    api/client.ts     # Axios instance configured for the backend
```

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API will start on `http://localhost:3001` (or the `PORT` from your `.env`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the UI points to `http://localhost:3001`. Override with `VITE_API_BASE_URL` if needed.

## Key Endpoints

- `POST /api/auth/signup` — create a user and receive a JWT
- `POST /api/auth/login` — authenticate demo or created users
- `GET /api/user/profile` — fetch the authenticated profile
- `POST /api/itineraries` — create itineraries
- `GET /api/itineraries` — list itineraries for the authenticated user
- `POST /api/recommendations` — generate a simple itinerary from preferences
- `GET /api/places/search` — search seeded places by name/destination
- `POST /api/share/:itineraryId` — produce a share token for an itinerary
- `GET /api/weather/:location` — mock weather data for a location

> This MVP keeps data in-memory for clarity. Replace the data layer with PostgreSQL/Redis and integrate real APIs to progress toward production readiness.
