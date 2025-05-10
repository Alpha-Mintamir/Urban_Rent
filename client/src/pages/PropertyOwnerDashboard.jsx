import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import DashboardCard from '@/components/ui/DashboardCard';
import { PlusCircle, User, Settings, Home as HomeIcon, Star as StarIcon, Mail as MailIcon } from 'lucide-react';

const PropertyOwnerDashboard = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalReviews: 0,
    unreadMessages: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const { data: userData } = await axiosInstance.get('/users/profile');
        setUserInfo(userData);
        
        // Fetch user's properties count
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
        
        // Placeholder for unread messages count - assuming you have an endpoint for this
        let unreadMessages = 0; 
        try {
          const messagesResponse = await axiosInstance.get('/messages/unread-count');
          // Ensure a successful response and data exists before trying to access unreadCount
          if (messagesResponse.data && messagesResponse.data.success && messagesResponse.data.data) {
            unreadMessages = messagesResponse.data.data.unreadCount || 0;
          }
        } catch (messagesError) {
          console.error('Error fetching unread messages count:', messagesError);
        }

        setStats({
          totalProperties: propertiesCount,
          totalReviews: reviewsCount,
          unreadMessages: unreadMessages // Ensure this uses the fetched value
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default/error state for stats if main user profile fetch fails
        setStats({
            totalProperties: 0,
            totalReviews: 0,
            unreadMessages: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Using the imported DashboardCard component

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('propertyOwnerDashboard')}</h1>
          <p className="text-gray-600">{t('welcomeToDashboard')}, {userInfo?.name || (language === 'am' ? 'ንብረት ባለቤት' : 'Property Owner')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <DashboardCard 
            title={t('myProperties')}
            value={stats.totalProperties.toString()}
            description={t('totalProperties')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            color="bg-[#D746B7]"
            onClick={() => navigate('/account/places')}
          />
          
          <DashboardCard 
            title={t('reviews')}
            value={stats.totalReviews.toString()}
            description={t('totalReviews')}
            icon={<StarIcon className="h-8 w-8 text-white" />}
            color="bg-[#D746B7]"
            onClick={() => navigate('/account/reviews')}
          />
          
          <DashboardCard 
            title={t('addProperty', 'Add Property')}
            value="+"
            description={t('addNewPropertyDescription', 'List a new property')}
            icon={<PlusCircle className="h-8 w-8 text-white" />}
            color="bg-green-500 hover:bg-green-600"
            onClick={() => navigate('/account/property/new')}
          />
          
          <DashboardCard 
            title={t('messages')}
            value={stats.unreadMessages.toString()}
            description={t('unreadMessages')}
            icon={<MailIcon className="h-8 w-8 text-white" />}
            color="bg-[#D746B7]"
            onClick={() => navigate('/account/messages')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('quickLinks')}</h2>
            <ul className="space-y-4">
              <li>
                <Link to="/account" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-[#D746B7] hover:text-[#b03795]">
                  <User className="h-6 w-6 mr-3 text-[#D746B7]" />
                  <span className="font-medium">{t('myProfile')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account/settings" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-[#D746B7] hover:text-[#b03795]">
                  <Settings className="h-6 w-6 mr-3 text-[#D746B7]" />
                  <span className="font-medium">{t('settings')}</span>
                </Link>
              </li>
              <li>
                <Link to="/account/places" className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150 ease-in-out text-[#D746B7] hover:text-[#b03795]">
                  <HomeIcon className="h-6 w-6 mr-3 text-[#D746B7]" />
                  <span className="font-medium">{t('myProperties')}</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t('usefulTips')}</h2>
            <ul className="space-y-3 text-gray-600">
              {[
                t('qualityPhotosTip', 'Upload high-quality photos of your property.'),
                t('accurateDescriptionTip', 'Write detailed and accurate descriptions.'),
                t('quickResponseTip', 'Respond quickly to inquiries and booking requests.'),
                t('competitivePriceTip', 'Set a competitive price for your listing.')
              ].map((tip, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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

export default PropertyOwnerDashboard;
