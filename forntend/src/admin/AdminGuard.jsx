import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function AdminGuard({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0F13' }}>
      <Loader />
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}



