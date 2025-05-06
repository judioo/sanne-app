'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { XMarkIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  // Load try-on items from localStorage
  useEffect(() => {
    // Get items from localStorage
    const storedItems = localStorage.getItem('tryOnItems');
    let parsedItems: TryOnItem[] = [];
    
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        const now = new Date();
        
        // Process each item
        parsedItems = items.map((item: TryOnItem) => {
          const timestamp = new Date(item.timestamp);
          const minutesSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60);
          
          // If more than 1 minute old, mark as ready (for demo purposes)
          // In a real app, this would be determined by a server response
          if (minutesSinceCreated > 1 && item.status === 'pending') {
            return {
              ...item,
              status: 'ready',
              // For demo purposes, use a sample image as the "processed" image
              imageUrl: '/lena-with-clothes.jpeg'
            };
          }
          
          return item;
        });
        
        // Filter out items older than 24 hours
        parsedItems = parsedItems.filter(item => {
          const timestamp = new Date(item.timestamp);
          const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          return hoursSinceCreated < 24;
        });
        
        // Sort items by timestamp (newest first)
        parsedItems.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        // Save the filtered and updated items back to localStorage
        localStorage.setItem('tryOnItems', JSON.stringify(parsedItems));
      } catch (e) {
        console.error('Error parsing tryOnItems:', e);
      }
    }
    
    setTryOnItems(parsedItems);
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

  // Navigate directly to dressing room
  const navigateToDressingRoom = (productId: number) => {
    // Store an indicator that we want to open the dressing room automatically
    sessionStorage.setItem('openDressingRoom', 'true');
    
    // Navigate to the product page
    router.push(`/product/${productId}`);
    onClose();
  };

  // Clear a try-on item
  const clearItem = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation(); // Prevent navigation when clicking the clear button
    
    // Get current items
    const storedItems = localStorage.getItem('tryOnItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        // Filter out the item to remove
        const updatedItems = items.filter((item: TryOnItem) => item.productId !== productId);
        // Save back to localStorage
        localStorage.setItem('tryOnItems', JSON.stringify(updatedItems));
        // Update state
        setTryOnItems(tryOnItems.filter(item => item.productId !== productId));
      } catch (e) {
        console.error('Error removing try-on item:', e);
      }
    }
  };

  // Clear all try-on items
  const clearAllItems = () => {
    // Remove all try-on items from localStorage
    localStorage.removeItem('tryOnItems');
    // Update state
    setTryOnItems([]);
    // Hide confirmation dialog
    setShowConfirmation(false);
  };

  // Show confirmation dialog
  const showClearConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  // Hide confirmation dialog
  const hideClearConfirmation = () => {
    setShowConfirmation(false);
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
        <div className="flex items-center">
          <button 
            onClick={showClearConfirmation}
            className="text-gray-500 p-1 mr-1 hover:text-red-500 transition-colors"
            title="Clear all items"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={onClose}
            className="text-gray-500 p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Confirmation dialog */}
      {showConfirmation && (
        <div className="p-3 bg-red-50 border-b">
          <p className="text-sm text-red-700 mb-2">
            Clear all try-on items?
          </p>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={hideClearConfirmation}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={clearAllItems}
              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      
      <div className="max-h-80 overflow-y-auto">
        {tryOnItems.map((item) => (
          <div 
            key={item.productId} 
            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            onClick={() => navigateToDressingRoom(item.productId)}
          >
            <div className="flex items-center space-x-3">
              {/* Small product avatar */}
              <div className="w-10 h-10 bg-gray-100 rounded-md relative flex-shrink-0 overflow-hidden">
                {item.status === 'ready' ? (
                  // Ready items show the processed image avatar
                  <Image 
                    src={item.imageUrl || '/lena-with-clothes.jpeg'} 
                    alt={`Try on of ${item.productName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  // Pending items show a spinner
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-[#a1a561] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">{item.productName}</h4>
                <div className="flex items-center">
                  {item.status === 'pending' ? (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Processing
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      Ready
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
              
              {/* Clear button */}
              <button 
                onClick={(e) => clearItem(e, item.productId)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
