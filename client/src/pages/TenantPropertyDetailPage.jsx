import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import Spinner from '@/components/ui/Spinner';
import { useLanguage } from '@/providers/LanguageProvider';
import BrokerBadge from '@/components/ui/BrokerBadge';
import PropertyReviews from '@/components/property/PropertyReviews';
import MessageButton from '@/components/ui/MessageButton';
import { useAuth } from '@/hooks';
import PropertyImageGallery from '@/components/property/PropertyImageGallery';
import { Heart, Share2, MapPin, Users, BedDouble, Bath, CalendarDays, Clock, HeartHandshake, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TenantPropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    const fetchPropertyAndSaveStatus = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const propertyDetailsPromise = axiosInstance.get(`/places/single-place/${id}`);
        const saveStatusPromise = axiosInstance.get(`/saved-properties/${id}/status`);

        const [propertyDetailsResponse, saveStatusResponse] = await Promise.all([
          propertyDetailsPromise,
          saveStatusPromise,
        ]);

        setProperty(propertyDetailsResponse.data);
        setIsSaved(saveStatusResponse.data.saved);

      } catch (err) {
        console.error('Error fetching property details or save status:', err);
        if (err.config.url.includes('/places/single-place/')) {
            const errorMessage = language === 'am' ? 'ንብረቱን ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Could not find the property. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } else {
            console.warn('Could not fetch save status for property');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyAndSaveStatus();
  }, [id, language, user]);

  useEffect(() => {
    let typewriterInterval;
    if (showSummaryModal && aiSummary && !isGeneratingSummary) {
      setDisplayedSummary('');
      let currentIndex = 0;
      typewriterInterval = setInterval(() => {
        if (currentIndex < aiSummary.length) {
          setDisplayedSummary((prev) => prev + aiSummary[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(typewriterInterval);
        }
      }, 30);
    }
    return () => clearInterval(typewriterInterval);
  }, [aiSummary, showSummaryModal, isGeneratingSummary]);

  const handleSaveProperty = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await axiosInstance.post('/saved-properties', { propertyId: id });
      setIsSaved(response.data.saved);
      if (response.data.saved) {
        toast.success(language === 'am' ? 'ንብረቱ በተሳካ ሁኔታ ተቀምጧል።' : 'Property saved!');
      } else {
        toast.info(language === 'am' ? 'ንብረቱ ከተቀመጡት ተወግዷል።' : 'Property unsaved.');
      }
    } catch (error) {
      console.error('Error saving/unsaving property:', error);
      toast.error(language === 'am' ? 'ንብረቱን ማስቀመጥ/ማስወገድ አልተቻለም።' : 'Could not update saved status. Please try again.');
    }
    finally {
      setIsSaving(false);
    }
  };

  const handleAiSummaryClick = async () => {
    if (!property || !user) return;
    setShowSummaryModal(true);
    setIsGeneratingSummary(true);
    setAiSummary('');

    // Simulate API call delay for now
    // await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. Collect Property Data (Example - to be expanded)
    const propertyName = property.property_name || (language === 'am' ? 'ያልታወቀ ስም' : 'Untitled Property');
    const locationString = property.location?.address || 
                         `${property.location?.sub_city || ''}${property.location?.sub_city && property.location?.woreda ? ', ' : ''}${property.location?.woreda || ''}` || 
                         (language === 'am' ? 'ያልታወቀ አካባቢ' : 'Unknown Location');
    const price = new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US').format(property.price || 0) + " ETB / " + (language === 'am' ? 'ወር' : 'per month');
    const description = property.description || (language === 'am' ? 'መግለጫ የለም' : 'No description provided.');
    const perksArray = property.perks || [];
    const perksString = perksArray.map(p => typeof p === 'object' ? (p.perk || p.name) : p).join(', ') || (language === 'am' ? 'ምንም አልተገለጸም' : 'None specified');
    const propertyType = property.property_type ? property.property_type.replace(/_/g, ' ') : (language === 'am' ? 'ያልተገለጸ ዓይነት' : 'Unspecified type');

    // 2. Construct the User Prompt for the AI
    const userPrompt = `Please provide a concise and appealing summary for the following rental property. Highlight its key features for a potential tenant:
    Name: ${propertyName}
    Type: ${propertyType}
    Location: ${locationString}
    Price: ${price}
    Bedrooms: ${property.bedrooms || 'N/A'}
    Bathrooms: ${property.bathrooms || 'N/A'}
    Max Occupants: ${property.max_guests || 'N/A'}
    Area: ${property.area_sq_ft ? `${property.area_sq_ft} sq ft` : 'N/A'}
    Amenities: ${perksString}
    Description: ${description}
    Focus on making it attractive to someone looking for a place to rent.`;

    // 3. Define the System Prompt with updated instructions
    const userName = user?.firstName || (language === 'am' ? 'ተጠቃሚ' : 'User'); 
    const aiSystemPrompt = `Selam ${userName} 👋, welcome to UrbanRent. You are a helpful assistant that summarizes property details for potential tenants. Provide a concise and attractive summary based on the information given. Highlight key features. Please use markdown for emphasis (e.g., bold important details like property name or price) and include a few relevant emojis in your response. Also, if reviews are provided in the user prompt, summarize them impartially, mentioning the overall sentiment and average rating if possible.`;

    // Call our backend to get the AI summary
    try {
      const response = await axiosInstance.post('/api/ai/generate-summary', {
        systemPrompt: aiSystemPrompt,
        userPrompt: userPrompt,
        propertyId: id
      });

      if (response.data && response.data.summary) {
        setAiSummary(response.data.summary);
      } else {
        throw new Error('Invalid response structure from backend for AI summary');
      }

    } catch (error) {
      console.error("Error fetching AI summary from backend:", error);
      const errorText = error.response?.data?.message || 
                        (language === 'am' ? 'የ AI ማጠቃለያ ማመንጨት አልተሳካም' : 'Failed to generate AI summary. Please try again.');
      setAiSummary(errorText);
      toast.error(errorText);
    }

    setIsGeneratingSummary(false);
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
          to="/browse"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {t('backToBrowse') || 'Back to Browse'}
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="mb-4 text-xl">{language === 'am' ? 'ንብረቱ አልተገኘም' : 'Property not found'}</div>
        <Link
          to="/browse"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          {t('backToBrowse') || 'Back to Browse'}
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
      typeof perk === 'object' ? (perk.perk || perk.name || '') : perk
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
    if (location.house_no) locationData.houseNo = {
      label: language === 'am' ? 'የቤት ቁጥር' : 'House No',
      value: location.house_no
    };
    
    return locationData;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* New Header Section */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {property.property_name || (language === 'am' ? 'ያልታወቀ ስም' : 'Untitled Property')}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-500" />
                <span>
                  {property.location?.address || 
                   `${property.location?.sub_city || ''}${property.location?.sub_city && property.location?.woreda ? ', ' : ''}${property.location?.woreda || ''}` || 
                   (language === 'am' ? 'ያልታወቀ አካባቢ' : 'Unknown Location')}
                </span>
              </div>
              {/* Moved Property Type Here */}
              {property.property_type && (
                <div className="mt-1">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 inline-block px-2.5 py-1 rounded-full">
                    {/* TODO: Map property_type to user-friendly name/translation */}
                    {property.property_type.replace(/_/g, ' ') || 'Unknown Type'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleSaveProperty}
                disabled={isSaving}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                  isSaving 
                    ? 'text-gray-400 bg-gray-100' 
                    : isSaved 
                      ? 'text-red-500 bg-red-100 hover:bg-red-200 focus:ring-red-500' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50 focus:ring-red-500'
                }`}
                title={isSaved ? (language === 'am' ? 'ንብረቱን ከተቀመጠበት አስወግድ' : 'Unsave Property') : (language === 'am' ? 'ንብረቱን አስቀምጥ' : 'Save Property')}
              >
                {isSaved ? <HeartHandshake size={22} /> : <Heart size={22} />}
              </button>
              <button
                onClick={() => { 
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(language === 'am' ? 'አገናኝ ተቀድቷል!' : 'Link copied to clipboard!');
                }}
                className="p-2 rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                title={language === 'am' ? 'አጋራ' : 'Share'}
              >
                <Share2 size={22} />
              </button>
              {/* AI Summary Button */}
              <button
                onClick={handleAiSummaryClick} 
                disabled={isGeneratingSummary}
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${isGeneratingSummary ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:ring-purple-500'}`}
                title={language === 'am' ? 'የ AI ማጠቃለያ' : 'AI Summary'}
              >
                <Sparkles size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Content Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-3">
          {/* Main Content (Gallery, Details) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Image Gallery */}
            <PropertyImageGallery photos={property.photos} propertyName={property.property_name} />

            {/* Property Description (Keep for now, will be moved into tabs later) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('description')}</h2>
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">{property.description || (language === 'am' ? 'መግለጫ የለም' : 'No description provided.')}</p>
            </div>

            {/* Amenities (Keep for now, will be redesigned and moved into tabs later) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('amenities') || 'Amenities'}</h2>
              {property.perks && property.perks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {property.perks.map((perk, index) => {
                    const perkName = typeof perk === 'object' ? (perk.perk || perk.name || 'Amenity') : perk;
                    return (
                      <div key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{perkName}</span>
                      </div>
                    );
                  })}
                </div>
                ) : (
                    <p className="text-gray-500">
                  {language === 'am' ? 'ምንም አገልግሎቶች አልተመዘገቡም' : 'No amenities registered for this property.'}
                    </p>
                )}
            </div>

            {/* Reviews (Keep for now, will be moved into tabs later) */}
            <div className="bg-white shadow rounded-lg p-6">
              <PropertyReviews propertyId={id} propertyStatus={property.status} />
            </div>
          </div>

          {/* Sidebar (existing structure, will be revamped in Phase 3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg bg-white p-6 shadow-lg space-y-6">
              {/* Price */}
              <div>
                <span className="block text-3xl font-bold text-green-600">
                  {new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US').format(property.price || 0)} ETB
                </span>
                <span className="text-sm text-gray-500">/{language === 'am' ? 'ወር' : 'per month'}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <MessageButton
                  propertyId={property.property_id}
                  ownerId={property.user_id} 
                  ownerName={property.owner_name || (language === 'am' ? 'ባለንብረት' : 'Property Owner')}
                  propertyStatus={property.status}
                  className="w-full !bg-green-600 hover:!bg-green-700 !text-white !py-3 !text-base !font-semibold"
                />
              </div>

              {/* Key Property Details in Sidebar (can be enhanced/moved later) */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quickDetails') || 'Quick Details'}</h3>
                <div className="space-y-4 text-base"> {/* Increased spacing and base text size */}
                  {/* Removed Property Type from here */}
                  
                  {/* Max Occupants - Restyled */}
                  {property.max_guests && (
                     <div className="flex items-center">
                       <Users className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                       <div className="flex justify-between w-full">
                         <span className="text-gray-600">{t('maxOccupantsDetail', { ns: 'common' }) || 'Max Occupants:'}</span>
                         <span className="font-semibold text-gray-900">{property.max_guests}</span>
                       </div>
                     </div>
                  )}
                  
                  {/* Bedrooms - Restyled */}
                   {property.bedrooms && (
                    <div className="flex items-center">
                      <BedDouble className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600">{t('bedroomsDetail', { ns: 'common' }) || 'Bedrooms:'}</span>
                        <span className="font-semibold text-gray-900">{property.bedrooms}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Bathrooms - Restyled */}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600">{t('bathroomsDetail', { ns: 'common' }) || 'Bathrooms:'}</span>
                        <span className="font-semibold text-gray-900">{property.bathrooms}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Added Created At */}
                  {property.createdAt && (
                    <div className="flex items-center">
                      <CalendarDays className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600">{t('listedOn', { ns: 'common' }) || 'Listed On:'}</span>
                        <span className="font-semibold text-gray-900" title={new Date(property.createdAt).toLocaleString()}>
                          {new Date(property.createdAt).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Added Updated At */}
                  {property.updatedAt && property.updatedAt !== property.createdAt && ( // Only show if different from createdAt
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600">{t('lastUpdated', { ns: 'common' }) || 'Last Updated:'}</span>
                        <span className="font-semibold text-gray-900" title={new Date(property.updatedAt).toLocaleString()}>
                          {new Date(property.updatedAt).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Area (Example - Restyled) */}
                  {property.area_sq_ft && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{property.area_sq_ft} {language === 'am' ? 'ካሬ ሜትር' : 'sq ft'}</span>
                    </div>
                  )}
                  {property.broker_id && property.brokerInfo && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <BrokerBadge brokerId={property.broker_id} brokerInfo={property.brokerInfo} showFull={true} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close summary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {language === 'am' ? 'የ AI ማጠቃለያ' : 'AI Property Summary'}
            </h3>
            {isGeneratingSummary ? (
              <div className="flex flex-col items-center justify-center min-h-[100px]">
                <Spinner />
                <p className="text-gray-600 mt-3">{language === 'am' ? 'ማጠቃለያ በመፍጠር ላይ...' : 'Generating summary...'}</p>
              </div>
            ) : (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto prose lg:prose-base">
                <ReactMarkdown>{displayedSummary}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPropertyDetailPage;
