import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import PlaceCard from '@/components/ui/PlaceCard';
import { useAuth } from '@/hooks';

const SavedPropertiesPage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [error, setError] = useState(null);

  const fetchSavedProperties = useCallback(async () => {
      try {
        setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/saved-properties');
      if (response.data && response.data.success) {
        const formattedProperties = response.data.data.map(prop => {
          let addressString = 'Unknown Location';
          if (prop.location) {
            const parts = [];
            if (prop.location.sub_city) parts.push(prop.location.sub_city);
            if (prop.location.woreda) parts.push(prop.location.woreda);
            if (parts.length > 0) addressString = parts.join(', ');
            else if (prop.location.address) addressString = prop.location.address;
          }

          return {
            ...prop,
            _id: prop.property_id,
            title: prop.property_name,
            address: addressString,
            photos: prop.photos?.map(photo => photo.url) || [],
          };
        });
        console.log('Formatted Saved Properties:', formattedProperties);
        if (formattedProperties.length > 0) {
          console.log('Photos for first saved property:', formattedProperties[0].photos);
        }
        setSavedProperties(formattedProperties);
      } else {
        throw new Error(response.data.message || 'Failed to fetch saved properties');
      }
    } catch (err) {
      console.error('Error fetching saved properties:', err);
      const errorMessage = err.response?.data?.message || (language === 'am' ? 'የተቀመጡ ንብረቶችን ማግኘት አልተቻለም' : 'Could not fetch saved properties');
      setError(errorMessage);
      toast.error(errorMessage);
      setSavedProperties([]);
    } finally {
        setLoading(false);
      }
  }, [language]);
    
  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  const handleRemoveProperty = async (propertyId) => {
    try {
      const response = await axiosInstance.post('/saved-properties', { propertyId });
      if (response.data && !response.data.saved) {
        toast.info(language === 'am' ? 'ንብረቱ ከተቀመጡት ተወግዷል' : 'Property removed from saved list');
        fetchSavedProperties();
      } else if (response.data && response.data.saved) {
        fetchSavedProperties();
      } else {
        throw new Error(response.data.message || 'Failed to remove property');
      }
    } catch (err) {
      console.error('Error removing property:', err);
      const errorMessage = err.response?.data?.message || (language === 'am' ? 'ንብረቱን ማስወገድ አልተቻለም' : 'Could not remove property');
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-600">{t('savedProperties') || 'Saved Properties'}</h1>
            <p className="text-gray-600">{t('propertiesSaved') || 'Properties you saved for later'}</p>
          </div>
          <Link
            to="/browse"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('browseProperties') || 'Browse More Properties'}
          </Link>
        </div>
        
        {savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedProperties.map(property => (
              <div key={property._id} className="relative">
                <PlaceCard 
                  place={{
                    ...property,
                  }} 
                  isTenantView={true} 
                />
                <button
                  onClick={() => handleRemoveProperty(property._id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  title={language === 'am' ? 'አስወግድ' : 'Remove from saved'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            {error && <p className='text-red-500 mb-4'>{error}</p>}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">{language === 'am' ? 'ምንም የተቀመጡ ንብረቶች የሉም' : 'No saved properties yet'}</h2>
            <p className="text-gray-600 mb-6">
              {language === 'am' 
                ? 'ንብረቶችን እየተመለከቱ ሲሆኑ፣ የሚወዷቸውን ለመቀመጥ የልብ አዝራሩን ይጫኑ።' 
                : 'While browsing properties, click the heart button to save properties you like.'}
            </p>
            <Link
              to="/browse"
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {language === 'am' ? 'ንብረቶችን ማሰስ ይጀምሩ' : 'Start Browsing Properties'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPropertiesPage;
