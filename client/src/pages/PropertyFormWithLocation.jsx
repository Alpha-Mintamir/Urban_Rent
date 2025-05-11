import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from '@/utils/axios';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/hooks';

import AccountNav from '@/components/ui/AccountNav';
import Perks from '@/components/ui/Perks';
import PhotosUploader from '@/components/ui/PhotosUploader';
import Spinner from '@/components/ui/Spinner';

// Define Property Types (with bilingual support)
const propertyTypeGroups = [
  {
    groupLabel_en: 'Residential - Modern',
    groupLabel_am: 'ዘመናዊ መኖሪያዎች',
    types: [
      { value: 'APARTMENT', en: 'Apartment', am: 'አፓርትመንት' },
      { value: 'CONDOMINIUM', en: 'Condominium', am: 'ኮንዶሚኒየም' },
      { value: 'VILLA_STANDALONE', en: 'Villa / Standalone House', am: 'ቪላ / ገለልተኛ ቤት' },
      { value: 'COMPOUND_HOUSE', en: 'Compound House (Shared Compound, Private Unit)', am: 'ግቢ ቤት (የጋራ ግቢ፣ የግል ክፍል)' },
      { value: 'TOWNHOUSE', en: 'Townhouse (Attached Houses)', am: 'ተያያዥ ቤት / ታውን ሀውስ' },
      { value: 'STUDIO_BEDSITTER', en: 'Studio / Bedsitter', am: 'ስቱዲዮ / ባለአንድ መኝታ ክፍል' },
    ]
  },
  {
    groupLabel_en: 'Residential - Shared Living',
    groupLabel_am: 'የጋራ መኖሪያዎች',
    types: [
      { value: 'ROOM_RENTAL_SHARED_HOUSE', en: 'Room Rental / Shared House', am: 'ክፍል ኪራይ / የጋራ ቤት' },
    ]
  },
  {
    groupLabel_en: 'Residential - Traditional',
    groupLabel_am: 'ባህላዊ መኖሪያዎች',
    types: [
      { value: 'TRADITIONAL_HOME_GOJO', en: 'Traditional Home (e.g., Gojo)', am: 'ባህላዊ ቤት (ለምሳሌ፦ ጎጆ)' },
      { value: 'CHIKA_BET_MUD_HOUSE', en: 'Chika Bet / Mud House', am: 'ጭቃ ቤት' },
    ]
  },
  {
    groupLabel_en: 'Commercial Properties',
    groupLabel_am: 'የንግድ ቦታዎች',
    types: [
      { value: 'COMMERCIAL_GENERAL', en: 'Commercial Space (General)', am: 'የንግድ ቦታ (አጠቃላይ)' },
      { value: 'SHOP_RETAIL', en: 'Shop / Retail Store', am: 'ሱቅ / የችርቻሮ መደብር' },
      { value: 'OFFICE_SPACE', en: 'Office Space', am: 'የቢሮ ቦታ' },
      { value: 'WAREHOUSE_STORAGE', en: 'Warehouse / Storage', am: 'መጋዘን / ማከማቻ' },
      { value: 'RESTAURANT_CAFE_BAR', en: 'Restaurant / Cafe / Bar Space', am: 'ምግብ ቤት / ካፌ / ባር ቦታ' },
      { value: 'HOTEL_GUESTHOUSE', en: 'Hotel / Guesthouse', am: 'ሆቴል / የእንግዳ ማረፊያ' },
    ]
  },
  {
    groupLabel_en: 'Other Property Types',
    groupLabel_am: 'ሌሎች የንብረት ዓይነቶች',
    types: [
       { value: 'MIXED_USE_PROPERTY', en: 'Mixed-Use Property (Residential & Commercial)', am: 'ድብልቅ ንብረት (መኖሪያና ንግድ)' },
       { value: 'LAND_PLOT', en: 'Land / Plot (For Development or Sale)', am: 'ቦታ / መሬት (ለልማት ወይም ለሽያጭ)' },
       { value: 'SPECIAL_PURPOSE_PROPERTY', en: 'Special Purpose Property (e.g., School, Clinic)', am: 'ልዩ ዓላማ ያለው ንብረት (ት/ቤት፣ ክሊኒክ)' },
    ]
  }
];

// Fallback location data
const FALLBACK_SUB_CITIES = [
  'አዲስ ከተማ', 'አቃቂ ቃሊቲ', 'አራዳ', 'ቦሌ', 'ጉለሌ',
  'ኮልፌ ቀራኒዮ', 'ልደታ', 'ንፋስ ስልክ ላፍቶ', 'ቂርቆስ', 'የካ'
];

