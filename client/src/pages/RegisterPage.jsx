import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="w-full max-w-md space-y-8 mt-20 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl p-10 backdrop-blur-md border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300 mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base">Join UrbanRent and find your next home!</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister} autoComplete="off">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
            />
          </div>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0912-345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role" className="text-gray-700 dark:text-gray-200">Register As</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="1">Tenant</option>
              <option value="2">Property Owner</option>
              <option value="3">Broker</option>
            </select>
          </div>
          <div className="relative flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
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
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 pr-10"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="relative flex flex-col gap-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-200">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-lg border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 pr-10"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-1 font-medium">Password must meet the following criteria:</p>
            <ul className="list-inside list-disc space-y-1">
              <li className={passwordCriteria.length ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>At least 8 characters</li>
              <li className={passwordCriteria.uppercase ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>At least one uppercase letter</li>
              <li className={passwordCriteria.lowercase ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>At least one lowercase letter</li>
              <li className={passwordCriteria.number ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>At least one number</li>
              <li className={passwordCriteria.specialChar ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>At least one special character</li>
            </ul>
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-semibold py-3 rounded-lg shadow transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            disabled={!passwordValid || password !== confirmPassword}
          >
            Register
          </Button>
        </form>
        <div className="mb-4 flex w-full items-center gap-4">
          <div className="h-0 w-1/2 border-t border-gray-200 dark:border-gray-700"></div>
          <p className="small -mt-1 text-gray-400">or</p>
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
          Already a member?{' '}
          <Link className="text-indigo-700 dark:text-indigo-300 underline hover:text-indigo-500" to={'/login'}>
            Login
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

export default RegisterPage;
