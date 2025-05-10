import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import PlaceCard from '@/components/ui/PlaceCard';
import { useLanguage } from '@/providers/LanguageProvider';
import debounce from 'lodash/debounce';

// Define Property Types (Copied from PropertyFormWithLocation - TODO: Move to shared util)
const propertyTypeGroupsForFilter = [
  { 
    groupLabel_en: 'Any Type', groupLabel_am: 'ማንኛውም አይነት', 
    types: [ { value: '', en: 'Any Property Type', am: 'ማንኛውም የንብረት አይነት' } ] 
  },
  {
    groupLabel_en: 'Residential - Modern',
    groupLabel_am: 'ዘመናዊ መኖሪያዎች',
    types: [
      { value: 'APARTMENT', en: 'Apartment', am: 'አፓርትመንት' },
      { value: 'CONDOMINIUM', en: 'Condominium', am: 'ኮንዶሚኒየም' },
      { value: 'VILLA_STANDALONE', en: 'Villa / Standalone House', am: 'ቪላ / ገለልተኛ ቤት' },
      { value: 'COMPOUND_HOUSE', en: 'Compound House', am: 'ግቢ ቤት' }, // Simplified label for filter
      { value: 'TOWNHOUSE', en: 'Townhouse', am: 'ተያያዥ ቤት / ታውን ሀውስ' }, // Simplified label for filter
      { value: 'STUDIO_BEDSITTER', en: 'Studio / Bedsitter', am: 'ስቱዲዮ / ባለአንድ መኝታ ክፍል' },
    ]
  },
  {
    groupLabel_en: 'Residential - Shared Living',
    groupLabel_am: 'የጋራ መኖሪያዎች',
    types: [
      { value: 'ROOM_RENTAL_SHARED_HOUSE', en: 'Room Rental / Shared', am: 'ክፍል ኪራይ / የጋራ' }, // Simplified
    ]
  },
  {
    groupLabel_en: 'Residential - Traditional',
    groupLabel_am: 'ባህላዊ መኖሪያዎች',
    types: [
      { value: 'TRADITIONAL_HOME_GOJO', en: 'Traditional Home', am: 'ባህላዊ ቤት' }, // Simplified
      { value: 'CHIKA_BET_MUD_HOUSE', en: 'Chika Bet / Mud House', am: 'ጭቃ ቤት' },
    ]
  },
  {
    groupLabel_en: 'Commercial Properties',
    groupLabel_am: 'የንግድ ቦታዎች',
    types: [
      { value: 'COMMERCIAL_GENERAL', en: 'Commercial Space', am: 'የንግድ ቦታ' }, // Simplified
      { value: 'SHOP_RETAIL', en: 'Shop / Retail', am: 'ሱቅ / ችርቻሮ' }, // Simplified
      { value: 'OFFICE_SPACE', en: 'Office Space', am: 'የቢሮ ቦታ' },
      { value: 'WAREHOUSE_STORAGE', en: 'Warehouse / Storage', am: 'መጋዘን / ማከማቻ' },
      { value: 'RESTAURANT_CAFE_BAR', en: 'Restaurant / Cafe / Bar', am: 'ምግብ ቤት / ካፌ / ባር' }, // Simplified
      { value: 'HOTEL_GUESTHOUSE', en: 'Hotel / Guesthouse', am: 'ሆቴል / ማረፊያ' }, // Simplified
    ]
  },
  {
    groupLabel_en: 'Other Property Types',
    groupLabel_am: 'ሌሎች የንብረት ዓይነቶች',
    types: [
       { value: 'MIXED_USE_PROPERTY', en: 'Mixed-Use Property', am: 'ድብልቅ ንብረት' }, // Simplified
       { value: 'LAND_PLOT', en: 'Land / Plot', am: 'ቦታ / መሬት' }, // Simplified
       { value: 'SPECIAL_PURPOSE_PROPERTY', en: 'Special Purpose', am: 'ልዩ ዓላማ' }, // Simplified
    ]
  }
];

