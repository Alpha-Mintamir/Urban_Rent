import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks';

import { Header } from './Header';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect property owners to their dashboard when they navigate to the root URL
  useEffect(() => {
    if (user && location.pathname === '/') {
      const userRole = parseInt(user.role);
      console.log("Layout - User Role:", userRole, typeof userRole);
      console.log("Layout - Current Path:", location.pathname);
      
      if (userRole === 2) {
        console.log("Layout - Redirecting property owner to dashboard");
        navigate('/owner/dashboard');
      } else if (userRole === 3) {
        console.log("Layout - Redirecting broker to dashboard");
        navigate('/broker/dashboard');
      } else if (userRole === 4) {
        console.log("Layout - Redirecting admin to dashboard");
        navigate('/admin/dashboard');
      }
    }
  }, [user, location.pathname, navigate]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto flex flex-grow w-full max-w-screen-xl flex-col pt-20">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
