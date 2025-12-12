import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <header className="navbar">
        <Link to="/">
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0ea5e9' }}>TripPlanner AI</div>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/plan">Create Itinerary</Link>
              <a href="/dashboard#destinations">Travel Info</a>
              <a href="/dashboard#itineraries">Share & Export</a>
              <Link to="/dashboard">Profile</Link>
              <button className="btn light" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Create account</Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
