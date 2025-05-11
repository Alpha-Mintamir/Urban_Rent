import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaEye, FaEyeSlash, FaHome, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-purple-900 via-indigo-800 to-teal-700 dark:from-gray-900 dark:via-purple-950 dark:to-indigo-950 transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-56 -right-24 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-16 left-64 w-80 h-80 bg-teal-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Navbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
            <FaHome className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">UrbanRent</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark');
            }}
            className="p-2.5 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white shadow-lg transition-all duration-300 border border-white/20"
            aria-label="Toggle dark mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.95l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800/50">
            {/* Decorative top accent */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600"></div>
            
            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center mb-8">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <FaSignInAlt className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-teal-400 mb-1">Welcome Back</h1>
                <p className="text-white/70 dark:text-gray-400 text-center">Sign in to continue your urban adventure</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/90 dark:text-gray-200 font-medium">Email</Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-white/90 dark:text-gray-200 font-medium">Password</Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm pr-10"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/70 hover:text-white transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-purple-300 dark:text-indigo-400 hover:text-white dark:hover:text-indigo-300 transition-colors font-medium">
                    Forgot password?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-5 rounded-xl shadow-lg shadow-purple-700/30 dark:shadow-indigo-900/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                >
                  <FaSignInAlt className="mr-2 h-4 w-4" />
                  Sign in
                </Button>
              </form>
              
              <div className="my-6 flex w-full items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-600 to-transparent"></div>
                <p className="text-white/60 dark:text-gray-400 text-sm font-medium">or continue with</p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 dark:via-gray-600 to-transparent"></div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="transform transition-transform hover:scale-105 active:scale-95">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      handleGoogleLogin(credentialResponse.credential);
                    }}
                    onError={() => {
                      console.log('Login Failed');
                    }}
                    text="continue_with"
                    width="300"
                    theme="filled_blue"
                    shape="pill"
                  />
                </div>
              </div>
              
              <div className="text-center text-white/60 dark:text-gray-400">
                Don't have an account yet?{' '}
                <Link className="text-purple-300 dark:text-indigo-400 hover:text-white dark:hover:text-indigo-300 font-medium transition-colors" to={'/register'}>
                  Register now
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
