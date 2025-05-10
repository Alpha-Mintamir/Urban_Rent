import React, { useState } from 'react';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/hooks';

const AuthTest = () => {
  const { user } = useAuth();
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      // Set authorization header manually
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axiosInstance.get('/reviews/auth-test', config);
      setAuthStatus(response.data);
      console.log('Auth test response:', response.data);
    } catch (err) {
      console.error('Auth test error:', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 bg-black bg-opacity-75 text-white p-4 m-4 rounded-lg z-50 text-xs max-w-xs overflow-auto max-h-80">
      <h3 className="font-bold mb-2">Authentication Test</h3>
      
      <div className="mb-4">
        <p>Current User:</p>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <button 
        onClick={checkAuth}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>
      
      {authStatus && (
        <div className="mb-4">
          <p className="font-bold text-green-400">Authentication Successful:</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <p className="font-bold text-red-400">Authentication Error:</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 pt-2 border-t border-gray-500">
        <p className="font-bold">Manual Token Test:</p>
        <button 
          onClick={() => {
            const token = localStorage.getItem('token');
            console.log('Token:', token);
            
            if (token) {
              try {
                // Decode the token (JWT) to see its contents
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                console.log('Decoded token:', JSON.parse(jsonPayload));
              } catch (err) {
                console.error('Error decoding token:', err);
              }
            }
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Check Token in Console
        </button>
      </div>
    </div>
  );
};

export default AuthTest;
