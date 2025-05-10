import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from '@/utils/axios';

import AccountNav from '@/components/ui/AccountNav';
import InfoCard from '@/components/ui/InfoCard';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/hooks';

const PlacesPage = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // Determine if we're in broker mode based on the URL path
  const isBrokerMode = location.pathname.startsWith('/broker');

  useEffect(() => {
    fetchPlaces();
  }, []);
  
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('places/user-places');
      console.log('Fetched places data:', data);
      
      if (Array.isArray(data)) {
        setPlaces(data);
      } else {
        console.error('Unexpected data format:', data);
        setError('Unexpected data format received from server');
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePropertyUpdate = (updatedPlace, deletedId) => {
    if (deletedId) {
      // Remove deleted property
      setPlaces(prevPlaces => prevPlaces.filter(place => place.property_id !== deletedId));
    } else if (updatedPlace) {
      // Update existing property
      setPlaces(prevPlaces => 
        prevPlaces.map(place => 
          place.property_id === updatedPlace.property_id ? updatedPlace : place
        )
      );
    }
  };

  // Check broker verification before navigating to add property page
  const handleAddPropertyClick = async (e) => {
    // Only check verification for brokers (role 3)
    if (user && parseInt(user.role) === 3) {
      e.preventDefault();
      setVerifying(true);
      
      try {
        // Fetch broker verification status from API
        const response = await axiosInstance.get('/broker/verification/status');
        const { status: verificationStatus } = response.data;

        if (verificationStatus !== 'approved') {
          toast.info('Your broker account is not yet verified. Please complete your verification to add properties.');
          navigate('/broker/verification', { replace: true });
          return;
        }
        
        // If verified, navigate to the add property page
        navigate(isBrokerMode ? '/broker/property/new' : '/account/property/new');
      } catch (error) {
        console.error("Error fetching broker verification status:", error);
        // For any error (including 404), redirect to verification page
        const message = error.response?.status === 404 
          ? 'Please complete your broker verification before adding properties.' 
          : 'Verification status could not be confirmed. Please complete your verification.';
        
        toast.info(message);
        navigate('/broker/verification', { replace: true });
      } finally {
        setVerifying(false);
      }
    }
    // For non-brokers, the Link component will handle navigation normally
  };

  if (loading && places.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="mb-4 text-red-500">{error}</div>
        <Link
          to={isBrokerMode ? "/broker/dashboard" : "/owner/dashboard"}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AccountNav />
      <div className="text-center ">
        <Link
          className="inline-flex gap-1 rounded-full bg-[#D746B7] px-6 py-2 text-white"
          to={isBrokerMode ? '/broker/property/new' : '/account/property/new'}
          onClick={user && parseInt(user.role) === 3 ? handleAddPropertyClick : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {verifying ? 'Verifying...' : t('addNewProperty')}
        </Link>
      </div>
      <div className="mx-4 mt-4">
        {places.length > 0 ? (
          places.map((place) => (
            <InfoCard 
              place={place} 
              key={place.property_id} 
              onUpdate={handlePropertyUpdate}
            />
          ))
        ) : (
          <div className="mt-8 text-center">
            <p className="mb-4 text-xl">{t('noPropertiesFound')}</p>
            <p className="mb-6 text-gray-500">{t('noPropertiesYet')}</p>
            <img 
              src="/placeholder-house.png" 
              alt="No properties" 
              className="mx-auto h-40 w-40 opacity-50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      {loading && <div className="fixed bottom-4 right-4"><Spinner /></div>}
    </div>
  );
};

export default PlacesPage;
