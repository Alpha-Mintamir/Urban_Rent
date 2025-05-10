import React, { useEffect, useState } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import axiosInstance from '@/utils/axios';

import AccountNav from '@/components/ui/AccountNav';
import Perks from '@/components/ui/Perks';
import PhotosUploader from '@/components/ui/PhotosUploader';
import Spinner from '@/components/ui/Spinner';

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

const PlacesFormPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [redirect, setRedirect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [locationData, setLocationData] = useState(null);
  
  // Determine if we're in broker mode based on the URL path
  const isBrokerMode = location.pathname.startsWith('/broker');

  const [formData, setFormData] = useState({
    property_name: '',
    description: '',
    extra_info: '',
    max_guests: 4,
    price: 5000,
    perks: [],
  });

  const {
    property_name,
    description,
    extra_info,
    max_guests,
    price,
    perks,
  } = formData;

  const isValidPlaceData = () => {
    if (property_name.trim() === '') {
      toast.error("የንብረት ስም ባዶ መሆን አይችልም!");
      return false;
    } else if (addedPhotos.length < 5) {
      toast.error('ቢያንስ 5 ፎቶዎችን ይጫኑ! የቤቱን የተለያዩ ክፍሎች የሚያሳዩ ምስሎችን ያካትቱ።');
      return false;
    } else if (description.trim() === '') {
      toast.error("ማብራሪያ ባዶ መሆን አይችልም!");
      return false;
    } else if (max_guests < 1) {
      toast.error('ቢያንስ አንድ እንግዳ ያስፈልጋል!');
      return false;
    } else if (max_guests > 20) {
      toast.error("ከፍተኛው የእንግዶች ብዛት ከ 20 መብለጥ አይችልም");
      return false;
    } else if (price < 500) {
      toast.error("ዋጋው ከ 500 ብር በታች መሆን አይችልም");
      return false;
    }

    return true;
  };

  const handleFormData = (e) => {
    const { name, value, type } = e.target;
    // If the input is not a checkbox, update 'formData' directly
    if (type !== 'checkbox') {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // If type is checkbox (perks)
    if (type === 'checkbox') {
      const currentPerks = [...perks];
      let updatedPerks = [];

      // Check if the perk is already in perks array
      if (currentPerks.includes(name)) {
        updatedPerks = currentPerks.filter((perk) => perk !== name);
      } else {
        updatedPerks = [...currentPerks, name];
      }
      setFormData({ ...formData, perks: updatedPerks });
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    
    // Use the correct endpoint for Sequelize
    axiosInstance.get(`/places/single-place/${id}`)
      .then((response) => {
        console.log('Fetched place details:', response.data);
        const place = response.data; // Direct data object, not nested under 'place'
        
        // Update the state of formData
        setFormData({
          property_name: place.property_name || '',
          description: place.description || '',
          extra_info: place.extra_info || '',
          max_guests: place.max_guests || 4,
          price: place.price || 5000,
          perks: place.perks?.map(perk => perk.name) || [],
        });

        // Update photos state
        if (place.photos && Array.isArray(place.photos)) {
          // Handle different photo formats
          if (place.photos.length > 0) {
            if (typeof place.photos[0] === 'object' && place.photos[0].url) {
              // If photos are objects with url property
              setAddedPhotos(place.photos.map(photo => photo.url));
            } else if (typeof place.photos[0] === 'string') {
              // If photos are direct URLs
              setAddedPhotos(place.photos);
            }
          }
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching place details:', error);
        toast.error('ንብረቱን ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
        setLoading(false);
      });
  }, [id]);

  const preInput = (header, description) => {
    return (
      <>
        <h2 className="mt-4 text-2xl">{header}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </>
    );
  };

  const showPropertyConfirmation = (e) => {
    e.preventDefault();

    // Get the current user data
    const currentUser = getUserData();
    
    if (!currentUser || !currentUser.user_id) {
      toast.error('እባክዎ በመጀመሪያ ይገቡ። የተገቢ መረጃ አልተገኘም።');
      console.error('User not authenticated or user ID missing');
      return;
    }
    
    // Get location data from localStorage
    let storedLocationData = null;
    
    try {
      const storedData = localStorage.getItem('locationData');
      if (storedData) {
        storedLocationData = JSON.parse(storedData);
        setLocationData(storedLocationData);
        console.log('Retrieved location data from localStorage:', storedLocationData);
      } else {
        console.warn('No location data found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing location data from localStorage:', error);
    }
    
    // Check if location data is available
    if (!storedLocationData) {
      toast.error('የአካባቢ መረጃ አልተገኘም። እባክዎ መጀመሪያ የአካባቢ መረጃዎን ያረጋግጡ።');
      navigate('/account/verify-location');
      return;
    }
    
    // Validate form data
    if (!isValidPlaceData()) {
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  const savePlace = async () => {
    // Get the current user data
    const currentUser = getUserData();

    // Prepare data according to the Property model structure
    const propertyData = {
      property_name: property_name,
      description: description,
      extra_info: extra_info,
      max_guests: parseInt(max_guests),
      price: parseFloat(price),
      perks: perks,
      photos: addedPhotos,
      // Include user_id explicitly
      user_id: currentUser.user_id,
      // Include complete location data instead of just the ID
      location: locationData
    };

    console.log('Sending property data with user_id and location_id:', propertyData);
    
    try {
      setLoading(true);
      
      // Verify that all photos are valid Cloudinary URLs
      const validPhotos = addedPhotos.every(url => 
        url.includes('cloudinary.com') && 
        (url.includes('/Airbnb/Places/') || url.includes('/upload/'))
      );
      
      if (!validPhotos) {
        toast.error('አንዳንድ ፎቶዎች በትክክል አልተጫኑም። እባክዎ ሁሉንም ፎቶዎች እንደገና ይጫኑ።');
        setLoading(false);
        return;
      }
        
      if (id) {
        // update existing place
        const { data } = await axiosInstance.put('/places/update-place', {
          id,
          ...propertyData,
        });
        if (data) {
          toast.success('ንብረት በተሳካ ሁኔታ ተመዝግቧል!');
          setRedirect(isBrokerMode ? '/broker/places' : '/account/places');
        } else {
          toast.error('ንብረት ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
        }
      } else {
        // new place - send both property and location data together
        const { data } = await axiosInstance.post(
          '/places/add-places',
          propertyData,
        );
        toast.success('ንብረት በተሳካ ሁኔታ ተጨምሯል!');
        // Clear the location data from localStorage after successful submission
        localStorage.removeItem('locationData');
        setRedirect('/owner/dashboard');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      
      if (error.response) {
        // The server responded with an error status
        if (error.response.status === 400) {
          toast.error('የተላኩት መረጃዎች ትክክል አይደሉም። እባክዎ ያረጋግጡ እና እንደገና ይሞክሩ።');
        } else if (error.response.status === 500) {
          toast.error('አገልጋዩ ላይ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።');
        } else if (error.response.status === 403) {
          toast.error('ይህን ንብረት ለማዘመን ፈቃድ የለዎትም።');
        } else if (error.response.status === 404) {
          toast.error('ንብረቱ አልተገኘም።');
        } else {
          toast.error(`ስህተት ተፈጥሯል፦ ${error.response.status}`);
        }
        
        // Log the error details for debugging
        if (error.response.data) {
          console.error('Server error details:', error.response.data);
        }
      } else if (error.request) {
        // No response received from the server
        toast.error('አገልጋዩን ማግኘት አልተቻለም። እባክዎ ኔትወርክዎን ያረጋግጡ።');
      } else {
        // Error setting up the request
        toast.error('አስፈላጊው ጥያቄ በመላክ ላይ ችግር ተፈጥሯል።');
      }
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  if (loading) {
    return <Spinner />;
  }
  
  // Confirmation dialog
  if (showConfirmation) {
    return (
      <div className="p-4">
        <AccountNav />
        <div className="mx-auto max-w-4xl rounded-lg border border-gray-300 p-6 shadow-md">
          <h1 className="mb-6 text-center text-3xl font-bold">የንብረት መረጃ ማረጋገጣ</h1>
          
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">የቤት መረጃ</h2>
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
              <div>
                <p className="font-semibold">የቤት አይነት:</p>
                <p>{property_name}</p>
              </div>
              <div>
                <p className="font-semibold">የክፍያ ውለታ:</p>
                <p>{price} ብር</p>
              </div>
              <div>
                <p className="font-semibold">የእንግዶች ብዛት:</p>
                <p>{max_guests}</p>
              </div>
              <div>
                <p className="font-semibold">አገልግሎቶች:</p>
                <p>{perks.length > 0 ? perks.join(', ') : 'የተመረጠ የለም'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="font-semibold">ዝርዝር መግለጣ:</p>
                <p>{description}</p>
              </div>
              {extra_info && (
                <div className="col-span-1 md:col-span-2">
                  <p className="font-semibold">ተጨማሪ መረጃ:</p>
                  <p>{extra_info}</p>
                </div>
              )}
              <div className="col-span-1 md:col-span-2">
                <p className="font-semibold">ፍቶጋራፊዎች:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {addedPhotos.map((photo, index) => (
                    <img 
                      key={index} 
                      src={photo} 
                      alt="Property" 
                      className="h-24 w-24 rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">የአካባቢ መረጃ</h2>
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="font-semibold">ክፍለ ከተማ:</p>
                  <p>{locationData?.sub_city}</p>
                </div>
                <div>
                  <p className="font-semibold">ወረዳ:</p>
                  <p>{locationData?.woreda}</p>
                </div>
                <div>
                  <p className="font-semibold">ቀበለ:</p>
                  <p>{locationData?.kebele}</p>
                </div>
                <div>
                  <p className="font-semibold">የቤት ቁጥር:</p>
                  <p>{locationData?.house_no}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="font-semibold">የአካባቢ ስም:</p>
                  <p>{locationData?.area_name}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              አርም
            </button>
            <button
              onClick={savePlace}
              disabled={loading}
              className="rounded-full bg-[#D746B7] px-6 py-3 font-semibold text-white transition hover:bg-[#c13da3] disabled:bg-gray-400"
            >
              {loading ? 'እየተለከ ነው...' : 'አረጋግጥ እና አስቀምጥ'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <AccountNav />
      <h1 className="mb-8 text-center text-3xl font-bold">የቤት መረጃ</h1>
      <form onSubmit={showPropertyConfirmation} className="mx-auto max-w-4xl">
        {preInput(
          'የቤት አይነት',
          'ቤቱ ምን አይነት እንደሆነ በአጭሩ ይግለጹ (ለምሳሌ: ኮንዶሚኒየም, አፓርትመንት, ቪላ, ወዘተ.)',
        )}
        <input
          type="text"
          name="property_name"
          value={property_name}
          onChange={handleFormData}
          placeholder="የቤት አይነት"
          className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none"
        />

        {preInput('ምስሎች', 'የቤቱን ገጽታ የሚያሳዩ ምስሎችን ይጫኑ (ቢያንስ 5 ምስሎች - የውጭ እና የውስጥ ክፍሎችን ያካትቱ)')}
        <PhotosUploader
          addedPhotos={addedPhotos}
          setAddedPhotos={setAddedPhotos}
        />

        {preInput('ዝርዝር መግለጫ', 'ስለ ቤቱ ዝርዝር መግለጫ ያስገቡ (ስፋት, ቁጥር ክፍሎች, ወዘተ.)')}
        <textarea
          value={description}
          name="description"
          onChange={handleFormData}
          placeholder="ቤቱን በዝርዝር ይግለጹ..."
          className="min-h-[150px] w-full rounded-lg border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none"
        />

        {preInput('አገልግሎቶች', 'ቤቱ የሚያቀርባቸው አገልግሎቶች')}
        <Perks selected={perks} handleFormData={handleFormData} />

        {preInput('ተጨማሪ መረጃ', 'ለተከራዮች ማሳወቅ የሚፈልጉት ተጨማሪ መረጃ ካለ')}
        <textarea
          value={extra_info}
          name="extra_info"
          onChange={handleFormData}
          placeholder="ተጨማሪ መረጃ ወይም ልዩ መመሪያዎች..."
          className="min-h-[100px] w-full rounded-lg border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none"
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            {preInput('ከፍተኛ የእንግዶች ብዛት', 'ቤቱ ሊያስተናግድ የሚችለው ከፍተኛ የሰዎች ብዛት')}
            <input
              type="number"
              name="max_guests"
              value={max_guests}
              onChange={handleFormData}
              min="1"
              max="20"
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none"
            />
          </div>
          
          <div>
            {preInput('ወርሃዊ ዋጋ (ብር)', 'የቤቱ ወርሃዊ የኪራይ ዋጋ በኢትዮጵያ ብር')}
            <input
              type="number"
              name="price"
              value={price}
              onChange={handleFormData}
              min="500"
              className="w-full rounded-lg border border-gray-300 p-2 focus:border-[#D746B7] focus:outline-none"
            />
          </div>
        </div>
        
        <div className="mt-10 flex justify-center">
          <button 
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#D746B7] py-3 px-20 text-xl font-semibold text-white transition hover:bg-[#c13da3] disabled:bg-gray-400"
          >
            {loading ? 'እየተላከ ነው...' : id ? 'አዘምን' : 'አስቀምጥ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlacesFormPage;
