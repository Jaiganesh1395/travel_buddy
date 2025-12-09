import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <header className="navbar">
        <Link to="/">
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>TripPlanner AI</div>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/plan">Plan Trip</Link>
              <button className="btn light" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Create account</Link>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
