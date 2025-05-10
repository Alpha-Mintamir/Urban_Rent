import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import { useLanguage } from '@/providers/LanguageProvider';

// Comprehensive fallback data for locations in Addis Ababa
const FALLBACK_SUB_CITIES = [
  'አዲስ ከተማ',
  'አቃቂ ቃሊቲ',
  'አራዳ',
  'ቦሌ',
  'ጉለሌ',
  'ኮልፌ ቀራኒዮ',
  'ልደታ',
  'ንፋስ ስልክ ላፍቶ',
  'ቂርቆስ',
  'የካ'
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

// Create a comprehensive kebele list for each woreda in each sub-city
const FALLBACK_KEBELES = {};
Object.keys(FALLBACK_WOREDAS).forEach(subCity => {
  FALLBACK_KEBELES[subCity] = {};
  FALLBACK_WOREDAS[subCity].forEach(woreda => {
    // Different sub-cities have different kebele numbering patterns
    let kebeleCount = 20;
    if (subCity === 'አዲስ ከተማ' || subCity === 'ቦሌ' || subCity === 'ኮልፌ ቀራኒዮ') {
      kebeleCount = 24;
    } else if (subCity === 'አራዳ' || subCity === 'ጉለሌ' || subCity === 'ልደታ') {
      kebeleCount = 18;
    } else if (subCity === 'ቂርቆስ') {
      kebeleCount = 15;
    }
    FALLBACK_KEBELES[subCity][woreda] = Array.from({ length: kebeleCount }, (_, i) => `ቀበሌ ${i + 1}`);
  });
});

const LocationVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  
  // Determine if we're in broker mode based on the URL path
  const isBrokerMode = location.pathname.startsWith('/broker');

  const [locationData, setLocationData] = useState({
    kifleKetema: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    areaName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // State for dropdown options
  const [subCities, setSubCities] = useState(FALLBACK_SUB_CITIES);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  // Fetch sub-cities on component mount
  useEffect(() => {
    const fetchSubCities = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/locations/sub-cities');
        console.log('Sub-cities response:', response.data);
        if (response.data && response.data.success) {
          // Make sure we're using the correct property from the API response
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
        // Use fallback data
        setSubCities(FALLBACK_SUB_CITIES);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Attempt to fetch from API, but we already have fallback data loaded
    fetchSubCities();
  }, []);

  // Update woredas when sub-city changes
  useEffect(() => {
    if (!locationData.kifleKetema) {
      setWoredas([]);
      return;
    }
    
    // Immediately set fallback data for better UX
    if (FALLBACK_WOREDAS[locationData.kifleKetema]) {
      setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema]);
    }
    
    const fetchWoredas = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/locations/sub-city/${encodeURIComponent(locationData.kifleKetema)}/woredas`);
        console.log('Woredas response:', response.data);
        if (response.data && response.data.success) {
          // Make sure we're using the correct property from the API response
          const woredasData = response.data.woredas || [];
          if (woredasData.length > 0) {
            setWoredas(woredasData);
          } else {
            // If API returns empty array, use fallback data
            setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
          }
        } else {
          // If API response is not successful, use fallback data
          setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
        }
      } catch (error) {
        console.error('Error fetching woredas:', error);
        // Use fallback data on error
        setWoredas(FALLBACK_WOREDAS[locationData.kifleKetema] || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWoredas();
  }, [locationData.kifleKetema]);

  // Update kebeles when woreda changes
  useEffect(() => {
    if (!locationData.kifleKetema || !locationData.wereda) {
      setKebeles([]);
      return;
    }
    
    // Immediately set fallback data for better UX
    if (FALLBACK_KEBELES[locationData.kifleKetema] && 
        FALLBACK_KEBELES[locationData.kifleKetema][locationData.wereda]) {
      setKebeles(FALLBACK_KEBELES[locationData.kifleKetema][locationData.wereda]);
    }
    
    const fetchKebeles = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/locations/sub-city/${encodeURIComponent(locationData.kifleKetema)}/woreda/${encodeURIComponent(locationData.wereda)}/kebeles`
        );
        console.log('Kebeles response:', response.data);
        if (response.data && response.data.success) {
          // Make sure we're using the correct property from the API response
          const kebelesData = response.data.kebeles || [];
          if (kebelesData.length > 0) {
            setKebeles(kebelesData);
          } else {
            // If API returns empty array, use fallback data
            setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
          }
        } else {
          // If API response is not successful, use fallback data
          setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
        }
      } catch (error) {
        console.error('Error fetching kebeles:', error);
        // Use fallback data on error
        setKebeles(FALLBACK_KEBELES[locationData.kifleKetema]?.[locationData.wereda] || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKebeles();
  }, [locationData.kifleKetema, locationData.wereda]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLocationData = () => {
    if (!locationData.kifleKetema) {
      toast.error('እባክዎ ክፍለ ከተማ ይምረጡ');
      return false;
    }
    if (!locationData.wereda) {
      toast.error('እባክዎ ወረዳ ይምረጡ');
      return false;
    }
    if (!locationData.kebele) {
      toast.error('እባክዎ ቀበሌ ይምረጡ');
      return false;
    }
    if (!locationData.houseNumber) {
      toast.error('እባክዎ የቤት ቁጥር ያስገቡ');
      return false;
    }
    if (!locationData.areaName) {
      toast.error('እባክዎ የአካባቢ ስም ያስገቡ');
      return false;
    }
    return true;
  };

  const submitLocationData = () => {
    if (!validateLocationData()) {
      return;
    }

    try {
      setIsLoading(true);
      const locationDataToSubmit = {
        sub_city: locationData.kifleKetema,
        woreda: locationData.wereda,
        kebele: locationData.kebele,
        house_no: locationData.houseNumber,
        area_name: locationData.areaName
      };
      
      // Store location data in localStorage for use in place creation
      localStorage.setItem('locationData', JSON.stringify(locationData));
      
      // Show success message
      toast.info(language === 'am' ? 'የአካባቢ መረጃ በተሳካ ሁኔታ ተመዝግቧል። አሁን የንብረት ዝርዝር መረጃ ያስገቡ።' : 'Location verified successfully. Now add your property details.');
      
      // Navigate to place creation page based on user role
      navigate(isBrokerMode ? '/broker/places/new' : '/account/places/new');
    } catch (error) {
      console.error('Error saving location data:', error);
      toast.error(language === 'am' ? 'የአካባቢ መረጃ ማስቀመጥ አልተሳካም. እባክዎ ዳግም ይሞክሩ.' : 'Failed to save location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 flex grow items-center justify-around">
      <div className="mb-64 w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl">{t('locationVerification')}</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-2 block">{t('subCity')}:</label>
            <select
              name="kifleKetema"
              value={locationData.kifleKetema}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={isLoading}
            >
              <option value="">{t('selectSubCity')}</option>
              {subCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-2 block">{t('woreda')}:</label>
            <select
              name="wereda"
              value={locationData.wereda}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={!locationData.kifleKetema || isLoading}
            >
              <option value="">{t('selectWoreda')}</option>
              {woredas.map((woreda) => (
                <option key={woreda} value={woreda}>
                  {woreda}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-2 block">{t('kebele')}:</label>
            <select
              name="kebele"
              value={locationData.kebele}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={!locationData.wereda || isLoading}
            >
              <option value="">{t('selectKebele')}</option>
              {kebeles.map((kebele) => (
                <option key={kebele} value={kebele}>
                  {kebele}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-2 block">{t('houseNumber')}:</label>
            <input
              type="text"
              name="houseNumber"
              value={locationData.houseNumber}
              onChange={handleInputChange}
              placeholder={t('enterHouseNumber')}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-2 block">{t('areaName')}:</label>
            <input
              type="text"
              name="areaName"
              value={locationData.areaName}
              onChange={handleInputChange}
              placeholder={t('enterAreaName')}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={submitLocationData}
            disabled={isLoading}
            className="rounded-full bg-[#D746B7] px-6 py-3 text-white disabled:bg-gray-400"
          >
            {isLoading 
              ? (language === 'am' ? 'እየተላከ ነው...' : 'Loading...') 
              : (language === 'am' ? 'አረጋግጥ እና ቀጥል' : 'Verify and Continue')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationVerificationPage;
