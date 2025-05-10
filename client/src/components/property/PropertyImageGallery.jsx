import React, { useState, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'; // Using lucide-react for icons

// Optional: Lightbox plugins
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";


const IconWrapper = ({ children, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={`absolute p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200 focus:outline-none ${className}`}
  >
    {children}
  </button>
);

const PropertyImageGallery = ({ photos = [], propertyName = 'Property' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [processedPhotos, setProcessedPhotos] = useState([]);

  useEffect(() => {
    const newProcessedPhotos = photos.map(photo => {
      const photoUrl = typeof photo === 'string' 
        ? photo 
        : photo.url || photo.photo_url || '';
      
      return {
        src: photoUrl.startsWith('http') 
          ? photoUrl 
          : `${import.meta.env.VITE_BASE_URL}${photoUrl}`,
        alt: `${propertyName} - Image ${photos.indexOf(photo) + 1}`,
        title: `${propertyName} - Image ${photos.indexOf(photo) + 1}` // For captions
      };
    }).filter(p => p.src); // Ensure we only keep photos with valid src

    setProcessedPhotos(newProcessedPhotos);
    setCurrentIndex(0); // Reset index when photos change
  }, [photos, propertyName]);

  if (!processedPhotos || processedPhotos.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
        No images available
      </div>
    );
  }

  const mainImage = processedPhotos[currentIndex];

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };
  
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % processedPhotos.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + processedPhotos.length) % processedPhotos.length);
  };

  return (
    <div className="relative">
      {/* Main Image Display */}
      <div 
        className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-300 rounded-lg overflow-hidden group cursor-pointer"
        onClick={() => openLightbox(currentIndex)}
      >
        {mainImage?.src ? (
          <img
            src={mainImage.src}
            alt={mainImage.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = '/placeholder-house.png'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">Image not available</div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Expand size={48} className="text-white" />
        </div>
         {/* Navigation Buttons for Main Image (optional, if not relying on thumbnails solely) */}
        {processedPhotos.length > 1 && (
          <>
            <IconWrapper onClick={(e) => { e.stopPropagation(); prevImage(); }} className="top-1/2 -translate-y-1/2 left-3">
              <ChevronLeft size={24} />
            </IconWrapper>
            <IconWrapper onClick={(e) => { e.stopPropagation(); nextImage(); }} className="top-1/2 -translate-y-1/2 right-3">
              <ChevronRight size={24} />
            </IconWrapper>
          </>
        )}
      </div>

      {/* Thumbnails - Show max 5, scrollable if more */}
      {processedPhotos.length > 1 && (
        <div className="mt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {processedPhotos.map((photo, index) => (
              <div
                key={index}
                className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 
                            ${index === currentIndex ? 'border-green-500 scale-105' : 'border-transparent hover:border-gray-400'} 
                            transition-all duration-200`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={processedPhotos}
          index={currentIndex}
          on={{ view: ({ index: currIndex }) => setCurrentIndex(currIndex) }}
          plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom]}
          // Custom icons for lightbox if desired (optional)
          // render={{
          //   buttonPrev: () => <ChevronLeft size={32} />,
          //   buttonNext: () => <ChevronRight size={32} />,
          //   buttonClose: () => <X size={32} />,
          // }}
        />
      )}
    </div>
  );
};

export default PropertyImageGallery; 