const FALLBACK_WOREDAS = {
  'አዲስ ከተማ': Array.from({ length: 14 }, (_, i) => `ወረዳ ${i + 1}`),
  'አቃቂ ቃሊቲ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`),
  'አራዳ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ቦሌ': Array.from({ length: 14 }, (_, i) => `ወረዳ ${i + 1}`),
  'ጉለሌ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ኮልፌ ቀራኒዮ': Array.from({ length: 15 }, (_, i) => `ወረዳ ${i + 1}`),
  'ልደታ': Array.from({ length: 10 }, (_, i) => `ወረዳ ${i + 1}`),
  'ንፋስ ስልክ ላፍቶ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`),
  'ቂርቆስ': Array.from({ length: 11 }, (_, i) => `ወረዳ ${i + 1}`),
  'የካ': Array.from({ length: 13 }, (_, i) => `ወረዳ ${i + 1}`)
};

// Create kebele lists
const FALLBACK_KEBELES = {};
Object.keys(FALLBACK_WOREDAS).forEach(subCity => {
  FALLBACK_KEBELES[subCity] = {};
  FALLBACK_WOREDAS[subCity].forEach(woreda => {
    let kebeleCount = 20;
    if (['አዲስ ከተማ', 'ቦሌ', 'ኮልፌ ቀራኒዮ'].includes(subCity)) {
      kebeleCount = 24;
    } else if (['አራዳ', 'ጉለሌ', 'ልደታ'].includes(subCity)) {
      kebeleCount = 18;
    } else if (subCity === 'ቂርቆስ') {
      kebeleCount = 15;
    }
    FALLBACK_KEBELES[subCity][woreda] = Array.from({ length: kebeleCount }, (_, i) => `ቀበሌ ${i + 1}`);
  });
});

// Function to get user data from localStorage
const getUserData = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
  }
  return null;
};

const PropertyFormWithLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  // Determine if we're in broker mode based on the URL path
  const isBrokerMode = location.pathname.startsWith('/broker');
  
  // Form states
  const [redirect, setRedirect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyingBroker, setVerifyingBroker] = useState(isBrokerMode);
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1 = location, 2 = property details
  
  // Location states
  const [locationData, setLocationData] = useState({
    kifleKetema: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    areaName: '',
  });
  
  // Property states
  const [formData, setFormData] = useState({
    property_name: '',
    property_type: '',
    description: '',
    extra_info: '',
    bedrooms: 1,
    bathrooms: 1,
    max_occupants: 4,
    price: 5000,
    perks: [],
  });
  
  // Dropdown options
  const [subCities, setSubCities] = useState(FALLBACK_SUB_CITIES);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  
  // Destructure form data
  const {
    property_name,
    property_type,
    description,
    extra_info,
    bedrooms,
    bathrooms,
    max_occupants,
    price,
    perks,
  } = formData;
  
  // Fetch sub-cities on component mount
  useEffect(() => {
    const fetchSubCities = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/locations/sub-cities');
        if (response.data && response.data.success) {
          const subCitiesData = response.data.subCities || [];
          if (subCitiesData.length > 0) {
            setSubCities(subCitiesData);
          } else {
            setSubCities(FALLBACK_SUB_CITIES);
          }
        } else {
          setSubCities(FALLBACK_SUB_CITIES);
        }
      } catch (error) {
        console.error('Error fetching sub-cities:', error);
        setSubCities(FALLBACK_SUB_CITIES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubCities();
    
    // If editing, load property data
    if (id) {
      loadPropertyData();
    }
  }, [id]);
  
  // Broker verification check
  useEffect(() => {
    if (isBrokerMode && user && parseInt(user.role) === 3) {
      setVerifyingBroker(true);
      const checkVerificationStatus = async () => {
        try {
          // Fetch broker verification status from API
          const response = await axiosInstance.get('/broker/verification/status');
          const { status: verificationStatus } = response.data;

          // Check if the broker is verified/approved
          if (verificationStatus !== 'approved' && verificationStatus !== 'verified') {
            toast.info('Your broker account is not yet verified. Please complete your verification to add properties.');
            navigate('/broker/verification', { replace: true });
            return;
          }
          
          // If we get here, verification is successful
          console.log('Broker verification successful:', verificationStatus);
          
        } catch (error) {
          console.error("Error fetching broker verification status:", error);
          
          // Only redirect for verification-specific errors
          // Check if it's a 404 (no verification) or specific verification error
          if (error.response?.status === 404 || 
              (error.response?.data && error.response.data.message && 
               error.response.data.message.toLowerCase().includes('verification'))) {
            
            const message = error.response?.status === 404 
              ? 'Please complete your broker verification before adding properties.' 
              : 'Verification status could not be confirmed. Please complete your verification.';
            
            toast.info(message);
            navigate('/broker/verification', { replace: true });
            return;
          } else {
            // For other errors (network, server), just show an error toast but don't redirect
            toast.error('There was an error checking your verification status, but you can continue.');
          }
        } finally {
          setVerifyingBroker(false);
        }
      };
      checkVerificationStatus();
    } else if (isBrokerMode && (!user || parseInt(user.role) !== 3)) {
      // If in broker mode but user is not a broker, redirect
      toast.error('Access denied. Broker account required.');
      navigate('/login', { replace: true });
      setVerifyingBroker(false);
    } else {
      // Not in broker mode, so no verification check needed
      setVerifyingBroker(false);
    }
  }, [user, isBrokerMode, navigate]);
  
  // Update woredas when sub-city changes
  useEffect(() => {
    if (!locationData.kifleKetema) {
      setWoredas([]);
      return;
    }
    
    const fetchWoredas = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/locations/woredas/${locationData.kifleKetema}`);
        if (response.data && response.data.success) {
          const woredasData = response.data.woredas || [];
          if (woredasData.length > 0) {
            setWoredas(woredasData);
          } else {
            setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
          }
        } else {
          setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
        }
      } catch (error) {
        console.error('Error fetching woredas:', error);
        setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWoredas();
    setLocationData(prev => ({ ...prev, wereda: '', kebele: '' }));
  }, [locationData.kifleKetema]);
  
  // Update kebeles when woreda changes
  useEffect(() => {
    if (!locationData.kifleKetema || !locationData.wereda) {
      setKebeles([]);
      return;
    }
    
    const fetchKebeles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/locations/kebeles/${locationData.kifleKetema}/${locationData.wereda}`);
        if (response.data && response.data.success) {
          const kebelesData = response.data.kebeles || [];
          if (kebelesData.length > 0) {
            setKebeles(kebelesData);
          } else {
            setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
          }
        } else {
          setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
        }
      } catch (error) {
        console.error('Error fetching kebeles:', error);
        setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKebeles();
    setLocationData(prev => ({ ...prev, kebele: '' }));
  }, [locationData.kifleKetema, locationData.wereda]);
  
  // Load property data for editing
  const loadPropertyData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/places/single-place/${id}`);
      const place = response.data;
      
      setFormData({
        property_name: place.property_name || '',
        property_type: place.property_type || '',
        description: place.description || '',
        extra_info: place.extra_info || '',
        bedrooms: place.bedrooms || 1,
        bathrooms: place.bathrooms || 1,
        max_occupants: place.max_guests || 4,
        price: place.price || 5000,
        perks: Array.isArray(place.perks) ? (place.perks.length > 0 && typeof place.perks[0] === 'object' ? place.perks.map(p => p.perk) : place.perks) : [],
      });
      
      // Set photos
      if (place.photos && Array.isArray(place.photos)) {
        const photoUrls = place.photos.map(photo => photo.url || photo.photo_url);
        setAddedPhotos(photoUrls);
      }
      
      // Set location data if available
      if (place.location) {
        const locationData = {
          kifleKetema: place.location.sub_city || '',
          wereda: place.location.woreda || '',
          kebele: place.location.kebele || '',
          houseNumber: place.location.house_no || '',
          areaName: place.location.area_name || '',
        };
        
        setLocationData(locationData);
        
        // Store location data in localStorage for persistence during edits
        localStorage.setItem('locationData', JSON.stringify(locationData));
        
        // Also immediately fetch the woredas and kebeles for this location
        if (locationData.kifleKetema) {
          try {
            const response = await axiosInstance.get(`/locations/woredas/${locationData.kifleKetema}`);
            if (response.data && response.data.success) {
              const woredasData = response.data.woredas || [];
              if (woredasData.length > 0) {
                setWoredas(woredasData);
              } else {
                setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
              }
            }
            
            if (locationData.wereda) {
              const kebeleResponse = await axiosInstance.get(`/locations/kebeles/${locationData.kifleKetema}/${locationData.wereda}`);
              if (kebeleResponse.data && kebeleResponse.data.success) {
                const kebelesData = kebeleResponse.data.kebeles || [];
                if (kebelesData.length > 0) {
                  setKebeles(kebelesData);
                } else {
                  setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
                }
              }
            }
          } catch (error) {
            console.error('Error loading location dependencies:', error);
          }
        }
      }
      
      // Skip to property details step since we're editing
      setCurrentStep(2);
    } catch (error) {
      console.error('Error loading property data:', error);
      toast.error('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle location input changes
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle property form input changes
  const handleFormData = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  // Validate location data
  const validateLocationData = () => {
    // Skip location validation if we're in edit mode and directly on step 2
    if (id && currentStep === 2) {
      return true;
    }

    if (!locationData.kifleKetema) {
      toast.error(language === 'am' ? 'እባክዎ ክፍለ ከተማ ይምረጡ' : 'Please select a sub-city');
      return false;
    }
    
    if (!locationData.wereda) {
      toast.error(language === 'am' ? 'እባክዎ ወረዳ ይምረጡ' : 'Please select a woreda');
      return false;
    }
    
    if (!locationData.kebele) {
      toast.error(language === 'am' ? 'እባክዎ ቀበሌ ይምረጡ' : 'Please select a kebele');
      return false;
    }
    
    if (!locationData.houseNumber) {
      toast.error(language === 'am' ? 'እባክዎ የቤት ቁጥር ያስገቡ' : 'Please enter a house number');
      return false;
    }
    
    if (!locationData.areaName) {
      toast.error(language === 'am' ? 'እባክዎ የአካባቢ ስም ያስገቡ' : 'Please enter an area name');
      return false;
    }
    
    return true;
  };
  
  // Validate property data
  const validatePropertyData = () => {
    let isValid = true;
    if (!formData.property_name.trim()) {
      toast.error(t('propertyNameRequired') || 'Property name is required.');
      isValid = false;
    }
    if (!formData.property_type) {
      toast.error(t('propertyTypeRequired') || 'Property type is required.');
      isValid = false;
    }
    if (!formData.description.trim()) {
      toast.error(t('descriptionRequired') || 'Description is required.');
      isValid = false;
    }
    if (formData.price <= 0) {
      toast.error(t('priceMustBePositive') || 'Price must be a positive number.');
      isValid = false;
    }
    if (formData.bedrooms <= 0) {
      toast.error(t('bedroomsMustBePositive') || 'Bedrooms must be a positive number.');
      isValid = false;
    }
    if (formData.bathrooms <= 0) {
      toast.error(t('bathroomsMustBePositive') || 'Bathrooms must be a positive number.');
      isValid = false;
    }
    if (formData.max_occupants <= 0) {
      toast.error(t('maxOccupantsMustBePositive') || 'Max occupants must be a positive number.');
      isValid = false;
    }
    if (addedPhotos.length === 0) {
      toast.error(t('atLeastOnePhoto') || 'At least one photo is required.');
      isValid = false;
    }
    return isValid;
  };
  
  // Handle next step button
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateLocationData()) {
        // Save location data to localStorage
        localStorage.setItem('locationData', JSON.stringify(locationData));
        setCurrentStep(2);
      }
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Modified validation flow
    const propertyValid = validatePropertyData();
    const locationValid = validateLocationData();
    
    if (!propertyValid || !locationValid) {
      return;
    }

    setLoading(true);
    const userData = getUserData();

    // Create base property data
    const propertyData = {
      ...formData,
      max_guests: formData.max_occupants,
      photos: addedPhotos,
      user_id: user?.id || userData?.user_id || userData?.id,
    };
    delete propertyData.max_occupants;

    // Only include location data if we validated it
    // In edit mode and on step 2, we're not changing location
    if (id && currentStep === 2) {
      // Don't include location data when just editing property details
      console.log('Updating property details only (without changing location)');
    } else {
      propertyData.location = locationData;
    }

    console.log('Submitting Property Data:', propertyData);

    try {
      let response;
      const endpoint = '/places/add-places'; // Same endpoint for both roles
      const updateEndpoint = '/places/update-place'; // Same update endpoint for both roles
      
      if (id) {
        response = await axiosInstance.put(updateEndpoint, { id, ...propertyData });
        toast.success(t('propertyUpdatedSuccess') || 'Property updated successfully!');
      } else {
        response = await axiosInstance.post(endpoint, propertyData);
        toast.success(t('propertyAddedSuccess') || 'Property added successfully!');
      }
      console.log('Server Response:', response.data);
      
      // Redirect based on role
      setRedirect(isBrokerMode ? '/broker/places' : '/account/places');
    } catch (error) {
      console.error('Error submitting property:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || t('errorSubmittingProperty') || 'Failed to submit property. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function for section headers
  const preInput = (header, description) => {
    return (
      <>
        <h2 className="mt-8 text-2xl font-bold text-gray-800 border-b pb-2 border-gray-200">{header}</h2>
        <p className="text-sm text-gray-600 mt-2 mb-4">{description}</p>
      </>
    );
  };
  
  if (verifyingBroker) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
        <p className="ml-4 text-lg">Verifying account status...</p>
      </div>
    );
  }
  
  if (redirect) {
    return <Navigate to={redirect} />;
  }
  
  if (loading && !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AccountNav />
      <h1 className="mb-8 text-center text-3xl font-bold">
        {id ? 'Edit Property' : 'Add New Property'}
      </h1>
      
      {/* Step indicator */}
      <div className="mx-auto mb-8 flex max-w-4xl justify-between">
        <div className={`flex flex-col items-center ${currentStep === 1 ? 'text-[#D746B7]' : 'text-gray-500'}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep === 1 ? 'bg-[#D746B7] text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="mt-2">{t('locationInfo')}</span>
        </div>
        <div className="relative flex-1">
          <div className={`absolute top-5 h-1 w-full ${currentStep === 2 ? 'bg-[#D746B7]' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`flex flex-col items-center ${currentStep === 2 ? 'text-[#D746B7]' : 'text-gray-500'}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${currentStep === 2 ? 'bg-[#D746B7] text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="mt-2">{t('propertyDetails')}</span>
        </div>
      </div>
      
      {/* Step 1: Location Information */}
      {currentStep === 1 && (
        <div className="mx-auto max-w-4xl bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 border-b pb-4 border-gray-200">
            {t('locationVerification') || 'Property Location'}
          </h2>
          
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#D746B7" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
            </div>
            <p className="text-center text-gray-600 max-w-lg mx-auto">
              {t('locationImportantMessage') || 'Accurate location details help tenants find your property easily. All fields are required for successful property listing.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('subCity') || 'Sub City'}:</label>
              <div className="relative">
                <select
                  name="kifleKetema"
                  value={locationData.kifleKetema}
                  onChange={handleLocationChange}
                  className="w-full rounded-lg border border-gray-300 p-3 pl-4 pr-10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-transparent transition-all text-gray-800 appearance-none"
                  disabled={loading}
                >
                  <option value="">{t('selectSubCity') || '-- Select Sub City --'}</option>
                  {subCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('woreda') || 'Woreda'}:</label>
              <div className="relative">
                <select
                  name="wereda"
                  value={locationData.wereda}
                  onChange={handleLocationChange}
                  className="w-full rounded-lg border border-gray-300 p-3 pl-4 pr-10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-transparent transition-all text-gray-800 appearance-none"
                  disabled={!locationData.kifleKetema || loading}
                >
                  <option value="">{t('selectWoreda') || '-- Select Woreda --'}</option>
                  {woredas.map((woreda) => (
                    <option key={woreda} value={woreda}>
                      {woreda}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              {!locationData.kifleKetema && 
                <p className="text-xs text-gray-500 italic">Please select a Sub City first</p>
              }
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('kebele') || 'Kebele'}:</label>
              <div className="relative">
                <select
                  name="kebele"
                  value={locationData.kebele}
                  onChange={handleLocationChange}
                  className="w-full rounded-lg border border-gray-300 p-3 pl-4 pr-10 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-transparent transition-all text-gray-800 appearance-none"
                  disabled={!locationData.wereda || loading}
                >
                  <option value="">{t('selectKebele') || '-- Select Kebele --'}</option>
                  {kebeles.map((kebele) => (
                    <option key={kebele} value={kebele}>
                      {kebele}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              {!locationData.wereda && 
                <p className="text-xs text-gray-500 italic">Please select a Woreda first</p>
              }
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('houseNumber') || 'House Number'}:</label>
              <div className="relative">
                <input
                  type="text"
                  name="houseNumber"
                  value={locationData.houseNumber}
                  onChange={handleLocationChange}
                  placeholder={t('enterHouseNumber') || 'e.g., 123'}
                  className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('areaName') || 'Area Name'}:</label>
              <div className="relative">
                <input
                  type="text"
                  name="areaName"
                  value={locationData.areaName}
                  onChange={handleLocationChange}
                  placeholder={t('enterAreaName') || 'e.g., Near Central Market'}
                  className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D746B7] to-purple-600 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <span>{t('continue') || 'Continue'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Property Details */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          {id && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800">
              <p className="text-center">
                {language === 'am' 
                  ? 'የንብረት ዝርዝሮችን ለማስተካከል፣ እዚህ ለውጦችን ማድረግ እና መሰረታዊ መረጃ የሚያስፈልግዎ ከሆነ "ወደ መገኛ ማረጋገጫ ተመለስ" ጠቅ ያድርጉ።' 
                  : 'You can update your property details here. If you need to change location information, click "Back to Location".'}
              </p>
            </div>
          )}
          
          <div className="mb-4 flex justify-center">
            <button 
              type="button"
              onClick={handleBack}
              className="mr-4 rounded-full bg-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-400"
            >
              {t('backToLocation') || 'Back to Location'}
            </button>
          </div>
          
          <div>
            {preInput(t('title') || 'Title', t('titleForYourPlace') || 'Title for your place. Should be short and catchy as in advertisement.')}
            <input
              type="text"
              value={property_name}
              name="property_name"
              onChange={handleFormData}
              placeholder={t('titlePlaceholder') || 'e.g., My lovely apartment'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] shadow-sm transition-all duration-200"
            />
          </div>

          <div>
            {preInput(t('propertyType') || 'Property Type', t('selectPropertyType') || 'Select the type of your property.')}
            <select
              name="property_type"
              value={property_type}
              onChange={handleFormData}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] shadow-sm transition-all duration-200 bg-white"
            >
              <option value="" disabled>
                {language === 'am' ? 'የንብረት አይነት ይምረጡ' : 'Select Property Type'}
              </option>
              {propertyTypeGroups.map(group => (
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
            {preInput(t('description') || 'Description', t('descriptionOfPlace') || 'Description of the place.')}
            <textarea
              value={description}
              name="description"
              onChange={handleFormData}
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] shadow-sm transition-all duration-200"
              placeholder={t('descriptionPlaceholder') || 'Provide a detailed description of your property...'}
            />
          </div>

          {preInput(t('photos') || 'Photos', t('morePhotosBetter') || 'More photos = better.')}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

          <div>
            {preInput(t('perks') || 'Perks', t('selectPerks') || 'Select all the perks of your place.')}
            <Perks selected={perks} onChange={(newPerks) => setFormData(prev => ({ ...prev, perks: newPerks }))} />
          </div>

          <div>
            {preInput(t('extraInfo') || 'Extra Info', t('houseRulesEtc') || 'House rules, etc.')}
            <textarea 
              value={extra_info} 
              name="extra_info"
              onChange={handleFormData} 
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] shadow-sm transition-all duration-200"
            />
          </div>

          <div>
            {preInput(t('occupancyPrice') || 'Occupancy & Price', t('addNumberOfOccupantsAndPrice') || 'Add number of occupants and price per night.')}
            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">{t('bedrooms') || 'Bedrooms'}</label>
                <input 
                  type="number" 
                  id="bedrooms" 
                  name="bedrooms" 
                  value={bedrooms} 
                  onChange={handleFormData} 
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] transition-all duration-200"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">{t('bathrooms') || 'Bathrooms'}</label>
                <input 
                  type="number" 
                  id="bathrooms" 
                  name="bathrooms" 
                  value={bathrooms} 
                  onChange={handleFormData} 
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] transition-all duration-200"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor="max_occupants" className="block text-sm font-medium text-gray-700 mb-1">{t('maxOccupants') || 'Max. number of occupants'}</label>
                <input 
                  type="number" 
                  id="max_occupants" 
                  name="max_occupants" 
                  value={max_occupants} 
                  onChange={handleFormData} 
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] transition-all duration-200"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">{t('pricePerNight') || 'Price per night (ETB)'}</label>
                <input 
                  type="number" 
                  id="price" 
                  name="price" 
                  value={price} 
                  onChange={handleFormData} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D746B7] focus:border-[#D746B7] transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-10 mb-6">
            <button 
              type="button" 
              onClick={handleBack} 
              className="px-8 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D746B7] shadow-sm transition-colors"
            >
              {t('back') || 'Back'}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D746B7] hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D746B7] disabled:opacity-50 flex items-center transition-colors"
            >
              {loading && <Spinner size="sm" className="mr-2" />}
              {id ? (t('updateProperty') || 'Update Property') : (t('addProperty') || 'Add Property')}
            </button>
          </div>
        </form>
      )}
      {loading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><Spinner /></div>}
    </div>
  );
};

export default PropertyFormWithLocation;
