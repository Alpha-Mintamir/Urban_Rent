import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import axiosInstance from '@/utils/axios';

import AccountNav from '@/components/ui/AccountNav';
import InfoCard from '@/components/ui/InfoCard';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import AddressLink from '@/components/ui/AddressLink';
import BookingWidget from '@/components/ui/BookingWidget';
import PlaceGallery from '@/components/ui/PlaceGallery';
import PerksWidget from '@/components/ui/PerksWidget';
import ReviewSection from '@/components/ui/ReviewSection';

const CombinedPropertyPage = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const { id } = useParams();
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine if we're in broker mode based on the URL path
  const isBrokerMode = location.pathname.startsWith('/broker');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all user places
        const { data: placesData } = await axiosInstance.get('places/user-places');
        
        if (Array.isArray(placesData)) {
          setPlaces(placesData);
          
          // If an ID is provided, fetch that specific place
          if (id) {
            const { data: placeData } = await axiosInstance.get(`/places/${id}`);
            setSelectedPlace(placeData.place);
          } else if (placesData.length > 0) {
            // If no ID is provided but we have places, select the first one
            setSelectedPlace(placesData[0]);
          }
        } else {
          console.error('Unexpected data format:', placesData);
          setError('Unexpected data format received from server');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePlaceSelect = async (placeId) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/places/${placeId}`);
      setSelectedPlace(data.place);
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Failed to load property details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="container mx-auto px-4">
      <AccountNav />
      
      {/* Top section with Add New Property button */}
      <div className="mb-6 text-center">
        <Link
          className="inline-flex gap-1 rounded-full bg-[#D746B7] px-6 py-2 text-white"
          to={isBrokerMode ? '/broker/verify-location' : '/account/verify-location'}
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
          {t('addNewProperty')}
        </Link>
      </div>
      
      {/* Main content area - split into two columns on larger screens */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Left column - List of properties */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="mb-4 text-xl font-semibold">{t('yourProperties')}</h2>
          
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {places.length > 0 ? (
              places.map((place) => (
                <div 
                  key={place.property_id}
                  onClick={() => handlePlaceSelect(place.property_id)}
                  className={`cursor-pointer rounded-lg p-4 transition-all ${
                    selectedPlace && selectedPlace.property_id === place.property_id
                      ? 'bg-[#D746B7] bg-opacity-10 border-2 border-[#D746B7]'
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      {place.photos && place.photos[0] && (
                        <img 
                          src={place.photos[0].url || place.photos[0].photo_url} 
                          alt={place.property_name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{place.property_name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{place.description}</p>
                      <p className="mt-1 font-bold">ETB {place.price}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-xl">{t('noPropertiesFound')}</p>
                <p className="mb-6 text-gray-500">{t('noPropertiesYet')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Selected property details */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {selectedPlace ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">{selectedPlace.property_name}</h1>
              
              {selectedPlace.location && (
                <AddressLink placeAddress={`${selectedPlace.location.sub_city}, ${selectedPlace.location.woreda}, ${selectedPlace.location.kebele}`} />
              )}
              
              <div className="my-6">
                <PlaceGallery place={selectedPlace} />
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr]">
                <div>
                  <div className="my-4">
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-700">{selectedPlace.description}</p>
                  </div>
                  
                  <div className="my-4">
                    <h2 className="text-xl font-semibold mb-2">Extra Info</h2>
                    <p className="text-gray-700">{selectedPlace.extra_info}</p>
                  </div>
                  
                  <PerksWidget perks={selectedPlace.perks} />
                </div>
                
                <div>
                  <BookingWidget place={selectedPlace} />
                  
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Property Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Max Guests:</span> {selectedPlace.max_guests}</p>
                      <p><span className="font-medium">Price:</span> ETB {selectedPlace.price}</p>
                      <p><span className="font-medium">ID:</span> {selectedPlace.property_id}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Reviews & Ratings</h2>
                <ReviewSection propertyId={selectedPlace.property_id} />
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <Link
                  to={`/account/places/edit/${selectedPlace.property_id}`}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Edit Property
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xl text-gray-500 mb-2">Select a property to view details</p>
              <p className="text-gray-400">Click on any property from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinedPropertyPage;
