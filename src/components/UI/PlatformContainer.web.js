import React from 'react';

/**
 * PlatformContainer for Web
 * Uses standard div for maximum browser performance and SEO
 */
const PlatformContainer = ({ children, style, className }) => {
  return (
    <div 
      className={className} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default PlatformContainer;
