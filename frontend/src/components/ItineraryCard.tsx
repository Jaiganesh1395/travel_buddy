import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Itinerary } from '../types';

export function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p className="section-title">{itinerary.destination}</p>
          <p style={{ color: '#475569', marginTop: 4 }}>
            {format(parseISO(itinerary.startDate), 'MMM d, yyyy')} -{' '}
            {format(parseISO(itinerary.endDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="badge">{itinerary.status}</div>
      </div>
      <div style={{ marginTop: '0.75rem', color: '#475569' }}>
        {itinerary.activities.length} day plan • {itinerary.activities.reduce((acc, day) => acc + day.items.length, 0)}
        {' '}activities
      </div>
      {itinerary.sharedId && (
        <div style={{ marginTop: '0.5rem', color: '#334155', fontWeight: 600 }}>
          Share link: /share/{itinerary.sharedId}
        </div>
      )}
      <Link to={`/itineraries/${itinerary.id}`} style={{ marginTop: '0.75rem', display: 'inline-block' }}>
        <button className="btn light">Open itinerary</button>
      </Link>
    </div>
  );
}
