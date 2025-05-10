import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';

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

const IdentityVerificationPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const [step, setStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    kifleKetema: '',
    wereda: '',
    kebele: '',
    houseNumber: '',
    areaName: '',
    nationalId: null,
    livePhoto: null,
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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
    if (!verificationData.kifleKetema) {
      setWoredas([]);
      return;
    }
    
    // Immediately set fallback data for better UX
    if (FALLBACK_WOREDAS[verificationData.kifleKetema]) {
      setWoredas(FALLBACK_WOREDAS[verificationData.kifleKetema]);
    }
    
    const fetchWoredas = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/locations/sub-city/${encodeURIComponent(verificationData.kifleKetema)}/woredas`);
        console.log('Woredas response:', response.data);
        if (response.data && response.data.success) {
          // Make sure we're using the correct property from the API response
          const woredasData = response.data.woredas || [];
          if (woredasData.length > 0) {
            setWoredas(woredasData);
          } else {
            // If API returns empty array, use fallback data
            setWoredas(FALLBACK_WOREDAS[verificationData.kifleKetema] || []);
          }
        } else {
          // If API response is not successful, use fallback data
          setWoredas(FALLBACK_WOREDAS[verificationData.kifleKetema] || []);
        }
      } catch (error) {
        console.error('Error fetching woredas:', error);
        // Use fallback data on error
        setWoredas(FALLBACK_WOREDAS[verificationData.kifleKetema] || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWoredas();
  }, [verificationData.kifleKetema]);

  // Update kebeles when woreda changes
  useEffect(() => {
    if (!verificationData.kifleKetema || !verificationData.wereda) {
      setKebeles([]);
      return;
    }
    
    // Immediately set fallback data for better UX
    setKebeles(
      FALLBACK_KEBELES[verificationData.kifleKetema]?.[verificationData.wereda] || []
    );
    
    const fetchKebeles = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/locations/sub-city/${encodeURIComponent(verificationData.kifleKetema)}/woreda/${encodeURIComponent(verificationData.wereda)}/kebeles`
        );
        console.log('Kebeles response:', response.data);
        if (response.data && response.data.success) {
          // Make sure we're using the correct property from the API response
          const kebelesData = response.data.kebeles || [];
          if (kebelesData.length > 0) {
            setKebeles(kebelesData);
          } else {
            // If API returns empty array, use fallback data
            setKebeles(FALLBACK_KEBELES[verificationData.kifleKetema]?.[verificationData.wereda] || []);
          }
        } else {
          // If API response is not successful, use fallback data
          setKebeles(FALLBACK_KEBELES[verificationData.kifleKetema]?.[verificationData.wereda] || []);
        }
      } catch (error) {
        console.error('Error fetching kebeles:', error);
        // Use fallback data on error
        setKebeles(FALLBACK_KEBELES[verificationData.kifleKetema]?.[verificationData.wereda] || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKebeles();
  }, [verificationData.kifleKetema, verificationData.wereda]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('ይቅርታ፣ ካሜራ በዚህ መሳሪያ አይደገፍም');
        return;
      }

      // First try to get all video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );

      // Find front camera if it exists
      const frontCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes('front') ||
          device.label.toLowerCase().includes('user') ||
          device.label.toLowerCase().includes('selfie'),
      );

      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          deviceId: frontCamera ? { exact: frontCamera.deviceId } : undefined,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error('Video play error:', err);
            toast.error('ቪዲዮ ማጫወት አልተቻለም');
          });
        };
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      toast.error('ካሜራ መክፈት አልተቻለም። እባክዎ ካሜራ እንዲጠቀሙ ፈቃድ ይስጡ።');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOpen(false);
    }
  };

  const takeLivePhoto = () => {
    if (videoRef.current && photoRef.current) {
      const context = photoRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const photo = photoRef.current.toDataURL('image/jpeg');
      setVerificationData((prev) => ({
        ...prev,
        livePhoto: photo,
      }));
      stopCamera();
      setStep(4); // Move to next step after taking photo
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!verificationData.kifleKetema) {
        toast.error('እባክዎ ክፍለ ከተማ ይምረጡ');
        return;
      }
      if (!verificationData.wereda) {
        toast.error('እባክዎ ወረዳ ይምረጡ');
        return;
      }
      if (!verificationData.kebele) {
        toast.error('እባክዎ ቀበሌ ይምረጡ');
        return;
      }
      if (!verificationData.houseNumber) {
        toast.error('እባክዎ የቤት ቁጥር ያስገቡ');
        return;
      }
      if (!verificationData.areaName) {
        toast.error('እባክዎ የአካባቢ ስም ያስገቡ');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const submitLocationData = async () => {
    try {
      setIsLoading(true);
      const locationData = {
        sub_city: verificationData.kifleKetema,
        woreda: verificationData.wereda,
        kebele: verificationData.kebele,
        house_no: verificationData.houseNumber,
        area_name: verificationData.areaName
      };
      
      const { data } = await axiosInstance.post('/locations', locationData);
      
      if (data.success) {
        toast.success('የአካባቢ መረጃ በተሳካ ሁኔታ ተልኳል!');
        navigate('/account/places/new');
      } else {
        toast.error('የአካባቢ መረጃ መላክ አልተቻለም');
      }
    } catch (error) {
      console.error('Error submitting location data:', error);
      toast.error('የአካባቢ መረጃ መላክ አልተቻለም');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-2 block">ክፍለ ከተማ:</label>
              <select
                name="kifleKetema"
                value={verificationData.kifleKetema}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2"
                disabled={isLoading}
              >
                <option value="">ይምረጡ</option>
                {subCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">ወረዳ:</label>
              <select
                name="wereda"
                value={verificationData.wereda}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2"
                disabled={!verificationData.kifleKetema || isLoading}
              >
                <option value="">ይምረጡ</option>
                {woredas.map((woreda) => (
                  <option key={woreda} value={woreda}>
                    {woreda}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">ቀበሌ:</label>
              <select
                name="kebele"
                value={verificationData.kebele}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 p-2"
                disabled={!verificationData.wereda || isLoading}
              >
                <option value="">ይምረጡ</option>
                {kebeles.map((kebele) => (
                  <option key={kebele} value={kebele}>
                    {kebele}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">የቤት ቁጥር:</label>
              <input
                type="text"
                name="houseNumber"
                value={verificationData.houseNumber}
                onChange={handleInputChange}
                placeholder="የቤት ቁጥር ያስገቡ"
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-2 block">የአካባቢ ስም:</label>
              <input
                type="text"
                name="areaName"
                value={verificationData.areaName}
                onChange={handleInputChange}
                placeholder="የአካባቢ ስም ያስገቡ"
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xl">መታወቂያ ፎቶ</h3>
            <div className="mb-4 w-full">
              <label className="mb-2 block">መታወቂያ ፎቶ ይስቀሉ:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setVerificationData((prev) => ({
                        ...prev,
                        nationalId: reader.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            {verificationData.nationalId && (
              <div className="mb-4">
                <img
                  src={verificationData.nationalId}
                  alt="National ID"
                  className="h-48 w-auto rounded-md object-cover"
                />
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xl">የፊት ፎቶ</h3>
            <div className="mb-4 w-full">
              {isCameraOpen ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="h-[480px] w-[640px] rounded-md"
                    autoPlay
                    playsInline
                    muted
                  />
                  <button
                    onClick={takeLivePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-[#D746B7] px-6 py-2 text-white"
                  >
                    ፎቶ ያንሱ
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-4 h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <button
                    onClick={startCamera}
                    className="rounded-full bg-[#D746B7] px-6 py-3 text-white"
                  >
                    ካሜራ ክፈት
                  </button>
                </div>
              )}
              <canvas
                ref={photoRef}
                style={{ display: 'none' }}
                width="640"
                height="480"
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-500">
              እባክዎ ግልፅ የሆነ የፊት ፎቶ ያንሱ
            </p>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-xl">ማረጋገጫ</h3>
            <p className="mb-4 text-center">ሁሉም መረጃዎች በትክክል መሞላታቸውን ያረጋግጡ</p>
            
            <div className="mb-6 w-full rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold">የአካባቢ መረጃ:</h4>
              <p><span className="font-medium">ክፍለ ከተማ:</span> {verificationData.kifleKetema}</p>
              <p><span className="font-medium">ወረዳ:</span> {verificationData.wereda}</p>
              <p><span className="font-medium">ቀበሌ:</span> {verificationData.kebele}</p>
              <p><span className="font-medium">የቤት ቁጥር:</span> {verificationData.houseNumber}</p>
              <p><span className="font-medium">የአካባቢ ስም:</span> {verificationData.areaName}</p>
            </div>
            
            <div className="mb-6 flex w-full gap-4">
              <div className="w-1/2">
                <h4 className="mb-2 font-semibold">መታወቂያ ፎቶ:</h4>
                {verificationData.nationalId ? (
                  <img 
                    src={verificationData.nationalId} 
                    alt="National ID" 
                    className="h-40 w-full rounded-md object-cover"
                  />
                ) : (
                  <p className="text-red-500">መታወቂያ ፎቶ አልተሰቀለም</p>
                )}
              </div>
              <div className="w-1/2">
                <h4 className="mb-2 font-semibold">የፊት ፎቶ:</h4>
                {verificationData.livePhoto ? (
                  <img 
                    src={verificationData.livePhoto} 
                    alt="Live Photo" 
                    className="h-40 w-full rounded-md object-cover"
                  />
                ) : (
                  <p className="text-red-500">የፊት ፎቶ አልተነሳም</p>
                )}
              </div>
            </div>
            
            <button
              onClick={submitLocationData}
              disabled={isLoading}
              className="rounded-full bg-[#D746B7] px-6 py-3 text-white disabled:bg-gray-400"
            >
              {isLoading ? 'እየተላከ ነው...' : 'አረጋግጥ እና ቀጥል'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-4 flex grow items-center justify-around">
      <div className="mb-64 w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl">መረጃ ማረጋገጫ</h1>

        {/* Progress indicator */}
        <div className="mb-8 flex justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= stepNumber ? 'bg-[#D746B7] text-white' : 'bg-gray-200'
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrevStep}
              className="rounded-full bg-gray-500 px-6 py-2 text-white"
              disabled={isLoading}
            >
              ተመለስ
            </button>
          )}

          {/* Show Next button for steps 1-3 */}
          {step < 4 && (
            <button
              onClick={handleNextStep}
              className="ml-auto rounded-full bg-[#D746B7] px-6 py-2 text-white"
              disabled={isLoading}
            >
              ቀጥል
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentityVerificationPage;
