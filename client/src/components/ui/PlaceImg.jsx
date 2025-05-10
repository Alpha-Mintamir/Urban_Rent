import React from 'react';

const PlaceImg = ({ place, index = 0, className = null }) => {
  if (!className) {
    className = 'object-cover w-full h-full';
  }
  
  // Helper function to get the correct image URL
  const getImageUrl = (photoData) => {
    // Handle string (direct URL or path)
    if (typeof photoData === 'string') {
      return photoData.startsWith('http') 
        ? photoData 
        : `${import.meta.env.VITE_BASE_URL}${photoData}`;
    }
    
    // Handle object with url or photo_url property
    if (photoData && typeof photoData === 'object') {
      const url = photoData.url || photoData.photo_url || '';
      return url.startsWith('http') 
        ? url 
        : `${import.meta.env.VITE_BASE_URL}${url}`;
    }
    
    return '';
  };
  
  // Handle different photo data structures
  if (place.photos && Array.isArray(place.photos) && place.photos.length > index) {
    const photoData = place.photos[index];
    const imageUrl = getImageUrl(photoData);
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={place.property_name || 'Property'} 
          className={className}
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = '/placeholder-house.png'; // Fallback image
          }}
        />
      );
    }
  }
  
  // Fallback to placeholder image if no photos are available
  return (
    <div className={`${className} bg-gray-300 flex items-center justify-center`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    </div>
  );
};

export default PlaceImg;