const PropertyBrowsePage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    maxOccupants: '',
    isBrokerListing: false,
    subCity: '',
    woreda: '',
    kebele: '',
    showRented: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOptions, setLocationOptions] = useState({
    subCities: [],
    woredas: [],
    kebeles: []
  });
  const [expandedLocationFilter, setExpandedLocationFilter] = useState(null);
  const isInitialMount = useRef(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  console.log('[PropertyBrowsePage] Current filters state:', filters);
  console.log('[PropertyBrowsePage] Current sort state:', { sortBy, sortOrder });

  const occupantOptions = ['Any', '1', '2', '3', '4', '5+'];

  useEffect(() => {
    const fetchLocationOptions = async () => {
      try {
        console.log('[PropertyBrowsePage] Fetching location options...');
        const { data } = await axiosInstance.get('/location-data/distinct-values');
        console.log('[PropertyBrowsePage] Received location options data:', data);
        setLocationOptions(data);
      } catch (err) {
        console.error("[PropertyBrowsePage] Error fetching location options:", err);
        setError(t('errorFetchingLocationOptions') || 'Could not load location filter options.');
      }
    };
    fetchLocationOptions();
  }, [t]);

  const debouncedFetch = useCallback(debounce((currentFilters, currentSearchTerm) => {
    fetchProperties(currentFilters, currentSearchTerm);
  }, 500), [language]);

  useEffect(() => {
    console.log("[PropertyBrowsePage] Initial mount: Fetching properties.");
    fetchProperties(filters, searchTerm);
  }, [language]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    console.log("[PropertyBrowsePage] Filters, searchTerm, or sort changed: Debouncing fetch.");
    debouncedFetch(filters, searchTerm);
  }, [filters, searchTerm, sortBy, sortOrder, debouncedFetch]);

  const fetchProperties = async (currentFilters, currentSearchTerm) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    try {
      const params = {
        priceMin: currentFilters.priceMin || undefined,
        priceMax: currentFilters.priceMax || undefined,
        propertyType: currentFilters.propertyType === 'Any' ? undefined : currentFilters.propertyType || undefined,
        bedrooms: currentFilters.bedrooms ? parseInt(currentFilters.bedrooms) : undefined,
        bathrooms: currentFilters.bathrooms ? parseInt(currentFilters.bathrooms) : undefined,
        maxGuests: currentFilters.maxOccupants === 'Any' ? undefined : (currentFilters.maxOccupants.endsWith('+') ? parseInt(currentFilters.maxOccupants) : currentFilters.maxOccupants || undefined),
        isBrokerListing: currentFilters.isBrokerListing ? true : undefined,
        amenities: currentFilters.amenities.length > 0 ? currentFilters.amenities.join(',') : undefined,
        subCity: currentFilters.subCity || undefined,
        woreda: currentFilters.woreda || undefined,
        kebele: currentFilters.kebele || undefined,
        searchTerm: currentSearchTerm || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: !currentFilters.showRented ? 'available' : undefined // Only show available properties unless showRented is true
      };
      
      console.log('[PropertyBrowsePage] Params sent to API:', params);

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const { data } = await axiosInstance.get('/places', { params });
      console.log('Fetched properties with filters:', data);
      setProperties(data.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(language === 'am' ? 'ንብረቶችን ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Could not fetch properties. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAmenityToggle = (amenity) => {
    if (filters.amenities.includes(amenity)) {
      setFilters({
        ...filters,
        amenities: filters.amenities.filter(a => a !== amenity)
      });
    } else {
      setFilters({
        ...filters,
        amenities: [...filters.amenities, amenity]
      });
    }
  };

  const handleLocationSelect = (filterKey, value) => {
    console.log(`[PropertyBrowsePage] handleLocationSelect called. Key: ${filterKey}, Value: ${value}`);
    setFilters(prevFilters => {
      console.log('[PropertyBrowsePage] prevFilters in handleLocationSelect:', prevFilters);
      const newFilterValue = prevFilters[filterKey] === value ? '' : value;
      const updatedFilters = { ...prevFilters, [filterKey]: newFilterValue };
      console.log('[PropertyBrowsePage] updatedFilters in handleLocationSelect:', updatedFilters);
      return updatedFilters;
    });
  };

  const filteredProperties = properties;

  if (loading && !properties.length) {
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
        <button
          onClick={() => navigate('/tenant/dashboard')}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {t('returnToDashboard') || 'Return to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {console.log('[PropertyBrowsePage] locationOptions state:', locationOptions)}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            {t('browseProperties') || 'Browse Properties'}
          </h1>
          <p className="text-lg text-gray-500">
            {t('findYourDreamHome') || 'Find your dream home from our extensive listings'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Panel (Right Side on Desktop, Top on Mobile) */}
          <aside className="w-full md:w-1/3 lg:w-1/4 bg-white p-6 rounded-lg shadow-lg md:sticky md:top-24 self-start order-1 md:order-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">{t('filterBy') || 'Filter By'}</h2>

            {/* Search Input (within panel now) */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                {t('search') || 'Search'}
              </label>
              <input
                type="text"
                id="search"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={t('searchPlaceholderBrief') || 'Keywords...'}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Pricing Group */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('pricingTitle') || 'Pricing (ETB)'}</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="priceMin" className="block text-xs font-medium text-gray-600">
                    {t('minPrice') || 'Min Price'}
                  </label>
                  <input
                    type="number"
                    id="priceMin"
                    name="priceMin"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="priceMax" className="block text-xs font-medium text-gray-600">
                    {t('maxPrice') || 'Max Price'}
                  </label>
                  <input
                    type="number"
                    id="priceMax"
                    name="priceMax"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="100000"
                    value={filters.priceMax}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            {/* Property Features Group */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('featuresTitle') || 'Property Features'}</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="propertyType" className="block text-xs font-medium text-gray-600">
                    {t('propertyType') || 'Property Type'}
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    value={filters.propertyType}
                    onChange={handleFilterChange}
                  >
                    {propertyTypeGroupsForFilter.map(group => (
                      <optgroup key={language === 'am' ? group.groupLabel_am : group.groupLabel_en} label={language === 'am' ? group.groupLabel_am : group.groupLabel_en}>
                        {group.types.map(pt => (
                          <option key={pt.value} value={pt.value}>
                            {language === 'am' ? pt.am : pt.en}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bedrooms" className="block text-xs font-medium text-gray-600">
                    {t('bedrooms') || 'Bedrooms'}
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    min="1"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder={t('any') || 'Any'}
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="bathrooms" className="block text-xs font-medium text-gray-600">
                    {t('bathrooms') || 'Bathrooms'}
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    min="1"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder={t('any') || 'Any'}
                    value={filters.bathrooms}
                    onChange={handleFilterChange}
                  />
                </div>
                <div>
                  <label htmlFor="maxOccupants" className="block text-xs font-medium text-gray-600">
                    {t('maxOccupantsFilter') || 'Max. Occupants'}
                  </label>
                  <select
                    id="maxOccupants"
                    name="maxOccupants"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    value={filters.maxOccupants}
                    onChange={handleFilterChange}
                  >
                    {occupantOptions.map(option => (
                      <option key={option} value={option === 'Any' ? '' : option}>
                        {t('occupants_' + option.toLowerCase().replace('+', 'plus')) || option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-2">
                  <input
                    id="isBrokerListing"
                    name="isBrokerListing"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                    checked={filters.isBrokerListing}
                    onChange={handleFilterChange}
                  />
                  <label htmlFor="isBrokerListing" className="text-sm font-medium text-gray-700">
                    {t('brokerListingOnly') || 'Broker Listing Only'}
                  </label>
                </div>
              </div>
            </div>

            {/* Location Filters Group */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('locationTitle') || 'Location'}</h3>
              {console.log('[PropertyBrowsePage] Rendering Location Filters. Number of locKeys:', Object.keys(locationOptions).length)}
              {Object.keys(locationOptions).map(locKey => {
                if (locKey === 'areaNames') return null;

                const title = locKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const options = locationOptions[locKey];
                const isExpanded = expandedLocationFilter === locKey;

                console.log(`[PropertyBrowsePage] Mapping locKey: ${locKey}, Options count: ${options ? options.length : 0}`);
                if (!options || options.length === 0) return null;

                return (
                  <div key={locKey} className="mb-2 border-b border-gray-200 last:border-b-0">
                    <button 
                      type="button"
                      className="w-full flex justify-between items-center py-2 text-md font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
                      onClick={() => setExpandedLocationFilter(isExpanded ? null : locKey)}
                    >
                      <span>{t(locKey) || title}</span>
                      <svg 
                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="pt-2 pb-3 space-y-1 max-h-48 overflow-y-auto pr-1"> 
                        {options.map(option => {
                          const uniqueRadioName = `${locKey}-group`;
                          const isChecked = filters[filterKeyFromLocKey(locKey)] === option;
                          return (
                            <label 
                              key={option} 
                              className={`w-full flex items-center text-left px-2 py-1.5 text-sm rounded-md transition-colors duration-150 cursor-pointer 
                                ${
                                  isChecked 
                                  ? 'bg-green-100 text-green-700 font-semibold'
                                  : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                              <input
                                type="radio"
                                name={uniqueRadioName}
                                value={option}
                                checked={isChecked}
                                onChange={() => handleLocationSelect(filterKeyFromLocKey(locKey), option)}
                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-1 focus:ring-offset-0 mr-2"
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Amenities Group */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('amenities') || 'Amenities'}</h3>
              <div className="space-y-2">
                {['WiFi', 'Parking', 'Kitchen', 'TV', 'Air Conditioning'].map(amenity => (
                  <label key={amenity} className="flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-2"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    {t(amenity.toLowerCase().replace(/\s+/g, '')) || amenity} 
                  </label>
                ))}
              </div>
            </div>
            
            {/* Clear Filters Button */}
            <button
                onClick={() => {
                  setFilters({
                    priceMin: '', priceMax: '', propertyType: '',
                    bedrooms: '', bathrooms: '', amenities: [], maxOccupants: '', isBrokerListing: false,
                    subCity: '', woreda: '', kebele: '', showRented: false
                  });
                  setSearchTerm('');
                }}
                className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {t('clearAllFilters') || 'Clear All Filters'}
            </button>

          </aside>

          {/* Main Content Area (Property Listings) */}
          <main className="w-full md:w-2/3 lg:w-3/4 order-2 md:order-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredProperties.length} {t('propertiesFound') || 'Properties Found'}
              </h2>
              
              <div className="flex items-center gap-4">
                {/* Toggle Switch for Showing Rented Properties */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    {filters.showRented 
                      ? (t('showingAllProperties') || 'All Properties') 
                      : (t('showingAvailableOnly') || 'Available Only')}
                  </span>
                  <button 
                    onClick={() => {
                      setFilters(prev => ({...prev, showRented: !prev.showRented}));
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full"
                    aria-pressed={filters.showRented}
                  >
                    <span className={`
                      ${filters.showRented ? 'bg-green-600' : 'bg-gray-300'} 
                      absolute mx-auto h-5 w-10 rounded-full transition-colors duration-200
                    `}></span>
                    <span 
                      className={`
                        ${filters.showRented ? 'translate-x-5' : 'translate-x-1'} 
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      `}
                    />
                  </button>
                </div>
                
                {/* Sorting options */}
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <option value="createdAt-DESC">{t('sortNewest') || 'Newest'}</option>
                  <option value="createdAt-ASC">{t('sortOldest') || 'Oldest'}</option>
                  <option value="updatedAt-DESC">{t('sortUpdated') || 'Recently Updated'}</option>
                  <option value="price-ASC">{t('sortPriceLowHigh') || 'Price: Low to High'}</option>
                  <option value="price-DESC">{t('sortPriceHighLow') || 'Price: High to Low'}</option>
                </select>
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <PlaceCard key={property.property_id} place={{
                    _id: property.property_id,
                    photos: property.photos?.map(photo => photo.photo_url) || [],
                    address: property.location?.sub_city || property.location?.area_name || 'Unknown Location',
                    title: property.property_name,
                    property_type: property.property_type,
                    price: property.price,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    createdAt: property.createdAt,
                    updatedAt: property.updatedAt,
                    is_broker_listing: property.is_broker_listing,
                    status: property.status
                  }} isTenantView={true} />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {t('noPropertiesFound') || 'No properties found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('tryDifferentFilters') || 'Try adjusting your filters or search term to find more properties'}
                  </p>
                  {/* Clear filters button is now in the side panel */}
                </div>
              )
            )}
            {loading && properties.length > 0 && <div className="text-center py-4"><Spinner/></div>} {/* Spinner for subsequent loads */}
          </main>
        </div>
      </div>
    </div>
  );
};

const filterKeyFromLocKey = (locKey) => {
  switch (locKey) {
    case 'subCities': return 'subCity';
    case 'woredas': return 'woreda';
    case 'kebeles': return 'kebele';
    default: return '';
  }
};

export default PropertyBrowsePage;
