import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import BrokerBadge from '@/components/ui/BrokerBadge';
import DashboardCard from '@/components/ui/DashboardCard';
import { PlusCircle, User, Settings, Home as HomeIcon, Star as StarIcon, Mail as MailIcon, Calendar, Shield, CheckCircle } from 'lucide-react';

const BrokerDashboard = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'rejected'
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalReviews: 0,
    unreadMessages: 0,
    totalBookings: 0
  });
  
  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        // Fetch user data
        const { data } = await axiosInstance.get('/users/profile');
        setUserInfo(data);
        
        // Fetch broker properties
        let propertiesCount = 0;
        try {
          const timestamp = new Date().getTime();
          const propertiesResponse = await axiosInstance.get(`/places/user-places?_t=${timestamp}`);
          
          if (Array.isArray(propertiesResponse.data)) {
            propertiesCount = propertiesResponse.data.length;
          }
        } catch (propertyError) {
          console.error('Error fetching properties for count:', propertyError);
        }

        // Fetch total reviews count
        let reviewsCount = 0;
        try {
          const reviewsCountResponse = await axiosInstance.get('/reviews/owner/reviews/count');
          reviewsCount = reviewsCountResponse.data.totalReviews || 0;
        } catch (reviewsError) {
          console.error('Error fetching total reviews count:', reviewsError);
        }
        
        // Fetch broker verification status
        try {
          const verificationRes = await axiosInstance.get('/broker/verification/status');
          if (verificationRes.data && verificationRes.data.status) {
            setVerificationStatus(verificationRes.data.status);
          }
        } catch (verificationError) {
          console.error('Error fetching broker verification status:', verificationError);
          // Keep default or set to a specific error state if needed
        }

        // Fetch unread messages count
        let unreadMessagesCount = 0;
        try {
          const messagesCountRes = await axiosInstance.get('/messages/unread-count');
          if (messagesCountRes.data.success && messagesCountRes.data.data) {
            unreadMessagesCount = messagesCountRes.data.data.unreadCount || 0;
          }
        } catch (messagesError) {
          console.error('Error fetching unread messages count:', messagesError);
        }
        
        // Set the statistics
        setStats({
          totalProperties: propertiesCount,
          totalReviews: reviewsCount,
          unreadMessages: unreadMessagesCount, // Updated to use fetched count
          totalBookings: 0 // Update this when you have the actual API
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching broker data:', error);
        setLoading(false);
      }
    };
    
    fetchBrokerData();
  }, []);

  // Function to get verification status display elements
  const getVerificationDisplay = () => {
    switch(verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-8 w-8 text-white" />,
          color: "bg-green-500",
          label: t('verified', 'Verified'),
        };
      case 'rejected':
        return {
          icon: <Shield className="h-8 w-8 text-white" />,
          color: "bg-red-500",
          label: t('rejected', 'Rejected'),
        };
      case 'pending':
      default:
        return {
          icon: <Shield className="h-8 w-8 text-white" />,
          color: "bg-yellow-500",
          label: t('pending', 'Pending'),
        };
    }
  };

  const verificationDisplay = getVerificationDisplay();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold text-blue-600">{t('brokerDashboard')}</h1>
            <BrokerBadge size="lg" />
          </div>
          <p className="text-gray-600">{t('welcomeToDashboard')}, {userInfo?.name || t('broker')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DashboardCard 
            title={t('myProperties')}
            value={stats.totalProperties.toString()}
            description={t('totalProperties')}
            icon={<HomeIcon className="h-8 w-8 text-white" />}
            color="bg-blue-600"
            onClick={() => navigate('/account/places')}
          />
          
          <DashboardCard 
            title={t('reviews')}
            value={stats.totalReviews.toString()}
            description={t('totalReviews')}
            icon={<StarIcon className="h-8 w-8 text-white" />}
            color="bg-blue-600"
            onClick={() => navigate('/broker/reviews')}
          />
          
          <DashboardCard 
            title={t('verification', 'Verification')}
            value={verificationDisplay.label}
            description={t('brokerVerificationStatus', 'Broker verification status')}
            icon={verificationDisplay.icon}
            color={verificationDisplay.color}
            onClick={() => navigate('/broker/verification')}
          />
          
          <DashboardCard 
            title={t('addProperty', 'Add Property')}
            value="+"
            description={t('addNewPropertyDescription', 'List a new property')}
            icon={<PlusCircle className="h-8 w-8 text-white" />}
            color="bg-green-500 hover:bg-green-600"
            onClick={() => navigate('/broker/property/new')}
          />
          
          <DashboardCard 
            title={t('messages')}
            value={stats.unreadMessages.toString()}
            description={t('unreadMessages')}
            icon={<MailIcon className="h-8 w-8 text-white" />}
            color="bg-blue-600"
            onClick={() => navigate('/broker/messages')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">{t('quickLinks')}</h2>
            <ul className="space-y-4">
              <li>
                <Link to="/account" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-blue-600 hover:text-blue-800">
                  <User className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="font-medium">{t('myProfile')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account/settings" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-blue-600 hover:text-blue-800">
                  <Settings className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="font-medium">{t('settings')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account/places" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-blue-600 hover:text-blue-800">
                  <HomeIcon className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="font-medium">{t('myProperties')}</span>
                </Link>
              </li>
              <li>
                <Link to="/broker/verification" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-blue-600 hover:text-blue-800">
                  <Shield className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="font-medium">{t('verification', 'Verification')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">{t('usefulTips')}</h2>
            <ul className="space-y-3 text-gray-600">
              {[
                t('qualityPhotosTip', 'Upload high-quality photos of your property.'),
                t('accurateDescriptionTip', 'Write detailed and accurate descriptions.'),
                t('quickResponseTip', 'Respond quickly to inquiries and booking requests.'),
                t('competitivePriceTip', 'Set a competitive price for your listing.')
              ].map((tip, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
