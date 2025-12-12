import { TripPlannerForm } from '../components/TripPlannerForm';

export function Planner() {
  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div className="card" style={{ background: '#eef2ff' }}>
        <h2 className="section-title">AI-powered planner</h2>
        <p style={{ color: '#475569' }}>
          Enter a destination and trip length to generate a personalized 3-5 day itinerary. Save and edit the plan from your
          dashboard.
        </p>
      </div>
      <TripPlannerForm />
    </div>
  );
}
