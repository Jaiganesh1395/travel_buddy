import { useEffect, useState } from 'react';
import api from '../api/client';
import { Itinerary, Place, TravelPreferences } from '../types';
import { useAuth } from '../context/AuthContext';
import { ItineraryCard } from '../components/ItineraryCard';
import { PreferenceForm } from '../components/PreferenceForm';

export function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');

  const loadItineraries = async () => {
    const { data } = await api.get<Itinerary[]>('/api/itineraries');
    setItineraries(data);
  };

  const searchPlaces = async () => {
    const { data } = await api.get<Place[]>('/api/places/search', {
      params: { q: query, destination: destinationFilter }
    });
    setPlaces(data);
  };

  const share = async (id: string) => {
    const { data } = await api.post(`/api/share/${id}`);
    setItineraries((prev) => prev.map((it) => (it.id === id ? { ...it, sharedId: data.shareId } : it)));
    alert(`Shareable link: ${data.url}`);
  };

  useEffect(() => {
    loadItineraries();
    // reload profile to get stored preferences
    refreshProfile();
  }, []);

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div className="card" style={{ background: '#eef2ff' }}>
        <h2 className="section-title">Hello, {user?.name}</h2>
        <p style={{ color: '#475569' }}>Your personalized trip workspace.</p>
        <div className="tag-list" style={{ marginTop: '0.5rem' }}>
          <span className="badge">Onboarding</span>
          <span className="badge">Itinerary builder</span>
          <span className="badge">Collaboration</span>
        </div>
      </div>

      <PreferenceForm initial={user?.preferences as TravelPreferences | undefined} onSaved={refreshProfile} />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title">Your itineraries</h3>
          <a className="btn light" href="/plan">
            Plan new trip
          </a>
        </div>
        <div className="grid" style={{ marginTop: '1rem' }}>
          {itineraries.length === 0 && <p style={{ color: '#475569' }}>No itineraries yet. Try generating one from the planner.</p>}
          {itineraries.map((itinerary) => (
            <div key={itinerary.id}>
              <ItineraryCard itinerary={itinerary} />
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn light" onClick={() => share(itinerary.id)}>
                  Share link
                </button>
                <button
                  className="btn light"
                  onClick={async () => {
                    const { data } = await api.post(`/api/itineraries/${itinerary.id}/export`);
                    alert(`Calendar URL: ${data.calendarUrl}`);
                  }}
                >
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Destination & place search</h3>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          <div>
            <label>Query</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="museum" />
          </div>
          <div>
            <label>Destination</label>
            <input value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)} placeholder="lisbon" />
          </div>
        </div>
        <button className="btn" style={{ marginTop: '0.75rem' }} onClick={searchPlaces}>
          Search places
        </button>
        <div className="grid" style={{ marginTop: '1rem' }}>
          {places.map((place) => (
            <div key={place.id} className="card" style={{ borderColor: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="section-title" style={{ marginBottom: 2 }}>
                    {place.name}
                  </p>
                  <p style={{ color: '#475569', margin: 0 }}>{place.category} • {place.destination}</p>
                </div>
                <span className="badge">{place.rating.toFixed(1)}</span>
              </div>
              <div className="tag-list" style={{ marginTop: '0.5rem' }}>
                {place.tags.map((tag) => (
                  <span key={tag} className="badge">
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ marginTop: '0.5rem', color: '#475569' }}>Open: {place.openingHours}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
