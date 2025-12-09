import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { Itinerary } from '../types';

export function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      const { data } = await api.get<Itinerary>(`/api/itineraries/${id}`);
      setItinerary(data);
    };
    fetchItinerary();
  }, [id]);

  if (!itinerary) return <p>Loading itinerary...</p>;

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div className="card" style={{ background: '#eef2ff' }}>
        <h2 className="section-title">{itinerary.destination}</h2>
        <p style={{ color: '#475569' }}>
          {new Date(itinerary.startDate).toLocaleDateString()} – {new Date(itinerary.endDate).toLocaleDateString()}
        </p>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn light"
            onClick={async () => {
              const { data } = await api.post(`/api/share/${itinerary.id}`);
              setItinerary({ ...itinerary, sharedId: data.shareId });
              alert(`Share link: ${data.url}`);
            }}
          >
            {itinerary.sharedId ? 'Regenerate share link' : 'Share itinerary'}
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

      {itinerary.activities.map((day) => (
        <div key={day.day} className="card">
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
      ))}
    </div>
  );
}
