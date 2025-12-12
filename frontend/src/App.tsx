import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { useAuth } from './context/AuthContext';
import { Planner } from './pages/Planner';
import { ItineraryDetail } from './pages/ItineraryDetail';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="hero">
              <h1>Plan smarter trips with TripPlanner AI</h1>
              <p style={{ maxWidth: 520 }}>
                Create personalized itineraries, edit them freely, and share with friends. This MVP pairs a simple web UI
                with the Express backend in this repo.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <a className="btn" href="/signup">
                  Get started
                </a>
                <a className="btn light" href="/login">
                  I already have an account
                </a>
              </div>
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/plan"
          element={
            <Protected>
              <Planner />
            </Protected>
          }
        />
        <Route
          path="/itineraries/:id"
          element={
            <Protected>
              <ItineraryDetail />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Layout>
  );
}
