'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/outline';

type DressingRoomProps = {
  product: any; // Product details
  onClose: () => void;
}

// Define try-on item type
type TryOnItem = {
  productId: number;
  productName: string;
  timestamp: string;
  status: 'pending' | 'ready';
  imageUrl?: string;
};

export default function DressingRoom({ product, onClose }: DressingRoomProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurtains, setShowCurtains] = useState(false);
  const [curtainsClosed, setCurtainsClosed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Load saved image from local storage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userDressingRoomImage');
    if (savedImage) {
      setUploadedImage(savedImage);
    }
    
    // Check if this is the first visit to dressing room
    const hasVisitedDressingRoom = localStorage.getItem('hasVisitedDressingRoom');
    if (hasVisitedDressingRoom) {
      setIsFirstVisit(false);
    } else {
      // Show tooltip on first visit
      setShowTooltip(true);
      // Set flag in local storage to remember the user has visited
      localStorage.setItem('hasVisitedDressingRoom', 'true');
      
      // Auto-hide tooltip after 5 seconds
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      
      setTooltipTimeout(timer);
      return () => clearTimeout(timer);
    }
  }, []);

  // Add click outside handler to close tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout);
          setTooltipTimeout(null);
        }
      }
    };

    // Add event listener when tooltip is shown
    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip, tooltipTimeout]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Save to local storage
        localStorage.setItem('userDressingRoomImage', base64String);
        setUploadedImage(base64String);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle long press on photo icon
  const handlePhotoIconTouchStart = () => {
    // Clear any existing timeout
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    
    // Set a timeout to detect long press (500ms)
    const timer = setTimeout(() => {
      setShowTooltip(true);
      
      // Auto-hide tooltip after 3 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      
      setTooltipTimeout(hideTimer);
    }, 500);
    
    setTooltipTimeout(timer);
  };
  
  // Clear timeout if touch ends before long press threshold
  const handlePhotoIconTouchEnd = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
  };

  // Function to add try-on item to localStorage
  const addTryOnItem = () => {
    // Create new try-on item
    const newTryOnItem: TryOnItem = {
      productId: product.id,
      productName: product.name,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Get existing try-on items from localStorage
    let tryOnItems: TryOnItem[] = [];
    const existingTryOnItems = localStorage.getItem('tryOnItems');
    
    if (existingTryOnItems) {
      try {
        tryOnItems = JSON.parse(existingTryOnItems);
        
        // Filter out old items (older than 24 hours)
        const now = new Date();
        tryOnItems = tryOnItems.filter(item => {
          const timestamp = new Date(item.timestamp);
          const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          return hoursSinceCreated < 24;
        });
        
        // Remove existing item for the same product if present
        tryOnItems = tryOnItems.filter(item => item.productId !== product.id);
      } catch (e) {
        console.error('Error parsing tryOnItems:', e);
        tryOnItems = [];
      }
    }
    
    // Add new item to the array
    tryOnItems.push(newTryOnItem);
    
    // Save updated array back to localStorage
    localStorage.setItem('tryOnItems', JSON.stringify(tryOnItems));
  };

  // Go to dressing room with animation - updated to handle multiple try-on items
  const goToDressingRoom = () => {
    // Show curtains in initial open state
    setShowCurtains(true);
    setCurtainsClosed(false);
    
    // After a small delay, close the curtains
    setTimeout(() => {
      setCurtainsClosed(true);
      
      // After curtains close, show the message
      setTimeout(() => {
        setShowMessage(true);
        
        // Add try-on item to localStorage
        addTryOnItem();
        
        // Auto close after a few seconds
        setTimeout(() => {
          onClose();
        }, 4000);
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="relative py-4 px-6 border-b">
        <h1 className="text-xl font-bold text-center">Try Before You Buy</h1>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 flex flex-col">
        {/* Model image container */}
        <div className="relative w-full aspect-[3/4] bg-gray-100 mb-6">
          {/* Default or uploaded image */}
          <div className="relative w-full h-full overflow-hidden">
            <Image 
              src={uploadedImage || '/lena.jpeg'} 
              alt="Model" 
              fill
              className="object-cover"
              priority
            />
            
            {/* Curtain animation - with message bubble */}
            {showCurtains && (
              <div className="absolute inset-0 flex">
                <div 
                  className={`w-1/2 h-full bg-red-900 transform transition-all duration-1500 ${
                    curtainsClosed ? 'translate-x-0' : '-translate-x-full'
                  }`}
                  style={{ 
                    backgroundImage: 'linear-gradient(to right, #8B0000, #5A0000)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)' 
                  }}
                ></div>
                <div 
                  className={`w-1/2 h-full bg-red-900 transform transition-all duration-1500 ${
                    curtainsClosed ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  style={{ 
                    backgroundImage: 'linear-gradient(to left, #8B0000, #5A0000)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)' 
                  }}
                ></div>
                
                {/* Message bubble on curtain */}
                {showMessage && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 animate-fade-in">
                    <div className="bg-white rounded-xl p-6 shadow-lg max-w-xs text-center">
                      <h3 className="font-bold text-lg mb-2">Processing Your Image</h3>
                      <p className="text-gray-700">
                        Your stylized image is being prepared and will be ready shortly.
                      </p>
                      <p className="text-gray-600 text-sm mt-3">
                        Feel free to continue browsing the collection.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Upload overlay with speech bubble tooltip */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="relative">
              <button 
                onClick={triggerFileUpload}
                onTouchStart={handlePhotoIconTouchStart}
                onTouchEnd={handlePhotoIconTouchEnd}
                onMouseDown={handlePhotoIconTouchStart}
                onMouseUp={handlePhotoIconTouchEnd}
                onMouseLeave={handlePhotoIconTouchEnd}
                className="p-3 bg-[#a1a561] text-white rounded-full shadow-lg"
              >
                <CameraIcon className="h-6 w-6" />
              </button>
              
              {/* Speech bubble tooltip with animation */}
              {showTooltip && (
                <div 
                  ref={tooltipRef}
                  className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-[#a1a561] text-white rounded-lg shadow-lg transform origin-bottom-right transition-all duration-300"
                  style={{
                    animation: 'fadeIn 0.3s ease-out, scaleIn 0.3s ease-out',
                  }}
                >
                  <div className="relative">
                    <h3 className="font-medium text-base mb-1">Personalize Your Experience</h3>
                    <p className="text-sm mb-2">
                      {uploadedImage 
                        ? "You're using your own photo. Want to try a different one?" 
                        : "See how this would look on you! Upload your photo for a more personalized experience."}
                    </p>
                    <button 
                      onClick={triggerFileUpload}
                      className="flex items-center justify-center w-full py-2 px-3 border border-white/30 rounded-md text-sm hover:bg-white/10 transition"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      {uploadedImage ? "Change Photo" : "Upload Your Photo"}
                    </button>
                    <p className="text-xs text-gray-300 mt-2">
                      Hold this button to see this tip again
                    </p>
                    {/* Triangle pointer */}
                    <div className="absolute bottom-[-12px] right-3 w-0 h-0 border-l-[6px] border-l-transparent border-t-[12px] border-t-[#a1a561] border-r-[6px] border-r-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Hidden file input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        {/* Dressing room button - Make sure it's not obscured */}
        <div className="mb-10">
          <button 
            onClick={goToDressingRoom}
            className="w-full py-4 bg-[#a1a561] text-white rounded-md font-medium relative overflow-hidden group"
          >
            <span className="relative z-10">To The Dressing Room</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#b1b571] to-[#91954f] 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        {/* Product images */}
        <h2 className="font-medium mb-3">Selected Item</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {product.images && product.images.slice(0, 2).map((image: string, index: number) => (
            <div key={index} className="aspect-[3/4] bg-gray-100 relative">
              <Image 
                src={image} 
                alt={`${product.name} view ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
