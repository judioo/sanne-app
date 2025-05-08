'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { XMarkIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TOI_STATUS, TOIToDressingRoomStatusMapper } from '@/server/utils/toi-constants';
import { trpc } from '@/utils/trpc';

type TryOnItem = {
  productId: number;
  productName: string;
  timestamp: string;
  status: (typeof TOIToDressingRoomStatusMapper)[keyof typeof TOIToDressingRoomStatusMapper];
  TOIID?: string; // Unique ID for try-on job
  imageUrl?: string; // For ready items
  dressStatus?: string; // Friendly status from server
};

type serverData = {
  dressStatus?: string;
  jobId: string;
  md5sum: string;
  processingDuration?: string;
  productName: string;
  productId: number;
  result?: string;
  imageUrl?: string;
  status: string;
  timestamp?: number;
  updatedAt: number;
}

type TryOnListProps = {
  onClose: () => void;
};

export default function TryOnList({ onClose }: TryOnListProps) {
  const [tryOnItems, setTryOnItems] = useState<TryOnItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [serverItems, setServerItems] = useState<serverData[]>([]);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  
  // Keep track of our polling timeout
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom hook for calling checkDressingRoom
  const checkDressingRoom = trpc.products.checkDressingRoom.useQuery(
    { jobIds: tryOnItems.filter(item => item.TOIID).map(item => item.TOIID!) },
    { 
      enabled: pollingEnabled && tryOnItems.some(item => item.TOIID),
      refetchInterval: 3000, // Poll every 3 seconds
      refetchOnMount: true, // Always refetch when mounted
    }
  );

  // Function to load try-on items from localStorage
  const loadFromLocalStorage = () => {
    // Get items from localStorage
    const storedItems = localStorage.getItem('tryOnItems');
    let parsedItems: TryOnItem[] = [];
    
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        const now = new Date();
        
        // Process each item
        parsedItems = items.map((item: TryOnItem) => {
          // Create JobID in the same format as server if not already present
          if (!item.TOIID && item.productId) {
            const md5 = item.imageUrl?.split('/').pop()?.split('-')[0];
            if (md5) {
              const env = process.env.NODE_ENV === 'production' ? 'p' : 'd';
              item.TOIID = `${env}-${md5}-${item.productId}`;
            }
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
    // Enable polling if we have items
    setPollingEnabled(parsedItems.length > 0);
  };
  
  // Load try-on items from localStorage and handle polling
  useEffect(() => {
    // First, load the latest data from localStorage
    loadFromLocalStorage();
    
    // Start polling when component mounts
    setPollingEnabled(true);
    
    // Set a timeout to disable polling after 3 seconds
    pollingTimeoutRef.current = setTimeout(() => {
      setPollingEnabled(false);
    }, 3000);
    
    // Clean up when component unmounts
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      setPollingEnabled(false);
    };
  }, []);
  
  // Set up listeners for visibility and focus changes
  useEffect(() => {
    // This handler will reload data and restart polling when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Load fresh data first
        loadFromLocalStorage();
        
        // Clear any existing timeout
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
        
        // Enable polling for 3 seconds
        setPollingEnabled(true);
        pollingTimeoutRef.current = setTimeout(() => {
          setPollingEnabled(false);
          pollingTimeoutRef.current = null;
        }, 3000);
      } else {
        // Disable polling when tab is not visible
        setPollingEnabled(false);
      }
    };
    
    // This handler will reload data and restart polling when window gets focus
    const handleFocus = () => {
      // Load fresh data first
      loadFromLocalStorage();
      
      // Clear any existing timeout
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      
      // Enable polling for 3 seconds
      setPollingEnabled(true);
      pollingTimeoutRef.current = setTimeout(() => {
        setPollingEnabled(false);
        pollingTimeoutRef.current = null;
      }, 3000);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      
      // Clean up any polling timeout
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      
      setPollingEnabled(false);
    };
  }, []);

  // Effect to update tryOnItems with status from server
  useEffect(() => {
    if (checkDressingRoom.data && tryOnItems.length > 0) {
      // Extract all job IDs we're tracking
      const jobIds = tryOnItems.filter(item => item.TOIID).map(item => item.TOIID!);
      
      // Create a map for quick lookup of product info by TOIID
      const productInfoMap = tryOnItems.reduce((acc, item) => {
        if (item.TOIID) {
          acc[item.TOIID] = {
            productId: item.productId,
            productName: item.productName,
            timestamp: item.timestamp
          };
        }
        return acc;
      }, {} as Record<string, { productId: number; productName: string; timestamp: string }>);
      
      // Process server data first - this is our authoritative source
      const serverDataItems = jobIds
        .filter(id => checkDressingRoom.data[id]) // Only include IDs that have data
        .map(id => {
          const serverData: serverData = checkDressingRoom.data[id];
          const productInfo = productInfoMap[id];
          
          if (!productInfo) return null; // Skip if we don't have product info

          return {
            TOIID: id,
            productId: productInfo.productId,
            productName: productInfo.productName,
            timestamp: productInfo.timestamp,
            status: serverData?.status,
            imageUrl: serverData?.result || undefined,
            dressStatus: serverData?.dressStatus
          };
        })
        .filter(Boolean) as TryOnItem[];
      
      // For items without server data, keep their existing state
      const remainingItems = tryOnItems.filter(item => 
        !item.TOIID || !checkDressingRoom.data[item.TOIID]
      );
      
      setServerItems(serverDataItems);
      // Combine server data with remaining items
      const updatedItems = [...serverDataItems, ...remainingItems];
      
      // Always update the localStorage with server items first
      if (serverDataItems.length > 0) {
        // Create properly formatted items for localStorage
        const storageItems = serverDataItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          timestamp: item.timestamp,
          status: item.status,
          TOIID: item.TOIID,
          imageUrl: item.imageUrl,
          dressStatus: item.dressStatus
        }));
        
        // Get existing items from localStorage
        const existingItems = localStorage.getItem('tryOnItems');
        let allItems = [];
        
        if (existingItems) {
          try {
            // Parse existing items
            const parsedItems = JSON.parse(existingItems) as TryOnItem[];
            
            // Filter out items that we now have server data for
            const filteredItems = parsedItems.filter((item: TryOnItem) => 
              !item.TOIID || !serverDataItems.some(si => si.TOIID === item.TOIID)
            );
            
            // Combine with server items
            allItems = [...storageItems, ...filteredItems];
          } catch (e) {
            console.error('Error parsing localStorage items:', e);
            allItems = storageItems;
          }
        } else {
          allItems = storageItems;
        }
        
        // Sort by timestamp (newest first)
        allItems.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        // Update localStorage with all items
        localStorage.setItem('tryOnItems', JSON.stringify(allItems));
        
        // Only update state if there's a change
        if (JSON.stringify(updatedItems) !== JSON.stringify(tryOnItems)) {
          setTryOnItems(updatedItems);
        }
      }
    }
  }, [checkDressingRoom.data, tryOnItems]);
  
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
        <h3 className="font-medium">Your Dressing Room</h3>
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
        {serverItems.map((item) => (
          <div 
            key={item.productId} 
            className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
            onClick={() => navigateToDressingRoom(item.productId)}
          >
            <div className="flex items-center space-x-3">
              {/* Small product avatar */}
              <div className="w-10 h-10 bg-gray-100 rounded-md relative flex-shrink-0 overflow-hidden">
                {item.status === TOI_STATUS.COMPLETED && item.imageUrl ? (
                  // Completed items show the processed image avatar
                  <Image 
                    src={item.imageUrl} 
                    alt={`Try on of ${item.productName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  // Items in process show a spinner with color based on status
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`animate-spin h-5 w-5 border-2 border-t-transparent rounded-full ${  
                      item.status === TOI_STATUS.ERROR ? 'border-red-500' :
                      item.status === TOI_STATUS.PROCESSING_STARTED ? 'border-blue-500' :
                      item.status === TOI_STATUS.DOWNLOADING_IMAGES ? 'border-indigo-500' :
                      item.status === TOI_STATUS.PROCESSING_IMAGES ? 'border-purple-500' :
                      item.status === TOI_STATUS.CALLING_OPENAI ? 'border-pink-500' :
                      item.status === TOI_STATUS.PROCESSING_OPENAI_RESPONSE ? 'border-orange-500' :
                      item.status === TOI_STATUS.COMPLETED ? 'border-green-500' :
                      item.status === TOI_STATUS.GONE ? 'border-red-500' :
                      'border-[#a1a561]'
                    }`}></div>
                  </div>
                )}
              </div>
              
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">{item.productName}</h4>
                <div className="flex items-center">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    item.status === TOI_STATUS.ERROR ? 'bg-red-100 text-red-800' :
                    item.status === TOI_STATUS.PROCESSING_STARTED ? 'bg-blue-100 text-blue-800' :
                    item.status === TOI_STATUS.DOWNLOADING_IMAGES ? 'bg-indigo-100 text-indigo-800' :
                    item.status === TOI_STATUS.PROCESSING_IMAGES ? 'bg-purple-100 text-purple-800' :
                    item.status === TOI_STATUS.CALLING_OPENAI ? 'bg-pink-100 text-pink-800' :
                    item.status === TOI_STATUS.PROCESSING_OPENAI_RESPONSE ? 'bg-orange-100 text-orange-800' :
                    item.status === TOI_STATUS.COMPLETED ? 'bg-green-100 text-green-800' :
                    item.dressStatus === TOI_STATUS.GONE ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.dressStatus}
                  </span>
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
