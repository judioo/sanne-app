'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

interface RateLimitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rateLimitInfo: {
    time: string;
    date: string;
    timestamp: number;
  } | null;
}

export default function RateLimitErrorModal({ isOpen, onClose, rateLimitInfo }: RateLimitErrorModalProps) {
  // Don't render if not open or no rate limit info
  if (!isOpen || !rateLimitInfo) return null;

  // Calculate time remaining
  const now = Date.now();
  const timeRemaining = Math.max(0, rateLimitInfo.timestamp - now);
  const minutesRemaining = Math.ceil(timeRemaining / (60 * 1000));
  
  // Play error sound when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/public/room-closed.mp3');
        audio.volume = 0.5; // Set volume to 50%
        audio.play().catch(e => {
          // Some browsers block autoplay
          logger.error('Failed to play error sound:', e);
        });
      } catch (e) {
        logger.error('Failed to play error sound:', e);
      }
    }
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6 overflow-hidden animate-[bounce_0.5s_ease-in-out]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
        
        <div className="flex items-start mb-4">
          <div className="mr-4 bg-red-100 p-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Dressing Rooms at Capacity</h3>
            <p className="text-sm text-gray-600">Our virtual dressing rooms are currently experiencing high demand.</p>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100">
          <p className="text-sm">Please try again after:</p>
          <p className="text-lg font-semibold text-red-600">{rateLimitInfo.time} on {rateLimitInfo.date}</p>
          <p className="text-xs text-gray-500 mt-1">Approximately {minutesRemaining} {minutesRemaining === 1 ? 'minute' : 'minutes'} from now</p>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm font-medium"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
