import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import ProfilePage from './ProfilePage';
import { useAuth } from '../../hooks';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await auth.login({ email, password });
    if (response.success) {
      toast.success(response.message);
      handleLoginSuccess();
    } else {
      toast.error(response.message);
    }
  };

  const handleGoogleLogin = async (credential) => {
    const response = await auth.googleLogin(credential);
    if (response.success) {
      toast.success(response.message);
      handleLoginSuccess();
    } else {
      toast.error(response.message);
    }
  };

  const handleLoginSuccess = () => {
    const userRole = parseInt(auth.user?.role);
    console.log("User role:", userRole);
    
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    
    if (userRole === 1) { // Tenant
      navigate('/browse');
    } else if (userRole === 2) { // Property Owner
      navigate('/owner/dashboard');
    } else if (userRole === 3) { // Broker
      navigate('/broker/dashboard');
    } else if (userRole === 4) { // Admin
      navigate('/admin/dashboard');
    } else {
      // Default (e.g. if role is somehow undefined after login, though unlikely)
      navigate('/'); 
    }
  };

  useEffect(() => {
    if (auth.user) {
      const userRole = parseInt(auth.user.role);
      if (userRole === 1) { // Tenant
        navigate('/browse');
      } else if (userRole === 2) {
        navigate('/owner/dashboard');
      } else if (userRole === 3) {
        navigate('/broker/dashboard');
      } else if (userRole === 4) {
        navigate('/admin/dashboard');
      } // No default else, if role is not 1,2,3,4 and user is on login, they stay (or rely on handleLoginSuccess if it was a fresh login action)
    }
  }, [auth.user, navigate]);

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  // Don't render ProfilePage, let the useEffect handle redirection
  if (auth.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4 flex grow items-center justify-around p-4 md:p-0">
      <div className="mb-40">
        <h1 className="mb-4 text-center text-4xl">Login</h1>
        <form onSubmit={handleLogin} className="mx-auto max-w-md">
          <div className="flex flex-col">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Role selection removed - roles are now determined automatically */}
          <Button type="submit" className="primary my-4">
            Login
          </Button>
        </form>

        <div className="mb-4 flex w-full items-center gap-4">
          <div className="h-0 w-1/2 border-[1px]"></div>
          <p className="small -mt-1">or</p>
          <div className="h-0 w-1/2 border-[1px]"></div>
        </div>

        {/* Google login button */}
        <div className="flex h-[50px] justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              handleGoogleLogin(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Login Failed');
            }}
            text="continue_with"
            width="350"
          />
        </div>

        <div className="py-2 text-center text-gray-500">
          Don't have an account yet?{' '}
          <Link className="text-black underline" to={'/register'}>
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
