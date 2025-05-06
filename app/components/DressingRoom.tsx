'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, ArrowUpTrayIcon, CameraIcon } from '@heroicons/react/24/outline';

type DressingRoomProps = {
  product: any; // Product details
  onClose: () => void;
}

export default function DressingRoom({ product, onClose }: DressingRoomProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurtains, setShowCurtains] = useState(false);
  const [curtainsOpening, setCurtainsOpening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load saved image from local storage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem('userDressingRoomImage');
    if (savedImage) {
      setUploadedImage(savedImage);
    }
  }, []);

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

  // Go to dressing room with animation
  const goToDressingRoom = () => {
    setShowCurtains(true);
    
    // After curtains close, wait and then open them
    setTimeout(() => {
      setCurtainsOpening(true);
      
      // Reset curtain state after animation completes
      setTimeout(() => {
        setShowCurtains(false);
        setCurtainsOpening(false);
      }, 2000);
    }, 1500);
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
            
            {/* Curtain animation */}
            {showCurtains && (
              <div className="absolute inset-0 flex">
                <div 
                  className={`w-1/2 h-full bg-red-900 transform transition-all duration-1500 ${
                    curtainsOpening ? '-translate-x-full' : 'translate-x-0'
                  }`}
                  style={{ 
                    backgroundImage: 'linear-gradient(to right, #8B0000, #5A0000)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)' 
                  }}
                ></div>
                <div 
                  className={`w-1/2 h-full bg-red-900 transform transition-all duration-1500 ${
                    curtainsOpening ? 'translate-x-full' : 'translate-x-0'
                  }`}
                  style={{ 
                    backgroundImage: 'linear-gradient(to left, #8B0000, #5A0000)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 0.2, 1)' 
                  }}
                ></div>
              </div>
            )}
          </div>
          
          {/* Upload overlay */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              onClick={triggerFileUpload}
              className="p-3 bg-black text-white rounded-full shadow-lg"
            >
              <CameraIcon className="h-6 w-6" />
            </button>
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
        
        {/* Upload prompt */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="font-medium mb-2">Personalize Your Experience</h2>
          <p className="text-gray-600 mb-4">
            {uploadedImage ? 
              "You're using your own photo. Want to try a different one?" : 
              "See how this would look on you! Upload your photo for a more personalized experience."}
          </p>
          <button 
            onClick={triggerFileUpload}
            className="flex items-center justify-center w-full py-3 border border-black rounded-md"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            {uploadedImage ? "Change Photo" : "Upload Your Photo"}
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
        
        {/* Dressing room button */}
        <button 
          onClick={goToDressingRoom}
          className="mt-auto py-4 bg-black text-white rounded-md font-medium relative overflow-hidden group"
        >
          <span className="relative z-10">To The Dressing Room</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
}
