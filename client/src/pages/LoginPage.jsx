import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import ProfilePage from './ProfilePage';
import { useAuth } from '../../hooks';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8 mt-20 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-10 backdrop-blur-md border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300 mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Sign in to continue to UrbanRent</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
            />
          </div>
          
          <div className="relative flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 pr-10"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          
          <div className="flex items-center justify-end">
            <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-semibold py-3 rounded-lg shadow transition-colors duration-200"
          >
            Sign in
          </Button>
        </form>
        
        <div className="mb-4 flex w-full items-center gap-4">
          <div className="h-0 w-1/2 border-t border-gray-200 dark:border-gray-700"></div>
          <p className="text-gray-400">or</p>
          <div className="h-0 w-1/2 border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
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
            theme="filled_blue"
            shape="pill"
          />
        </div>
        
        <div className="py-2 text-center text-gray-500 dark:text-gray-400">
          Don't have an account yet?{' '}
          <Link className="text-indigo-700 dark:text-indigo-300 underline hover:text-indigo-500" to={'/register'}>
            Register now
          </Link>
        </div>
      </div>
      
      {/* Optional: Light/Dark mode toggle for modern look */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => {
            document.documentElement.classList.toggle('dark');
          }}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-700 dark:text-indigo-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
