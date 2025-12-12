# Travel Buddy

React Native (Expo) UI and a lightweight Express backend that mirror the TripPlanner AI mockups. The app shows a hero banner, navigation items, and a dashboard with destination search cards. The backend provides simple auth, destinations, and itinerary endpoints.

## Project structure
- `frontend/`: Expo React Native app with reusable components for the hero, header, search bar, and destination cards.
- `backend/`: Node/Express API serving mock destination and itinerary data.

## Running the backend
```bash
cd backend
npm install
npm run dev   # starts on http://localhost:4000
```

## Running the Expo app
```bash
cd frontend
npm install
npx expo start
```
Set `EXPO_PUBLIC_API_URL` in a `.env` file if your backend is not running on the default `http://localhost:4000/api`.

## Key API routes
- `POST /api/auth/login` – demo login that returns a token and user info.
- `GET /api/destinations?search=` – returns destination cards, filtered by a search string.
- `GET /api/itineraries` – fetch saved itineraries.
- `POST /api/itineraries` – add a new itinerary (in-memory).
