import { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaUser, FaMapMarkerAlt, FaDollarSign, FaBed, FaBath, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { useLanguage } from '../../providers/LanguageProvider';
import axiosInstance from '../../utils/axios';

const PropertyDetailModal = ({ propertyId, onClose }) => {
  const { t } = useLanguage();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/places/admin/properties/${propertyId}`);
        setProperty(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(t('errorFetchingProperty', 'Failed to load property details'));
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId, t]);

  const formatDate = (dateString) => {
    if (!dateString) return t('notAvailable', 'Not available');
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return t('notAvailable', 'Not available');
    }
  };

  const nextImage = () => {
    if (property?.photos?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.photos.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.photos?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.photos.length - 1 : prevIndex - 1
      );
    }
  };

  if (!propertyId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center bg-gray-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold flex items-center">
            <FaHome className="mr-2 text-blue-500" />
            {t('propertyDetails', 'Property Details')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : property ? (
            <div className="flex flex-col">
              {/* Property Images */}
              <div className="relative h-64 bg-gray-200">
                {property.photos && property.photos.length > 0 ? (
                  <>
                    <img 
                      src={property.photos[currentImageIndex]?.photo_url} 
                      alt={`${property.property_name} - ${currentImageIndex + 1}/${property.photos.length}`} 
                      className="w-full h-full object-cover"
                    />
                    {property.photos.length > 1 && (
                      <div className="absolute inset-0 flex justify-between items-center">
                        <button 
                          onClick={prevImage}
                          className="bg-black bg-opacity-50 text-white p-2 m-2 rounded-full hover:bg-opacity-70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={nextImage}
                          className="bg-black bg-opacity-50 text-white p-2 m-2 rounded-full hover:bg-opacity-70"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1}/{property.photos.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaHome className="text-gray-400 text-6xl" />
                  </div>
                )}
              </div>
              
              {/* Property Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{property.property_name}</h2>
                    <div className="flex items-center text-gray-600 mt-1">
                      <FaMapMarkerAlt className="text-red-500 mr-1" />
                      <span>{property.location?.area_name}</span>
                      {property.location?.sub_city && (
                        <span>, {property.location.sub_city}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaDollarSign className="text-green-500 mr-2" />
                      <div>
                        <div className="text-lg font-semibold">${property.price}</div>
                        <div className="text-xs text-gray-500">{t('perNight', 'per night')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaUsers className="text-blue-500 mr-2" />
                      <div>
                        <div className="text-lg font-semibold">{property.max_guests}</div>
                        <div className="text-xs text-gray-500">{t('maxGuests', 'max guests')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaBed className="text-purple-500 mr-2" />
                      <div>
                        <div className="text-lg font-semibold">{property.bedrooms || '1'}</div>
                        <div className="text-xs text-gray-500">{t('bedrooms', 'bedrooms')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaBath className="text-blue-400 mr-2" />
                      <div>
                        <div className="text-lg font-semibold">{property.bathrooms || '1'}</div>
                        <div className="text-xs text-gray-500">{t('bathrooms', 'bathrooms')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('propertyType', 'Property Type')}</h3>
                    <p className="capitalize">{property.property_type || t('notSpecified', 'Not specified')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('listedOn', 'Listed On')}</h3>
                    <p>{formatDate(property.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('owner', 'Owner')}</h3>
                    <div className="flex items-center">
                      <FaUser className="text-gray-500 mr-2" />
                      <span>{property.owner?.name || t('unknown', 'Unknown')}</span>
                      {property.owner?.email && (
                        <span className="ml-2 text-gray-500">({property.owner.email})</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('description', 'Description')}</h3>
                    <p className="text-gray-600">{property.description}</p>
                  </div>
                  
                  {property.extra_info && (
                    <div>
                      <h3 className="font-semibold text-gray-700">{t('extraInfo', 'Extra Info')}</h3>
                      <p className="text-gray-600">{property.extra_info}</p>
                    </div>
                  )}
                  
                  {property.perks && property.perks.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700">{t('perks', 'Perks')}</h3>
                      <div className="flex flex-wrap mt-2 gap-2">
                        {property.perks.map(perk => (
                          <span key={perk.perk_id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {perk.perk_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('location', 'Location')}</h3>
                    <div className="mt-1 space-y-1">
                      {property.location?.sub_city && (
                        <div className="flex">
                          <span className="text-gray-500 w-24">{t('subCity', 'Sub City')}:</span>
                          <span>{property.location.sub_city}</span>
                        </div>
                      )}
                      {property.location?.woreda && (
                        <div className="flex">
                          <span className="text-gray-500 w-24">{t('woreda', 'Woreda')}:</span>
                          <span>{property.location.woreda}</span>
                        </div>
                      )}
                      {property.location?.kebele && (
                        <div className="flex">
                          <span className="text-gray-500 w-24">{t('kebele', 'Kebele')}:</span>
                          <span>{property.location.kebele}</span>
                        </div>
                      )}
                      {property.location?.house_no && (
                        <div className="flex">
                          <span className="text-gray-500 w-24">{t('houseNo', 'House No')}:</span>
                          <span>{property.location.house_no}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              {t('propertyNotFound', 'Property not found')}
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

export default PropertyDetailModal; 