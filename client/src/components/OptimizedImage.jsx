import React from 'react';

const OptimizedImage = ({ 
  src, 
  webpSrc512, 
  webpSrc1024, 
  alt, 
  className = '', 
  sizes = '(max-width: 768px) 512px, 1024px',
  loading = 'lazy',
  ...props 
}) => {
  return (
    <picture>
      {/* WebP sources with responsive sizing */}
      <source
        media="(max-width: 768px)"
        srcSet={webpSrc512}
        type="image/webp"
      />
      <source
        media="(min-width: 769px)"
        srcSet={webpSrc1024}
        type="image/webp"
      />
      
      {/* Fallback PNG */}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        sizes={sizes}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
