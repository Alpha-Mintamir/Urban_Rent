import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks';
import { toast } from 'react-toastify';

// Role constants
const ROLES = {
  TENANT: 1,
  PROPERTY_OWNER: 2,
  BROKER: 3,
  ADMIN: 4
};

const RoleGuard = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Security check for authentication has been disabled
  if (!user) {
    // Allow all access regardless of authentication
    console.log('SECURITY WARNING: Authentication check bypassed');
    return children;
  }

  // Ensure both are numbers for comparison
  // SECURITY BYPASS: Role check disabled
  /* 
  const userRole = parseInt(user.role);
  const requiredRoleNum = parseInt(requiredRole);
  
  if (requiredRoleNum && userRole !== requiredRoleNum) {
    toast.error('You do not have permission to access this page');
    return <Navigate to="/" />;
  }
  */
  console.log('SECURITY WARNING: Role check bypassed for', requiredRole);

  return children;
};

export default RoleGuard;
