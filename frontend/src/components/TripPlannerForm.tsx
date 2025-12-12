import { useState } from 'react';
import api from '../api/client';
import { DayPlan, RecommendationResponse } from '../types';

export function TripPlannerForm() {
  const [destination, setDestination] = useState('Lisbon');
  const [days, setDays] = useState(3);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<RecommendationResponse | null>(null);

  const generate = async () => {
    setLoading(true);
    const { data } = await api.post<RecommendationResponse>('/api/recommendations', {
      destination,
      days
    });
    setPlan(data);
    setLoading(false);
  };

  const saveItinerary = async () => {
    if (!plan) return;
    const start = new Date();
    const end = new Date(start.getTime() + (plan.days - 1) * 24 * 60 * 60 * 1000);
    await api.post('/api/itineraries', {
      destination: plan.destination,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      activities: plan.itinerary
    });
    alert('Itinerary saved to your account');
  };

  const renderDay = (day: DayPlan) => (
    <div key={day.day} className="card" style={{ marginTop: '0.75rem' }}>
      <div className="badge">Day {day.day}</div>
      <ul style={{ paddingLeft: '1rem', color: '#475569' }}>
        {day.items.map((item, idx) => (
          <li key={idx} style={{ marginTop: '0.5rem' }}>
            <strong>{item.time}</strong> — {item.title}
            {item.notes ? ` • ${item.notes}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="card">
      <h3 className="section-title">Smart itinerary generator</h3>
      <div className="grid two" style={{ marginTop: '1rem' }}>
        <div>
          <label>Destination</label>
          <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Barcelona" />
        </div>
        <div>
          <label>Trip length (days)</label>
          <input
            type="number"
            min={1}
            max={7}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
      </div>
      <button className="btn" style={{ marginTop: '1rem' }} onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate itinerary'}
      </button>

      {plan && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Suggested plan for {plan.destination}</h4>
            <button className="btn light" onClick={saveItinerary}>
              Save to itineraries
            </button>
          </div>
          {plan.itinerary.map(renderDay)}
        </div>
      )}
    </div>
  );
}
