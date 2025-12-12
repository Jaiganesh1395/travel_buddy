import { useEffect, useState } from 'react';
import api from '../api/client';
import {
  DashboardActivity,
  DashboardOverview,
  Itinerary,
  Place,
  RecommendedTrip,
  TravelPreferences
} from '../types';
import { useAuth } from '../context/AuthContext';
import { ItineraryCard } from '../components/ItineraryCard';
import { PreferenceForm } from '../components/PreferenceForm';

export function Dashboard() {
  const { user, refreshProfile } = useAuth();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [itineraryRes, overviewRes] = await Promise.all([
        api.get<Itinerary[]>('/api/itineraries'),
        api.get<DashboardOverview>('/api/dashboard/overview')
      ]);
      setItineraries(itineraryRes.data);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load your dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchPlaces = async () => {
    try {
      const { data } = await api.get<Place[]>('/api/places/search', {
        params: { q: query, destination: destinationFilter }
      });
      setPlaces(data);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    }
  };

  const share = async (id: string) => {
    try {
      const { data } = await api.post(`/api/share/${id}`);
      setItineraries((prev) => prev.map((it) => (it.id === id ? { ...it, sharedId: data.shareId } : it)));
      alert(`Shareable link: ${data.url}`);
    } catch (err) {
      console.error(err);
      alert('Unable to generate share link.');
    }
  };

  const handlePreferencesSaved = async () => {
    await refreshProfile();
    loadDashboard();
  };

  useEffect(() => {
    loadDashboard();
    // reload profile to get stored preferences
    refreshProfile();
  }, []);

  return (
    <div className="dashboard-shell">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">AI-Powered Travel</p>
          <h1>{overview?.welcome?.headline ?? 'Plan Your Perfect Trip with AI'}</h1>
          <p className="hero-subtitle">
            {overview?.welcome?.subhead ??
              'Create personalized itineraries in minutes. Let our intelligent travel assistant handle the details while you focus on the adventure.'}
          </p>
          {overview?.welcome?.tip && <p className="hero-tip">{overview.welcome.tip}</p>}
          <div className="hero-actions">
            <a className="btn" href="/plan">
              Create New Itinerary
            </a>
            <a className="btn ghost" href="#destinations">
              Explore Destinations
            </a>
          </div>
        </div>

        {overview?.recommendedTrips?.[0] && <RecommendedHighlight trip={overview.recommendedTrips[0]} />}
      </section>

      {error && <div className="alert">{error}</div>}

      <div className="stats-grid">
        {(overview?.stats ?? new Array(4).fill(null)).map((stat, index) => (
          <div key={stat?.label ?? index} className="stat-card">
            <p className="stat-value">{stat ? stat.value.toLocaleString() : '—'}</p>
            <p className="stat-label">{stat?.label ?? 'Loading'}</p>
            {stat?.helper && <p className="stat-helper">{stat.helper}</p>}
          </div>
        ))}
      </div>

      <div className="grid two" style={{ gap: '1.5rem' }}>
        <div className="card">
          <p className="eyebrow">Your travel style</p>
          <h3 className="section-title">{overview?.welcome?.headline ?? 'Personalized dashboard'}</h3>
          <p style={{ color: '#475569', marginTop: 4 }}>
            {overview?.welcome?.tip ?? 'Set your preferences to tailor AI recommendations.'}
          </p>
          <div className="pill-row" style={{ marginTop: '0.75rem' }}>
            <span className="pill">Pace: {user?.preferences?.travelPace ?? 'add pace'}</span>
            <span className="pill">Budget: {user?.preferences?.budget ?? 'set budget'}</span>
            <span className="pill">Diet: {(user?.preferences?.dietaryRestrictions ?? []).join(', ') || 'no restrictions'}</span>
          </div>
          <div className="pill-row" style={{ marginTop: '0.5rem' }}>
            {(user?.preferences?.interests ?? ['culture', 'food', 'outdoors']).map((interest) => (
              <span key={interest} className="pill subtle">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Recent activity</p>
          <ActivityList activities={overview?.recentActivity ?? []} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid two" style={{ gap: '1.5rem' }}>
        <div className="card" id="itineraries">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="eyebrow">Your trips</p>
              <h3 className="section-title">Itinerary workspace</h3>
              <p style={{ color: '#475569', marginTop: 4 }}>Draft, confirm, share, and export in one place.</p>
            </div>
            <a className="btn light" href="/plan">
              Plan new trip
            </a>
          </div>
          <div className="grid" style={{ marginTop: '1rem' }}>
            {isLoading && <p style={{ color: '#475569' }}>Loading your saved trips…</p>}
            {!isLoading && itineraries.length === 0 && (
              <p style={{ color: '#475569' }}>No itineraries yet. Try generating one from the planner.</p>
            )}
            {itineraries.map((itinerary) => (
              <div key={itinerary.id}>
                <ItineraryCard itinerary={itinerary} />
                <div className="card-actions">
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

        <div className="card accent">
          <p className="eyebrow">Recommended trip</p>
          {overview?.recommendedTrips?.[1] ? (
            <RecommendedHighlight trip={overview.recommendedTrips[1]} dense />
          ) : (
            <p style={{ color: '#475569' }}>
              {isLoading ? 'Generating AI picks…' : 'We will suggest a route once you start planning.'}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">AI picks for you</p>
            <h3 className="section-title">Curated highlights</h3>
            <p style={{ color: '#475569', marginTop: 4 }}>More suggestions tuned to your preferences.</p>
          </div>
        </div>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          {(overview?.recommendedTrips ?? []).map((trip) => (
            <MiniRecommendation key={trip.id} trip={trip} />
          ))}
          {!isLoading && (overview?.recommendedTrips?.length ?? 0) === 0 && (
            <p style={{ color: '#475569' }}>Add interests and destinations to unlock curated routes.</p>
          )}
          {isLoading && <p style={{ color: '#475569' }}>Generating AI picks…</p>}
        </div>
      </div>

      <PreferenceForm initial={user?.preferences as TravelPreferences | undefined} onSaved={handlePreferencesSaved} />

      <div id="destinations" className="card">
        <h3 className="section-title">Destination & place search</h3>
        <p style={{ color: '#475569', marginTop: 4 }}>Preview top sights before you add them to an itinerary.</p>
        <div className="grid two" style={{ marginTop: '1rem' }}>
          <div>
            <label>Query</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="museum" />
          </div>
          <div>
            <label>Destination</label>
            <input value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)} placeholder="Barcelona" />
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

function RecommendedHighlight({ trip, dense = false }: { trip: RecommendedTrip; dense?: boolean }) {
  const descriptionColor = dense ? '#e2e8f0' : '#1e293b';

  return (
    <div className={dense ? 'recommended-card compact' : 'recommended-card'}>
      <p className="section-title" style={{ marginBottom: 6 }}>
        {trip.title}
      </p>
      <p style={{ color: '#475569', marginTop: 0 }}>{trip.destination} • {trip.days} days</p>
      <p style={{ color: descriptionColor, marginTop: 8 }}>{trip.description}</p>
      <div className="tag-list" style={{ marginTop: '0.5rem' }}>
        {trip.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
      <div className="confidence-row">
        <span className="confidence-label">AI planning confidence</span>
        <strong>{Math.round(trip.aiConfidence * 100)}%</strong>
      </div>
    </div>
  );
}

function ActivityList({ activities, isLoading }: { activities: DashboardActivity[]; isLoading: boolean }) {
  if (isLoading && activities.length === 0) {
    return <p style={{ color: '#475569' }}>Loading your latest updates…</p>;
  }

  if (!activities.length) {
    return <p style={{ color: '#475569' }}>Plan a trip to see your recent activity.</p>;
  }

  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <div>
            <p className="section-title" style={{ marginBottom: 4 }}>
              {activity.title}
            </p>
            <p style={{ color: '#475569', margin: 0 }}>{activity.subtitle}</p>
            <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>
              {new Date(activity.timestamp).toLocaleDateString()}
            </p>
          </div>
          <span className={`pill ${activity.status === 'confirmed' ? 'success' : 'muted'}`}>
            {activity.status === 'confirmed' ? 'Confirmed' : 'Draft'}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniRecommendation({ trip }: { trip: RecommendedTrip }) {
  return (
    <div className="mini-recommendation">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="section-title" style={{ marginBottom: 2 }}>
            {trip.title}
          </p>
          <p style={{ color: '#475569', margin: 0 }}>
            {trip.destination} • {trip.days} days
          </p>
        </div>
        <span className="pill muted">{Math.round(trip.aiConfidence * 100)}% fit</span>
      </div>
      <p style={{ color: '#475569', marginTop: 8 }}>{trip.description}</p>
      <div className="tag-list" style={{ marginTop: '0.5rem' }}>
        {trip.tags.map((tag) => (
          <span key={tag} className="badge">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
