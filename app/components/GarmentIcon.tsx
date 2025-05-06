'use client';

import React from 'react';

type GarmentIconProps = {
  color?: string;
  className?: string;
};

export default function GarmentIcon({ color = '#a1a561', className = 'h-6 w-6' }: GarmentIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* T-shirt outline shape */}
      <path 
        d="M3 6.2C3 6.2 4.5 5 8 5H16C19.5 5 21 6.2 21 6.2L20 12H19L18 19H6L5 12H4L3 6.2Z" 
        fill={color} 
        stroke={color === '#FFFFFF' ? '#000000' : color} 
      />
      {/* Sleeve details */}
      <path 
        d="M8 5C8 5 8 3 12 3C16 3 16 5 16 5" 
        fill="none" 
        stroke={color === '#FFFFFF' ? '#000000' : color} 
      />
      {/* Collar */}
      <path 
        d="M10 3.5C10 3.5 11 5 12 5C13 5 14 3.5 14 3.5" 
        fill="none" 
        stroke={color === '#FFFFFF' ? '#000000' : color} 
      />
    </svg>
  );
}
