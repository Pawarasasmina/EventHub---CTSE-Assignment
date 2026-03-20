import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="state-message">Checking permissions...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role) ? <Outlet /> : <Navigate to="/" replace />;
};

export default RoleRoute;
