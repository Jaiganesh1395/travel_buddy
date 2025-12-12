import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { destinations } from '../data/destinations.js';
import { itineraries } from '../data/itineraries.js';

config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Simple auth endpoint for demo purposes
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  return res.json({
    token: 'demo-token',
    user: {
      id: 'user-1',
      email,
      name: 'Traveler',
    },
  });
});

// Fetch destinations with optional text search
app.get('/api/destinations', (req, res) => {
  const { search } = req.query;
  if (!search) return res.json(destinations);

  const term = search.toLowerCase();
  const filtered = destinations.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.country.toLowerCase().includes(term) ||
      item.tagline.toLowerCase().includes(term)
  );
  return res.json(filtered);
});

// Itinerary CRUD (in-memory)
app.get('/api/itineraries', (req, res) => {
  res.json(itineraries);
});

app.post('/api/itineraries', (req, res) => {
  const { name, destination, days, highlights = [] } = req.body;
  if (!name || !destination) {
    return res.status(400).json({ message: 'Name and destination are required.' });
  }

  const newItinerary = {
    id: `itinerary-${Date.now()}`,
    name,
    destination,
    days: Number(days) || 3,
    highlights,
  };
  itineraries.push(newItinerary);
  res.status(201).json(newItinerary);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Travel Buddy API listening on http://localhost:${PORT}`);
});
