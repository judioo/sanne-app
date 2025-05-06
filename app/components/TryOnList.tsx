'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

type TryOnItem = {
  productId: number;
  productName: string;
  timestamp: string;
  status: 'pending' | 'ready';
  imageUrl?: string; // For ready items
};

type TryOnListProps = {
  onClose: () => void;
};

export default function TryOnList({ onClose }: TryOnListProps) {
  const [tryOnItems, setTryOnItems] = useState<TryOnItem[]>([]);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  // Load try-on items from localStorage
  useEffect(() => {
    // For this implementation, we'll use the pendingTryOn item and also simulate a "ready" item
    const pendingTryOn = localStorage.getItem('pendingTryOn');
    const tryOnItems: TryOnItem[] = [];
    
    if (pendingTryOn) {
      try {
        const parsedItem = JSON.parse(pendingTryOn);
        const timestamp = new Date(parsedItem.timestamp);
        const now = new Date();
        const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        // Only add if less than 24 hours old
        if (hoursSinceCreated < 24) {
          // If more than 1 minute old, mark as ready (for demo purposes)
          // In a real app, this would be determined by a server response
          const minutesSinceCreated = hoursSinceCreated * 60;
          const status = minutesSinceCreated > 1 ? 'ready' : 'pending';
          
          tryOnItems.push({
            productId: parsedItem.productId,
            productName: parsedItem.productName,
            timestamp: parsedItem.timestamp,
            status,
            // For demo purposes, use the first product image as the "processed" image
            imageUrl: status === 'ready' ? '/lena-with-clothes.jpeg' : undefined
          });
        } else {
          // Remove old items
          localStorage.removeItem('pendingTryOn');
        }
      } catch (e) {
        console.error('Error parsing pendingTryOn data:', e);
      }
    }
    
    setTryOnItems(tryOnItems);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Navigate to product page
  const navigateToProduct = (productId: number) => {
    router.push(`/product/${productId}`);
    onClose();
  };

  // Clear a try-on item
  const clearItem = (productId: number) => {
    localStorage.removeItem('pendingTryOn');
    setTryOnItems(tryOnItems.filter(item => item.productId !== productId));
  };

  if (tryOnItems.length === 0) {
    return (
      <div 
        ref={listRef}
        className="absolute top-12 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in"
      >
        <div className="p-4 text-center text-gray-500">
          <p>No try-on items</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      className="absolute top-12 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in"
    >
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-medium">Your Try-On Items</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 p-1"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {tryOnItems.map((item) => (
          <div 
            key={item.productId} 
            className="p-3 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{item.productName}</h4>
                <div className="flex items-center">
                  {item.status === 'pending' ? (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Processing
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Ready
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => clearItem(item.productId)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {item.status === 'ready' && item.imageUrl && (
              <div 
                className="relative w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden cursor-pointer"
                onClick={() => navigateToProduct(item.productId)}
              >
                <Image 
                  src={item.imageUrl} 
                  alt={`Try on of ${item.productName}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-0 transition-all duration-200 flex items-center justify-center">
                  <span className="bg-white bg-opacity-80 px-3 py-1 rounded-full text-xs">
                    View Product
                  </span>
                </div>
              </div>
            )}
            
            {item.status === 'pending' && (
              <div 
                className="w-full aspect-[3/4] bg-gray-100 rounded flex items-center justify-center cursor-pointer"
                onClick={() => navigateToProduct(item.productId)}
              >
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#a1a561] mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">
                    Processing your image
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Click to view product
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
