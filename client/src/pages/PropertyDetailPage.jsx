import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import AccountNav from '@/components/ui/AccountNav';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import PropertyReviews from '@/components/property/PropertyReviews';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/places/single-place/${id}`);
        console.log('Fetched property details:', data);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property details:', error);
        const errorMessage = language === 'am' ? 'ንብረቱን ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Could not find the property. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id, language]);

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
          to="/owner/dashboard"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('returnToDashboard')}
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="mb-4 text-xl">{language === 'am' ? 'ንብረቱ አልተገኘም' : 'Property not found'}</div>
        <Link
          to="/owner/dashboard"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('returnToDashboard')}
        </Link>
      </div>
    );
  }

  // Format perks for display
  const formatPerks = (perks) => {
    if (!perks || !Array.isArray(perks) || perks.length === 0) {
      return language === 'am' ? 'ምንም አገልግሎቶች አልተመዘገቡም' : 'No amenities registered';
    }
    
    return perks.map(perk => 
      typeof perk === 'object' ? perk.name : perk
    ).join(', ');
  };

  // Get location data for display
  const getLocationData = (location) => {
    if (!location) return null;
    
    // Create an object with location parts that exist
    const locationData = {};
    if (location.sub_city) locationData.subCity = {
      label: language === 'am' ? 'ክፍለ ከተማ' : 'Sub City',
      value: location.sub_city
    };
    if (location.woreda) locationData.woreda = {
      label: language === 'am' ? 'ወረዳ' : 'Woreda',
      value: location.woreda
    };
    if (location.kebele) locationData.kebele = {
      label: language === 'am' ? 'ቀበለ' : 'Kebele',
      value: location.kebele
    };
    if (location.area_name) locationData.areaName = {
      label: language === 'am' ? 'የአካባቢ ስም' : 'Area Name',
      value: location.area_name
    };
    
    // If no parts exist, return null
    if (Object.keys(locationData).length === 0) {
      return null;
    }
    
    return locationData;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountNav />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Property Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
        </div>

        {/* Property Images */}
        <div className="mb-8">
          {property.photos?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.photos.map((photo, index) => {
                // Handle different photo object formats
                const photoUrl = typeof photo === 'string' 
                  ? photo 
                  : photo.url || photo.photo_url || '';
                
                // Determine if this is a Cloudinary URL or a local path
                const imageUrl = photoUrl.startsWith('http') 
                  ? photoUrl 
                  : `${import.meta.env.VITE_BASE_URL}${photoUrl}`;
                
                return (
                  <div key={index} className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
                    <img
                      src={imageUrl}
                      alt={`Property ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', imageUrl);
                        e.target.src = '/placeholder-house.png'; // Fallback image
                        e.target.className = 'h-full w-full object-contain p-4 opacity-50';
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100">
              <p className="text-gray-500">
                {language === 'am' ? 'ምንም ፎቶዎች አልተጫኑም' : 'No photos uploaded'}
              </p>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">{t('propertyDetails')}</h2>
          
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-700">{language === 'am' ? 'ዋጋ' : 'Price'}</h3>
              <p className="text-xl font-bold text-[#D746B7]">ETB {property.price}/{language === 'am' ? 'ወር' : 'month'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700">{language === 'am' ? 'ከፍተኛ የእንግዶች ብዛት' : 'Maximum Guests'}</h3>
              <p>{property.max_guests} {language === 'am' ? 'ሰዎች' : 'people'}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="mb-2 font-medium text-gray-700">{language === 'am' ? 'አድራሻ' : 'Address'}</h3>
            {property.location ? (
              <div className="rounded-lg bg-gray-50 p-4">
                {getLocationData(property.location) ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {Object.values(getLocationData(property.location)).map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-gray-500">
                    {language === 'am' ? 'ምንም የአድራሻ መረጃ አልተመዘገበም' : 'No address information registered'}
                  </p>
                )}
              </div>
            ) : (
              <p className="italic text-gray-500">
                {language === 'am' ? 'ምንም የአድራሻ መረጃ አልተመዘገበም' : 'No address information registered'}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700">{language === 'am' ? 'መግለጫ' : 'Description'}</h3>
            <p className="whitespace-pre-line">{property.description}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700">{language === 'am' ? 'አገልግሎቶች' : 'Amenities'}</h3>
            <p>{formatPerks(property.perks)}</p>
          </div>
          
          {property.extra_info && (
            <div>
              <h3 className="font-medium text-gray-700">{language === 'am' ? 'ተጨማሪ መረጃ' : 'Additional Information'}</h3>
              <p className="whitespace-pre-line">{property.extra_info}</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <PropertyReviews propertyId={id} />

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Link
            to="/account/places"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            {language === 'am' ? 'ወደ ንብረቶች ዝርዝር ተመለስ' : 'Return to Properties List'}
          </Link>
          
          <button
            onClick={() => navigate(`/account/places/${id}`)}
            className="rounded-md bg-[#D746B7] px-4 py-2 text-white hover:bg-[#c13da3]"
          >
            {t('edit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
