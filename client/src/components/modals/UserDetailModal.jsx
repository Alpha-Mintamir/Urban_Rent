import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaUserShield, FaHome, FaBriefcase, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { useLanguage } from '../../providers/LanguageProvider';
import axiosInstance from '../../utils/axios';

const UserRoleLabels = {
  1: { name: 'Tenant', icon: <FaUser className="text-blue-500" /> },
  2: { name: 'Property Owner', icon: <FaHome className="text-green-500" /> },
  3: { name: 'Broker', icon: <FaBriefcase className="text-purple-500" /> },
  4: { name: 'Admin', icon: <FaUserShield className="text-red-500" /> }
};

const UserDetailModal = ({ userId, onClose }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/admin/users/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(t('errorFetchingUser', 'Failed to load user details'));
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, t]);

  const formatDate = (dateString) => {
    if (!dateString) return t('notAvailable', 'Not available');
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return t('notAvailable', 'Not available');
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center bg-gray-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">
            {t('userDetails', 'User Details')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : user ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                  {user.profilePicture ? (
                    <img className="h-24 w-24 rounded-full object-cover" src={user.profilePicture} alt={user.name} />
                  ) : (
                    <FaUser className="text-gray-500 text-4xl" />
                  )}
                </div>
              </div>
              
              <div className="text-center mt-2">
                <h4 className="text-xl font-semibold">{user.name}</h4>
                <div className="flex items-center justify-center mt-1">
                  {UserRoleLabels[user.role]?.icon}
                  <span className="ml-2">{UserRoleLabels[user.role]?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-500 mr-3" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center">
                    <FaPhone className="text-gray-500 mr-3" />
                    <span className="text-gray-700">{user.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-500 mr-3" />
                  <span className="text-gray-700">
                    {t('joinedOn', 'Joined on')} {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              
              {user.bio && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-1">{t('bio', 'Bio')}</h5>
                  <p className="text-gray-600">{user.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {t('userNotFound', 'User not found')}
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal; 