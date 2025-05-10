import React from 'react';

const Image = ({ src, ...rest }) => {
  // If the src is a full URL (Cloudinary), use it as is
  // Otherwise, prepend the API base URL for local paths
  const imageUrl = src?.startsWith('http') 
    ? src 
    : `${import.meta.env.VITE_BASE_URL}${src}`;

  return <img src={imageUrl} {...rest} alt={''} className="rounded-xl" />;
};

export default Image;
