import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaEye, FaEyeSlash, FaHome, FaUserPlus, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

import { useAuth } from '../../hooks';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('1'); // Default to tenant (1)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const auth = useAuth();
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Debug log
    console.log('Form data being submitted:', { 
      name, 
      email, 
      password: password ? '********' : undefined,
      phone,
      role,
      passwordValid,
      passwordCriteria,
      passwordsMatch: password === confirmPassword
    });

    if (!passwordValid) {
      toast.error('Password does not meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const response = await auth.register({ name, email, password, phone, role: parseInt(role) });
    if (response.success) {
      toast.success(response.message);
      setRedirect(true);
    } else {
      toast.error(response.message);
    }
  };

  const handleGoogleLogin = async (credential) => {
    const response = await auth.googleLogin(credential);
    if (response.success) {
      toast.success(response.message);
      setRedirect(true);
    } else {
      toast.error(response.message);
    }
  };

  const validatePassword = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordCriteria(criteria);
    setPasswordValid(Object.values(criteria).every(Boolean));
  };

  if (redirect) {
    return <Navigate to="/" />;
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

      <div className="flex flex-col items-center justify-center px-4 py-8">
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
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <FaUserPlus className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-teal-400 mb-1">Create Account</h1>
                <p className="text-white/70 dark:text-gray-400 text-center">Join UrbanRent and find your next urban home</p>
              </div>
        <form className="mt-6 space-y-5" onSubmit={handleRegister} autoComplete="off">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-white/90 dark:text-gray-200 font-medium">Full Name</Label>
            <div className="relative group">
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>
          </div>
          
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
            <Label htmlFor="phone" className="text-white/90 dark:text-gray-200 font-medium">Phone Number</Label>
            <div className="relative group">
              <Input
                id="phone"
                type="tel"
                placeholder="0912-345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-white/90 dark:text-gray-200 font-medium">Register As</Label>
            <div className="relative group">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm appearance-none"
                required
              >
                <option value="1">Tenant</option>
                <option value="2">Property Owner</option>
                <option value="3">Broker</option>
              </select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
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
          
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-white/90 dark:text-gray-200 font-medium">Confirm Password</Label>
            <div className="relative group">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/20 dark:bg-gray-900/50 border-white/20 dark:border-gray-700 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 rounded-xl py-5 px-4 focus:ring-2 focus:ring-purple-500 dark:focus:ring-indigo-500 w-full transition-all duration-300 backdrop-blur-sm pr-10"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/70 hover:text-white transition-colors z-10"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity -z-10"></div>
            </div>
          </div>
          
          <div className="mt-4 text-sm">
            <p className="mb-2 font-medium text-white/90 dark:text-gray-200">Password must meet the following criteria:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              <li className={`flex items-center ${passwordCriteria.length ? 'text-purple-200 dark:text-indigo-400' : 'text-red-300 dark:text-red-400'}`}>
                <div className={`mr-2 h-4 w-4 rounded-full flex items-center justify-center ${passwordCriteria.length ? 'bg-purple-500 dark:bg-indigo-500' : 'bg-red-500'}`}>
                  {passwordCriteria.length ? '✓' : '✗'}
                </div>
                At least 8 characters
              </li>
              <li className={`flex items-center ${passwordCriteria.uppercase ? 'text-purple-200 dark:text-indigo-400' : 'text-red-300 dark:text-red-400'}`}>
                <div className={`mr-2 h-4 w-4 rounded-full flex items-center justify-center ${passwordCriteria.uppercase ? 'bg-purple-500 dark:bg-indigo-500' : 'bg-red-500'}`}>
                  {passwordCriteria.uppercase ? '✓' : '✗'}
                </div>
                One uppercase letter
              </li>
              <li className={`flex items-center ${passwordCriteria.lowercase ? 'text-purple-200 dark:text-indigo-400' : 'text-red-300 dark:text-red-400'}`}>
                <div className={`mr-2 h-4 w-4 rounded-full flex items-center justify-center ${passwordCriteria.lowercase ? 'bg-purple-500 dark:bg-indigo-500' : 'bg-red-500'}`}>
                  {passwordCriteria.lowercase ? '✓' : '✗'}
                </div>
                One lowercase letter
              </li>
              <li className={`flex items-center ${passwordCriteria.number ? 'text-purple-200 dark:text-indigo-400' : 'text-red-300 dark:text-red-400'}`}>
                <div className={`mr-2 h-4 w-4 rounded-full flex items-center justify-center ${passwordCriteria.number ? 'bg-purple-500 dark:bg-indigo-500' : 'bg-red-500'}`}>
                  {passwordCriteria.number ? '✓' : '✗'}
                </div>
                One number
              </li>
              <li className={`flex items-center ${passwordCriteria.specialChar ? 'text-purple-200 dark:text-indigo-400' : 'text-red-300 dark:text-red-400'}`}>
                <div className={`mr-2 h-4 w-4 rounded-full flex items-center justify-center ${passwordCriteria.specialChar ? 'bg-purple-500 dark:bg-indigo-500' : 'bg-red-500'}`}>
                  {passwordCriteria.specialChar ? '✓' : '✗'}
                </div>
                One special character
              </li>
            </ul>
          </div>
          
          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-5 rounded-xl shadow-lg shadow-purple-700/30 dark:shadow-indigo-900/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
            disabled={!passwordValid || password !== confirmPassword}
          >
            <FaUserPlus className="mr-2 h-4 w-4 inline-block" />
            Create Account
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
          Already a member?{' '}
          <Link className="text-purple-300 dark:text-indigo-400 hover:text-white dark:hover:text-indigo-300 font-medium transition-colors" to={'/login'}>
            Login
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
</div>
    </div>
  );
};

export default RegisterPage;
