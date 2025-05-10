import React from 'react';
import { useAuth } from '@/hooks';

const UserRoleDebug = () => {
  const { user } = useAuth();
  
  const userInfo = user ? {
    name: user.name,
    email: user.email,
    role: user.role,
    isLoggedIn: !!user
  } : { isLoggedIn: false };
  
  // Role names based on your system
  const getRoleName = (role) => {
    switch(role) {
      case 1: return 'Tenant';
      case 2: return 'Property Owner';
      case 3: return 'Broker';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-4 m-4 rounded-lg z-50 text-xs max-w-xs overflow-auto max-h-60">
      <h3 className="font-bold mb-2">User Debug Info:</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(userInfo, null, 2)}
      </pre>
      {user && (
        <div className="mt-2 pt-2 border-t border-gray-500">
          <p>Role: <span className="font-bold">{getRoleName(user.role)}</span></p>
          <p>Is Tenant: <span className={user.role === 1 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {String(user.role === 1)}
          </span></p>
        </div>
      )}
    </div>
  );
};

export default UserRoleDebug;
