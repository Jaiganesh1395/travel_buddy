import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import {
  Activity,
  DashboardActivity,
  DashboardOverview,
  DashboardWelcome,
  Itinerary,
  RecommendedTrip,
  TravelPreferences
} from './types.js';
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

app.get('/api/dashboard/overview', auth, (req: AuthedRequest, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const userTrips = itineraries.filter((it) => it.userId === req.userId);
  const uniqueDestinations = new Set(userTrips.map((itinerary) => itinerary.destination.toLowerCase())).size;
  const totalDaysPlanned = userTrips.reduce((sum, itinerary) => {
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return sum + days;
  }, 0);

  const stats: DashboardOverview['stats'] = [
    { label: 'Trips planned', value: userTrips.length, helper: 'Saved itineraries ready to edit' },
    {
      label: 'Destinations covered',
      value: uniqueDestinations,
      helper: uniqueDestinations === 1 ? 'City in progress' : 'Cities you are tracking'
    },
    {
      label: 'Avg. trip length',
      value: userTrips.length ? Math.round(totalDaysPlanned / userTrips.length) : 0,
      helper: 'Days per itinerary'
    },
    {
      label: 'Activities mapped',
      value: userTrips.reduce((sum, itinerary) => sum + itinerary.activities.flatMap((d) => d.items).length, 0),
      helper: 'Stops across all trips'
    }
  ];

  const interest = user.preferences?.interests?.[0] ?? 'curious traveler';
  const travelPace = user.preferences?.travelPace ?? 'moderate';
  const budget = user.preferences?.budget ?? 'medium';

  const welcome: DashboardWelcome = {
    headline: `Welcome back, ${user.name.split(' ')[0]}`,
    subhead: `You prefer ${travelPace} pacing with a ${budget} budget focus`,
    tip: `We are highlighting ${interest} friendly activities in your top destinations.`
  };

  const scored = [...places].sort((a, b) => scorePlace(b, user.preferences) - scorePlace(a, user.preferences));
  const recommendedTrips: RecommendedTrip[] = scored.slice(0, 3).map((place, idx) => ({
    id: place.id,
    title: `${place.destination} ${place.category === 'tour' ? 'Discovery' : 'Escape'}`,
    destination: place.destination,
    description: `AI-curated highlights featuring ${place.name} plus ${travelPace} pacing picks for ${interest}.`,
    days: 3 + idx,
    aiConfidence: Math.min(0.82 + idx * 0.05, 0.97),
    tags: place.tags
  }));

  const recentActivity: DashboardActivity[] = userTrips
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((itinerary) => ({
      id: itinerary.id,
      title: itinerary.destination,
      subtitle: `${itinerary.status === 'confirmed' ? 'Confirmed' : 'Draft'} • ${itinerary.startDate} - ${itinerary.endDate}`,
      timestamp: itinerary.createdAt.toISOString(),
      status: itinerary.status
    }));

  res.json({ stats, recommendedTrips, welcome, recentActivity });
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

app.post('/api/itineraries/:id/export', auth, (req: AuthedRequest, res) => {
  const itinerary = itineraries.find((it) => it.id === req.params.id && it.userId === req.userId);
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  res.json({
    calendarUrl: `https://calendar.google.com/${itinerary.id}`,
    pdfUrl: `https://tripplanner.ai/pdf/${itinerary.id}`
  });
});

export default app;
