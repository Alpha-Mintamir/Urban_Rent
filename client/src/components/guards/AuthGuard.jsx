import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import { toast } from 'react-toastify';

const AuthGuard = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    toast.info('Please login first!');
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return children;
};

export default AuthGuard;
