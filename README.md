# TripPlanner AI (MVP)

This repository contains a lightweight MVP for **TripPlanner AI** that mirrors the architecture described in the specification: a TypeScript/Express backend with mocked data and AI-inspired recommendations. The backend exposes endpoints for authentication, itinerary management, recommendations, place search, sharing, and simple weather/event stubs.

## Structure

```
backend/
  src/
    app.ts            # Express app with all API routes
    server.ts         # Server bootstrap with env support
    data.ts           # In-memory mock database with seed data
    types.ts          # Shared TypeScript types
    recommendation.ts # Simple scoring and itinerary builder
```

## Getting Started

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API will start on `http://localhost:3001` (or the `PORT` from your `.env`).

### Key Endpoints

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
