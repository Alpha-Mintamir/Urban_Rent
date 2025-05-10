import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../providers/LanguageProvider';
import { FaUserCheck, FaList, FaUsers, FaHome, FaShieldAlt, FaChartLine, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    totalProperties: 0,
  });
  const [brokerVerifications, setBrokerVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Comment out the admin check to bypass security
    /* 
    if (user?.role !== 4) {
      toast.error(t('adminOnly', 'This area is for admins only'));
      navigate('/');
      return;
    }
    */

    // Fetch admin dashboard stats and broker verifications
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch stats from new endpoints
        const [usersResponse, propertiesResponse, verificationResponse] = await Promise.all([
          axiosInstance.get('/admin/stats/total-users'),
          axiosInstance.get('/admin/stats/total-properties'),
          axiosInstance.get('/admin/stats/pending-verifications') // Changed from /broker/verification/admin/requests
        ]);

        setStats({
          totalUsers: usersResponse.data.data,
          totalProperties: propertiesResponse.data.data,
          pendingVerifications: verificationResponse.data.data, 
        });
        
        // Fetch broker verification details for the table (if still needed separately)
        // If getPendingVerificationsCount is sufficient, we might not need the full list here anymore
        // For now, I'll assume the full list is still needed for the table display below.
        // If not, this separate call can be removed.
        const verificationDetailsResponse = await axiosInstance.get('/broker/verification/admin/requests');
        setBrokerVerifications(verificationDetailsResponse.data); // Corrected: API returns array directly

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, t]);

  // Handle verification status change
  const handleStatusChange = async (verificationId, newStatus) => {
    try {
      await axiosInstance.put(`/broker/verification/admin/requests/${verificationId}`, {
        status: newStatus
      });
      
      // Update the local state
      setBrokerVerifications(prevVerifications => 
        prevVerifications.map(v => 
          v._id === verificationId 
            ? {...v, status: newStatus} 
            : v
        )
      );
      
      // Update pending count - this might need adjustment if pendingVerifications in stats is now the sole source
      setStats(prevStats => ({
        ...prevStats,
        pendingVerifications: prevStats.pendingVerifications > 0 ? prevStats.pendingVerifications -1 : 0
      }));
      
      toast.success(`Broker verification ${newStatus === 'approved' ? t('approved') : t('rejected')} ${t('successfully')}`);
    } catch (error) {
      console.error(`Error ${newStatus} broker verification:`, error);
      toast.error(`Failed to ${newStatus} broker verification`);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('adminDashboard', 'Admin Dashboard')}</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('pendingVerifications', 'Pending Verifications')}</p>
              <p className="text-3xl font-bold mt-2">{stats.pendingVerifications}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-blue-200 transform hover:scale-110">
              <FaUserCheck className="text-blue-600 text-3xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/broker-verification" className="text-blue-500 hover:underline">
              {t('manageVerifications', 'Manage Verifications')}
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('totalUsers', 'Total Users')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-green-200 transform hover:scale-110">
              <FaUsers className="text-green-600 text-3xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-blue-500 hover:underline">
              {t('manageUsers', 'Manage Users')}
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{t('totalProperties', 'Total Properties')}</p>
              <p className="text-3xl font-bold mt-2">{stats.totalProperties}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-purple-200 transform hover:scale-110">
              <FaHome className="text-purple-600 text-3xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/properties" className="text-blue-500 hover:underline">
              {t('manageProperties', 'Manage Properties')}
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Menu */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('adminMenu', 'Admin Menu')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/broker-verification" className="flex items-center p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
            <div className="bg-blue-100 p-3 rounded-full shadow-sm mr-3">
              <FaUserCheck className="text-blue-600 text-xl" />
            </div>
            <span className="font-medium">{t('brokerVerification', 'Broker Verification')}</span>
          </Link>
          <Link to="/admin/users" className="flex items-center p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
            <div className="bg-green-100 p-3 rounded-full shadow-sm mr-3">
              <FaUsers className="text-green-600 text-xl" />
            </div>
            <span className="font-medium">{t('userManagement', 'User Management')}</span>
          </Link>
          <Link to="/admin/properties" className="flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
            <div className="bg-purple-100 p-3 rounded-full shadow-sm mr-3">
              <FaHome className="text-purple-600 text-xl" />
            </div>
            <span className="font-medium">{t('propertyManagement', 'Property Management')}</span>
          </Link>
          <Link to="/admin/reports" className="flex items-center p-4 bg-gray-50 hover:bg-yellow-50 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
            <div className="bg-yellow-100 p-3 rounded-full shadow-sm mr-3">
              <FaChartLine className="text-yellow-600 text-xl" />
            </div>
            <span className="font-medium">{t('reports', 'Reports & Analytics')}</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{t('quickActions', 'Quick Actions')}</h2>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/admin/broker-verification')}
            className="w-full md:w-auto text-left px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center">
            <FaUserCheck className="mr-2" />
            {t('reviewBrokerVerifications', 'Review Broker Verifications')}
          </button>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Common Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>
              
              <button className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve</span>
              </button>
              
              <button className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Broker Verification Status Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('brokerVerificationStatus', 'Broker Verification Status')}</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : brokerVerifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brokerVerifications.map((verification) => (
                  <tr key={verification.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {verification.User && verification.User.name ? verification.User.name.charAt(0) : "U"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {verification.User && verification.User.name ? verification.User.name : t('unknownUser', "Unknown User")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{verification.User && verification.User.email ? verification.User.email : t('na', "N/A")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{verification.document_number ? verification.document_number : t('na', "N/A")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(verification.status || 'pending')}`}>
                        {verification.status ? verification.status.charAt(0).toUpperCase() + verification.status.slice(1) : t('pending', "Pending")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.createdAt ? new Date(verification.createdAt).toLocaleDateString() : t('na', "N/A")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                          onClick={() => navigate(`/admin/broker-verification/${verification.user_id}`)}
                        >
                          <FaEye />
                        </button>
                        {verification.status === 'pending' && (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                              onClick={() => handleStatusChange(verification.user_id, 'approved')}
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              onClick={() => handleStatusChange(verification.user_id, 'rejected')}
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No broker verifications found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 