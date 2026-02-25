import React from 'react';

const PlatformButton = ({ title, onPress, style, textStyle }) => {
  return (
    <button 
      onClick={onPress}
      style={{
        backgroundColor: '#007AFF',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        ...style
      }}
    >
      <span style={textStyle}>{title}</span>
    </button>
  );
};

export default PlatformButton;
