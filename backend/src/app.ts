import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Activity, Itinerary, TravelPreferences } from './types.js';
import {
  createItinerary,
  createUser,
  itineraries,
  places,
  shareItinerary,
  users
} from './data.js';
import { buildItinerary, scorePlace } from './recommendation.js';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

type AuthedRequest = express.Request & { userId?: string };

function auth(req: AuthedRequest, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });
  const [, token] = header.split(' ');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TripPlanner API running' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (users.some((u) => u.email === email)) return res.status(409).json({ error: 'Email exists' });
  const user = createUser(email, name ?? 'Traveler', password);
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/user/profile', auth, (req: AuthedRequest, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/user/preferences', auth, (req: AuthedRequest, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.preferences = req.body as TravelPreferences;
  res.json(user);
});

app.post('/api/itineraries', auth, (req: AuthedRequest, res) => {
  const { destination, startDate, endDate, activities } = req.body as Partial<Itinerary>;
  if (!destination || !startDate || !endDate)
    return res.status(400).json({ error: 'Missing itinerary fields' });
  const itinerary = createItinerary(req.userId!, destination, startDate, endDate, activities ?? []);
  res.status(201).json(itinerary);
});

app.get('/api/itineraries', auth, (req: AuthedRequest, res) => {
  res.json(itineraries.filter((it) => it.userId === req.userId));
});

app.get('/api/itineraries/:id', auth, (req: AuthedRequest, res) => {
  const itinerary = itineraries.find((it) => it.id === req.params.id && it.userId === req.userId);
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  res.json(itinerary);
});

app.put('/api/itineraries/:id', auth, (req: AuthedRequest, res) => {
  const itinerary = itineraries.find((it) => it.id === req.params.id && it.userId === req.userId);
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  const { destination, startDate, endDate, activities, status } = req.body as Partial<Itinerary>;
  Object.assign(itinerary, { destination, startDate, endDate, activities, status });
  res.json(itinerary);
});

app.delete('/api/itineraries/:id', auth, (req: AuthedRequest, res) => {
  const index = itineraries.findIndex((it) => it.id === req.params.id && it.userId === req.userId);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = itineraries.splice(index, 1);
  res.json(removed);
});

app.post('/api/recommendations', auth, (req: AuthedRequest, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { destination, days = 3 } = req.body as { destination: string; days: number };
  const destinationPlaces = places.filter((p) => p.destination.toLowerCase() === destination.toLowerCase());
  const sorted = [...destinationPlaces].sort(
    (a, b) => scorePlace(b, user.preferences) - scorePlace(a, user.preferences)
  );
  const itinerary = buildItinerary(sorted, days);
  res.json({ destination, days, itinerary });
});

app.get('/api/places/search', (req, res) => {
  const query = String(req.query.q ?? '').toLowerCase();
  const destination = String(req.query.destination ?? '').toLowerCase();
  const results = places.filter(
    (place) =>
      place.name.toLowerCase().includes(query) &&
      (!destination || place.destination.toLowerCase() === destination)
  );
  res.json(results);
});

app.get('/api/places/:id', (req, res) => {
  const place = places.find((p) => p.id === req.params.id);
  if (!place) return res.status(404).json({ error: 'Place not found' });
  res.json(place);
});

app.post('/api/share/:itineraryId', auth, (req: AuthedRequest, res) => {
  const shareId = shareItinerary(req.params.itineraryId);
  if (!shareId) return res.status(404).json({ error: 'Itinerary not found' });
  res.json({ shareId, url: `/share/${shareId}` });
});

app.get('/api/share/:shareId', (req, res) => {
  const itinerary = itineraries.find((it) => it.sharedId === req.params.shareId);
  if (!itinerary) return res.status(404).json({ error: 'Shared itinerary not found' });
  res.json(itinerary);
});

app.get('/api/weather/:location', (req, res) => {
  const location = req.params.location;
  res.json({
    location,
    forecast: [
      { day: 'Monday', high: 26, low: 18, summary: 'Sunny' },
      { day: 'Tuesday', high: 24, low: 17, summary: 'Partly cloudy' }
    ]
  });
});

app.get('/api/events/:location', (req, res) => {
  const location = req.params.location;
  res.json({
    location,
    events: [
      { title: 'Local Market', date: '2024-08-02', category: 'Food' },
      { title: 'Street Music Festival', date: '2024-08-03', category: 'Music' }
    ]
  });
});

app.post('/api/itineraries/:id/comments', (_req, res) => {
  res.status(201).json({ message: 'Comment recorded for MVP' });
});

app.post('/api/itineraries/:id/export', (req, res) => {
  const itinerary = itineraries.find((it) => it.id === req.params.id);
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  res.json({
    calendarUrl: `https://calendar.google.com/${itinerary.id}`,
    pdfUrl: `https://tripplanner.ai/pdf/${itinerary.id}`
  });
});

export default app;
