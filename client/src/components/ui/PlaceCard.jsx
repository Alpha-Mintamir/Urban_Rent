import React from 'react';
import { Link } from 'react-router-dom';
import BrokerBadge from './BrokerBadge';
import { useLanguage } from '@/providers/LanguageProvider';
import { MapPin, BedDouble, Bath } from 'lucide-react';

const PlaceCard = ({ place, isTenantView = false }) => {
  const { _id: placeId, photos, address, title, price, is_broker_listing, property_type, bedrooms, bathrooms, createdAt, status } = place;
  const { language, t } = useLanguage();
  
  const linkPath = isTenantView ? `/property/${placeId}` : `/account/places/${placeId}`; // Corrected owner link path

  // Default to an empty array if photos is null or undefined
  const photoList = photos || [];
  
  // Determine status display
  const isRented = status === 'rented';
  const statusClass = isRented ? 'bg-amber-500' : 'bg-green-500';
  const statusText = isRented ? (language === 'am' ? 'ተከራይቷል' : 'Rented Out') : (language === 'am' ? 'ይገኛል' : 'Available');
  
  return (
    <Link to={linkPath} className="block group h-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg">
      <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden flex flex-col h-full border border-gray-200">
        {/* Image Section */}
        <div className="relative w-full h-56">
          {photoList.length > 0 && photoList[0] ? (
            <img 
              src={photoList[0]} 
              alt={title || 'Property image'} 
              className="absolute inset-0 w-full h-full object-cover" 
              onError={(e) => { e.target.style.display = 'none'; /* Hide img on error */ }}
            />
          ) : null /* Render nothing if no image and let placeholder below show */}
          
          {/* Fallback / Placeholder if image failed or no image */}
          {(!photoList.length || !photoList[0]) && (
            <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.158 0a.225.225 0 01.225-.225h.008a.225.225 0 01.225.225v.008a.225.225 0 01-.225.225h-.008a.225.225 0 01-.225-.225V8.25z"></path>
              </svg>
            </div>
          )}

          {is_broker_listing && (
            <div className="absolute top-3 right-3 z-10">
               <BrokerBadge size="sm" />
            </div>
          )}
          
          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`text-xs px-2 py-1 rounded-full text-white ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h2 
            className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200 line-clamp-2" 
            title={title}
            style={{ minHeight: '2.5em' }} // Ensure space for 2 lines
          >
            {title || (language === 'am' ? 'ያልታወቀ ስም' : 'Untitled Property')}
          </h2>
          <p className="text-sm text-gray-500 truncate mt-1 mb-2" title={address}>
            <MapPin className="inline-block w-4 h-4 mr-1 align-text-bottom"/>
            {address || (language === 'am' ? 'ያልታወቀ አካባቢ' : 'Unknown Location')}
          </p>
          
          {/* Display Property Type if available */}
          {property_type && (
            <p className="text-xs text-gray-600 bg-gray-100 inline-block px-2 py-0.5 rounded-full mb-3">
              {/* TODO: Map property_type to user-friendly name/translation */}
              {property_type.replace(/_/g, ' ') || 'Unknown Type'}
            </p>
          )}

          {/* Property Details Icons (Beds, Baths) */}
          {(bedrooms || bathrooms) && (
            <div className="flex items-center space-x-3 text-sm text-gray-700 my-2">
              {bedrooms && (
                <span className="flex items-center" title={`${bedrooms} Bedrooms`}>
                  <BedDouble className="w-4 h-4 mr-1 text-gray-500" />
                  {bedrooms}
                </span>
              )}
              {bathrooms && (
                <span className="flex items-center" title={`${bathrooms} Bathrooms`}>
                  <Bath className="w-4 h-4 mr-1 text-gray-500" />
                  {bathrooms}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-2 flex justify-between items-center"> {/* Pushes price/date to the bottom & aligns */} 
            <p className="text-xl font-extrabold text-green-700">
              {new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price || 0)}
              <span className="text-sm font-semibold text-gray-700"> {language === 'am' ? 'ብር/ወር' : 'ETB/month'}</span>
            </p>
            {createdAt && (
              <span className="text-xs text-gray-500" title={`Listed on ${new Date(createdAt).toLocaleString()}`}>
                {new Date(createdAt).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlaceCard;
