'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, ArrowUpTrayIcon, CameraIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
// Dynamic import heic2any to prevent SSR issues
import { logger } from '@/utils/logger';
import md5 from 'md5';
import { trpc } from '@/utils/trpc';
import { TOIToDressingRoomStatusMapper, TOI_STATUS } from '@/server/utils/toi-constants';
import toast from 'react-hot-toast';
// PostHog will be initialized in useEffect to prevent SSR issues

type DressingRoomProps = {
  product: any; // Product details
  onClose: () => void;
  startWithClosedCurtains?: boolean; // New prop to start with curtains closed
}

// Define try-on item type
type TryOnItem = {
  productId: number;
  productName: string;
  timestamp: string;
  status: (typeof TOIToDressingRoomStatusMapper)[keyof typeof TOIToDressingRoomStatusMapper];
  TOIID?: string; // Unique ID for try-on job
  imageUrl?: string; // For ready items
  dressStatus?: string; // Friendly status from server
  TOIUrl?: string;       // URL where the processed image will be available
  uploadImgUrl?: string; // URL where the uploaded image is stored
  imgMD5?: string;       // MD5 hash of the image for reference
};

export default function DressingRoom({ product, onClose, startWithClosedCurtains = false }: DressingRoomProps) {
  // Initialize client-side libraries in useEffect
  useEffect(() => {
    // Import and initialize PostHog
    import('posthog-js').then((module) => {
      const posthog = module.default;
      // Initialize PostHog if needed
      if (typeof window !== 'undefined') {
        // PostHog init logic here if needed
      }
    });
    
    // Set log level on client-side only
    import('@/utils/logger').then(({ setLogLevel }) => {
      setLogLevel("info");
    });
  }, []);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCurtains, setShowCurtains] = useState(startWithClosedCurtains);
  const [curtainsClosed, setCurtainsClosed] = useState(startWithClosedCurtains);
  const [showMessage, setShowMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [tryOnImages, setTryOnImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasReadyTryOns, setHasReadyTryOns] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [hasTryOnItems, setHasTryOnItems] = useState(false); // Track if there are existing try-on items
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Load saved image from local storage and check for ready try-on images
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
    }
    
    // If starting with closed curtains, show message immediately
    if (startWithClosedCurtains) {
      setShowMessage(true);
    }
    
    // Check for ready try-on images for this product
    const storedItems = localStorage.getItem('tryOnItems');
    if (storedItems && product) {
      try {
        const items: TryOnItem[] = JSON.parse(storedItems);
        
        // Filter for this product's items
        const productItems = items.filter(item => item.productId === product.id);
        
        // Check if there are any try-on items for this product
        setHasTryOnItems(productItems.length > 0);

        // Check if all items are ready (and there are items)
        const allReady = productItems.length > 0 && productItems.every(item => item.status === TOI_STATUS.COMPLETED);
        const noPending = !productItems.some(item => item.status === 'pending');
        
        // If all items are ready and none pending, collect the images
        if (allReady && noPending) {
          const readyImages = productItems
            .filter(item => item.imageUrl) // Only include items with images
            .map(item => item.imageUrl as string); // Extract the imageUrl
          
          if (readyImages.length > 0) {
            setTryOnImages(readyImages);
            setHasReadyTryOns(true);
            setShowCurtains(false); // Ensure curtains are open for ready try-ons
            setCurtainsClosed(false);
          }
        }
      } catch (e) {
        console.error('Error checking try-on items:', e);
      }
    }
    
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [product, startWithClosedCurtains, tooltipTimeout]);

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

  // Navigate through try-on images carousel
  const nextImage = () => {
    if (tryOnImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % tryOnImages.length);
    }
  };

  const prevImage = () => {
    if (tryOnImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? tryOnImages.length - 1 : prev - 1));
    }
  };

  // Handle file selection with HEIC support
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const file = e.target.files[0];
        const fileType = file.type.toLowerCase();
        
        // Check if file is HEIC format
        if (fileType === 'image/heic' || fileType === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
          logger.info('Converting HEIC image to JPEG...');
          toast.loading('Converting HEIC image...', { id: 'heic-conversion' });
          
          try {
            // Dynamically import heic2any
            const heic2anyModule = await import('heic2any');
            const heic2any = heic2anyModule.default;
            
            // Capture analytics
            try {
              const posthog = (await import('posthog-js')).default;
              posthog.capture('HEIC conversion started', {
                properties: {
                  fileType,
                  fileName: file.name,
                  fileSize: file.size
                }
              });
            } catch (analyticError) {
              logger.error('Error capturing analytics:', analyticError);
            }
            
            // Convert HEIC to JPEG
            const jpegBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            }) as Blob;
            
            logger.info('HEIC conversion successful');
            toast.dismiss('heic-conversion');
            toast.success('HEIC image converted successfully');
            
            // Process the converted JPEG
            processImageFile(jpegBlob);
          } catch (conversionError) {
            logger.error('HEIC conversion failed:', conversionError);
            
            // Capture analytics
            try {
              const posthog = (await import('posthog-js')).default;
              posthog.capture('HEIC conversion failed', {
                properties: {
                  error: JSON.stringify(conversionError)
                }
              });
            } catch (analyticError) {
              logger.error('Error capturing analytics:', analyticError);
            }
            
            setUploadError('Unable to process HEIC image. Please try a different image format (JPEG, PNG).');
            setIsUploading(false);
            toast.dismiss('heic-conversion');
            toast.error('Unable to process HEIC image. Please try a different format.');
          }
        } else {
          // Process non-HEIC images directly
          processImageFile(file);
        }
      } catch (error) {
        logger.error('Error handling file selection:', error);
        
        // Capture analytics
        try {
          const posthog = (await import('posthog-js')).default;
          posthog.capture('Error handling file selection', {
            properties: {
              error: JSON.stringify(error)
            }
          });
        } catch (analyticError) {
          logger.error('Error capturing analytics:', analyticError);
        }
        
        setUploadError('Failed to process the selected image.');
        setIsUploading(false);
        toast.error('Failed to process the selected image.');
      }
    }
  };
  
  // Cleanup localStorage to make room for new images
  const cleanupLocalStorage = () => {
    try {
      // First try to remove the previous image which is usually the largest item
      localStorage.removeItem('userDressingRoomImage');
      
      // Calculate current localStorage usage after removing the previous image
      const { items, usageInMB, totalSize, availableSpaceInMB } = calculateLocalStorageUsage();
      logger.info(`Current localStorage usage after cleanup: ~${usageInMB.toFixed(2)}MB`);
      logger.info(`Current localStorage total size: ~${totalSize.toFixed(2)}MB`);
      logger.info(`Current localStorage available space: ~${availableSpaceInMB.toFixed(2)}MB`);
      
      // If still using more than 3MB, clean up more aggressively
      if (usageInMB > 3) {
        logger.info('Storage usage high, performing targeted cleanup');
        
        // Sort items by size (largest first) and remove non-essential items
        const sortedItems = [...items].sort((a, b) => b.size - a.size);
        
        // Define essential keys that shouldn't be removed
        const essentialKeys = ['criticalAppSettings', 'userPreferences', 'tryOnItems'];
        
        // Remove largest non-essential items first
        let removedCount = 0;
        for (const item of sortedItems) {
          if (!essentialKeys.includes(item.key)) {
            localStorage.removeItem(item.key);
            logger.info(`Removed item: ${item.key} (${(item.size/1024).toFixed(2)}KB)`);
            removedCount++;
            
            // Break after removing a few large items
            if (removedCount >= 3) break;
          }
        }
        
        // Log the updated storage usage after aggressive cleanup
        const { usageInMB: updatedUsageInMB } = calculateLocalStorageUsage();
        logger.info(`Updated localStorage usage after aggressive cleanup: ~${updatedUsageInMB.toFixed(2)}MB`);
      }
      
      return true;
    } catch (error) {
      logger.error('Error during localStorage cleanup:', error);
      return false;
    }
  };
  
  // Helper function to calculate localStorage usage and available space
  const calculateLocalStorageUsage = () => {
    let totalSize = 0;
    let items: {key: string, size: number}[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = (key.length + value.length) * 2; // Unicode characters take ~2 bytes
          totalSize += size;
          items.push({ key, size });
        }
      }
      
      const usageInMB = totalSize / (1024 * 1024);
      const totalSizeInMB = totalSize / (1024 * 1024); // Convert bytes to MB
      const availableSpaceInMB = 4.5 - usageInMB; // Conservative 4.5MB limit (most browsers allow 5MB)
      
      return {
        items,
        usageInMB,
        totalSize: totalSizeInMB,
        availableSpaceInMB
      };
    } catch (error) {
      logger.error('Error calculating localStorage usage:', error);
      return {
        items: [],
        usageInMB: 0,
        totalSize: 0,
        availableSpaceInMB: 4.5 // Conservative fallback
      };
    }
  };
  
  // Process image file (blob or file) to base64
  const processImageFile = (fileOrBlob: Blob) => {
    // Define the FileReader instance
    const reader = new FileReader();
    
    // When file is loaded as data URL
    reader.onloadend = async () => {
      // Get base64 string result
      const base64String = reader.result as string;
      
      try {
        // Try to optimize the image first using WebP conversion
        toast.loading('Optimising image...', { id: 'optimise-toast' });
        
        let optimizedImage = base64String;
        try {
          // Create a function to convert to WebP with enhanced compression
          const convertToWebP = (dataUrl: string): Promise<string> => {
            return new Promise((resolve, reject) => {
              const img = document.createElement('img');
              img.onload = () => {
                // Calculate dimensions - resize if over 1200px in any dimension
                const MAX_DIMENSION = 1200;
                let width = img.width;
                let height = img.height;
                
                // Maintain aspect ratio if resizing is needed
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                  if (width > height) {
                    height = Math.round(height * (MAX_DIMENSION / width));
                    width = MAX_DIMENSION;
                  } else {
                    width = Math.round(width * (MAX_DIMENSION / height));
                    height = MAX_DIMENSION;
                  }
                  logger.info(`Resizing image from ${img.width}x${img.height} to ${width}x${height}`);
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }
                
                // Use better quality settings for drawing to canvas
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                // Try multiple quality levels until we get a small enough image
                const tryCompress = (quality: number): string | null => {
                  try {
                    return canvas.toDataURL('image/webp', quality);
                  } catch (err) {
                    logger.warn(`WebP compression at quality ${quality} failed:`, err);
                    return null;
                  }
                };
                
                // Start with extremely low quality for maximum compression
                let webpDataUrl = tryCompress(0.05);
                
                // If failed or still too large, try different quality levels
                if (!webpDataUrl) {
                  // Fallback to lower quality JPEG if WebP fails
                  webpDataUrl = canvas.toDataURL('image/jpeg', 0.5);
                  logger.info('Falling back to JPEG compression');
                }
                
                // If we got a valid result, return it
                if (webpDataUrl) {
                  resolve(webpDataUrl);
                } else {
                  // Last resort - return original but warn about it
                  logger.warn('All compression attempts failed, using original');
                  resolve(dataUrl);
                }
              };
              img.onerror = () => reject(new Error('Image load failed'));
              img.src = dataUrl;
            });
          };
          
          // Convert to WebP for better compression
          optimizedImage = await convertToWebP(base64String);
          const originalSize = base64String.length;
          const optimizedSize = optimizedImage.length;
          const compressionRate = Math.round((1 - (optimizedSize / originalSize)) * 100);
          
          if (compressionRate > 0) {
            // Calculate sizes in MB for better readability in logs
            const originalSizeMB = originalSize / (1024 * 1024);
            const optimizedSizeMB = optimizedSize / (1024 * 1024);
            
            logger.info(`WebP conversion reduced size by ${compressionRate}% (${originalSizeMB.toFixed(2)}MB → ${optimizedSizeMB.toFixed(2)}MB)`);
            
            // Track the optimization in PostHog
            try {
              const posthog = (await import('posthog-js')).default;
              posthog.capture('Image optimised', {
                properties: {
                  compressionRate,
                  originalSize,
                  optimizedSize,
                  originalSizeMB: originalSizeMB.toFixed(2),
                  optimizedSizeMB: optimizedSizeMB.toFixed(2)
                }
              });
            } catch (analyticsError) {
              logger.error('Error capturing optimization analytics:', analyticsError);
            }
          }
        } catch (optimizationError) {
          logger.error('Image optimization failed:', optimizationError);
          // Continue with the original image if optimization fails
          optimizedImage = base64String;
        }
        
        toast.dismiss('optimise-toast');
        
        // Clean up localStorage before saving the new image
        cleanupLocalStorage();
        
        // Check if the image will fit in localStorage before attempting to store it
        const imageSizeInMB = optimizedImage.length * 2 / (1024 * 1024); // Each character is ~2 bytes
        logger.info(`Optimized image size: ${imageSizeInMB.toFixed(2)}MB`);
        
        // Get current localStorage usage after cleanup
        const { usageInMB, availableSpaceInMB } = calculateLocalStorageUsage();
        logger.info(`Current localStorage usage: ${usageInMB.toFixed(2)}MB, available space: ${availableSpaceInMB.toFixed(2)}MB`);
          
          // If image is too large, don't attempt to store it
          if (imageSizeInMB > availableSpaceInMB) {
            logger.warn(`Image size (${imageSizeInMB.toFixed(2)}MB) exceeds available space (${availableSpaceInMB.toFixed(2)}MB)`); 
            
            // Continue with in-memory only approach
            setUploadedImage(optimizedImage);
            setIsUploading(false);
            toast.success('Using optimised image as original is to large to store.', {
              id: 'storage-limit-toast',
              duration: 5000
            });

            // create message giving image size, available space and usage
            const message = `Image size: ${imageSizeInMB.toFixed(2)}MB, available space: ${availableSpaceInMB.toFixed(2)}MB, usage: ${usageInMB.toFixed(2)}MB`;
            
            // Track the too-large event
            try {
              const posthog = (await import('posthog-js')).default;
              posthog.capture('Image_too_large_for_localStorage', {
                properties: {
                  message
                }
              });
            } catch (analyticsError) {
              logger.error('Error tracking storage size issue:', analyticsError);
            }
          } else {
            // Image should fit, attempt to store it
            try {
              localStorage.setItem('userDressingRoomImage', optimizedImage);
              setUploadedImage(optimizedImage);
              setIsUploading(false);
              toast.success('Image processed and saved successfully');
              
              // Track successful storage
              try {
                // Create status message for analytics
                const message = `Image size: ${imageSizeInMB.toFixed(2)}MB, available space: ${availableSpaceInMB.toFixed(2)}MB, usage: ${usageInMB.toFixed(2)}MB`;
                
                const posthog = (await import('posthog-js')).default;
                posthog.capture('Image_stored_in_localStorage', {
                  properties: {
                    message
                  }
                });
              } catch (analyticsError) {
                logger.error('Error tracking storage success:', analyticsError);
              }
            } catch (storageError) {
              // Handle storage error gracefully
              logger.warn('Storage attempt failed:', storageError);
              setUploadedImage(optimizedImage);
              setIsUploading(false);
              toast.error('Unable to save to browser storage. Image will be available for this session only.', { duration: 5000 });
            }
          }
        } catch (generalError) {
          // This is a fallback for any other errors in the optimization process
          logger.error('Unexpected error during image processing:', generalError);
          
          // Continue with the original non-optimized image
          setUploadedImage(base64String);
          setIsUploading(false);
          toast.error('Had trouble optimizing your image, but will still process it', { duration: 5000 });
          
          // Track this unexpected error
          try {
            const posthog = (await import('posthog-js')).default;
            posthog.capture('Image_processing_unexpected_error', {
              properties: {
                errorMessage: String(generalError)
              }
            });
          } catch (analyticError) {
            // Silent fail for analytics
          }
        }
      // Note: Removed redundant catch block - errors are handled in inner try-catch blocks
    };
    
    reader.onerror = async () => {
      logger.error('Error reading file:', reader.error);
      
      // Capture analytics
      try {
        const posthog = (await import('posthog-js')).default;
        posthog.capture('Error reading file', {
          properties: {
            error: JSON.stringify(reader)
          }
        });
      } catch (analyticError) {
        logger.error('Error capturing analytics:', analyticError);
      }
      
      setUploadError('Failed to read the image file.');
      setIsUploading(false);
      toast.error('Failed to read the image file. Please try again.');
    };
    
    reader.readAsDataURL(fileOrBlob);
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
      
      // Auto-hide tooltip after 7 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 7000);
      
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
  const addTryOnItem = (): TryOnItem => {
    // Create new try-on item
    const newTryOnItem: TryOnItem = {
      productId: product.id,
      productName: product.name,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add MD5 hash if we have an uploaded image
    if (uploadedImage) {
      newTryOnItem.imgMD5 = calculateImageMD5(uploadedImage);
    }
    
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
    
    // Return the new item for reference
    return newTryOnItem;
  };
  
  // Calculate MD5 hash of a base64 image
  const calculateImageMD5 = (base64Image: string) => {
    return md5(base64Image);
  };
  
  // Set up TRPC mutation for image upload
  const { mutateAsync: uploadToDressingRoom } = trpc.products.toDressingRoom.useMutation({
    onSuccess: async (result, variables) => {
      logger.info(`Successfully uploaded image with MD5 ${variables.imgMD5.substring(0, 8)} to dressing room:`, result);
      
      // Capture analytics
      try {
        const posthog = (await import('posthog-js')).default;
        posthog.capture('Image uploaded to dressing room', {
          properties: {
            TOIID: result.TOIID,
            imgMD5: variables.imgMD5,
            productId: variables.productId
          }
        });
      } catch (analyticError) {
        logger.error('Error capturing analytics:', analyticError);
      }
      
      // Dismiss loading toast
      toast.dismiss('upload-toast');
      setUploadError(null);
      
      // Update localStorage with the result
      updateTryOnItemWithResults(result, variables.imgMD5);     
      toast.success('Image uploaded successfully!');
    },
    onError: async (error) => {
      logger.error('Error uploading image to dressing room:', error);
      
      // Capture analytics
      try {
        const posthog = (await import('posthog-js')).default;
        posthog.capture('Error uploading image to dressing room', {
          properties: {
            error: JSON.stringify(error)
          }
        });
      } catch (analyticError) {
        logger.error('Error capturing analytics:', analyticError);
      }
      setUploadError('Failed to process image. Please try again.');
      setIsProcessing(false);
      
      // Dismiss the loading toast and show error
      toast.dismiss('upload-toast');
      toast.error(`Upload failed: ${error.message}`);
    }
  });
  
  // Update localStorage with TRPC response
  const updateTryOnItemWithResults = (result: { TOIID: string }, imgMD5Hash: string) => {
    // Get existing try-on items
    const existingItems = localStorage.getItem('tryOnItems');
    if (existingItems) {
      try {
        const items: TryOnItem[] = JSON.parse(existingItems);
        
        // Find and update the specific item
        const updatedItems = items.map(item => {
          if (item.productId === product.id) {
            return {
              ...item,
              TOIID: result.TOIID,
              imgMD5: imgMD5Hash
            };
          }
          return item;
        });
        
        // Save updated items back to localStorage
        localStorage.setItem('tryOnItems', JSON.stringify(updatedItems));
      } catch (e) {
        console.error('Error updating try-on items with server response:', e);
      }
    }
  };
  
  // Load default image and convert to base64
  const loadDefaultImage = () => {
    return new Promise<string>((resolve, reject) => {
      fetch('/lena.jpeg')
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data);
          };
          reader.onerror = () => {
            reject(new Error('Failed to read default image'));
          };
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('Error loading default image:', error);
          setUploadError('Failed to load default image. Please try again.');
          reject(error);
        });
    });
  };

  // Upload image to server using TRPC
  const uploadImageToServer = async (base64Image: string) => {
    try {
      const imgMD5Hash = calculateImageMD5(base64Image);
      logger.info(`Uploading image to dressing room for product ${product.id} with MD5 ${imgMD5Hash.substring(0, 8)}...`);
      
      // Show loading toast that persists until success/error
      toast.loading('Processing image - this may take a moment...', { id: 'upload-toast' });
      const posthog = (await import('posthog-js')).default;
      posthog.capture('Calling uploadToDressingRoom', {
        properties: {
          productId: product.id,
          imgMD5: `${imgMD5Hash.substring(0, 8)}`
        }
      });
      
      // Call the TRPC endpoint
      uploadToDressingRoom({
        image: base64Image,
        imgMD5: imgMD5Hash,
        productId: product.id
      });
      
      // We're not awaiting the result since we want the UI to continue without waiting
      logger.info('Upload initiated in background');
    } catch (error) {
      logger.error('Error initiating image upload:', error);
      setUploadError('Failed to start image processing. Please try again.');
      toast.dismiss('upload-toast');
      toast.error('Failed to start image processing. Please try again.');
    }
  };
  
  // Process image upload - use uploaded image or default
  const processImageUpload = async () => {
    // Note: isProcessing is now set in goToDressingRoom before this function is called
    if (uploadedImage) {
      uploadImageToServer(uploadedImage);
    } else {
      try {
        const defaultImage = await loadDefaultImage();
        uploadImageToServer(defaultImage);
      } catch (error) {
        console.error('Error processing default image:', error);
        setIsProcessing(false);
      }
    }
  };

  const SHOW_MESSAGE_DURATION = 6000;
  // Go to dressing room with animation - updated to include image upload
  const goToDressingRoom = () => {
    // Set processing state immediately to prevent multiple clicks
    setIsProcessing(true);
    
    // If curtains are already closed (for existing try-on), just add the item and close
    if (startWithClosedCurtains) {
      // Add try-on item to localStorage
      addTryOnItem();
      
      // Process image upload (uses default if none uploaded)
      processImageUpload();
      
      // Auto close after a few seconds
      setTimeout(() => {
        // Close both the dressing room and product card by navigating back to the main page
        onClose();
        
        // Go back to main page after showing the message
        window.history.back();
      }, SHOW_MESSAGE_DURATION);
      return;
    }
    
    // Normal flow for new try-on request
    // Show curtains in initial open state
    setShowCurtains(true);
    setCurtainsClosed(false);
    
    // After a small delay, close the curtains
    setTimeout(() => {
      setCurtainsClosed(true);
      
      // After curtains close, show the message
      setTimeout(() => {
        setShowMessage(true);
        
        // Add try-on item to localStorage and get reference to it
        const newTryOnItem = addTryOnItem();
        
        // Process image upload (uses default if none uploaded)
        processImageUpload();
        
        // Auto close after a few seconds
        setTimeout(() => {
          // Close both the dressing room and product card by navigating back to the main page
          onClose();
          
          // Go back to main page after showing the message
          window.history.back();
        }, SHOW_MESSAGE_DURATION);
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
          {/* Default, uploaded image or try-on image carousel */}
          <div className="relative w-full h-full overflow-hidden">
            {hasReadyTryOns && tryOnImages.length > 0 ? (
              <>
                {/* Try-on image carousel */}
                <div className="relative h-full w-full">
                  {tryOnImages.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={imageUrl} 
                        alt={`${product.name} try-on ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                  
                  {/* Carousel controls (only show if multiple images) */}
                  {tryOnImages.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-10">
                      <button 
                        onClick={prevImage}
                        className="p-2 rounded-full bg-white/80 shadow-md"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="p-2 rounded-full bg-white/80 shadow-md"
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                  
                  {/* Dots indicator for carousel */}
                  {tryOnImages.length > 1 && (
                    <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-2 z-10">
                      {tryOnImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Image 
                src={uploadedImage || '/lena.jpeg'} 
                alt="Model" 
                fill
                className="object-cover"
                priority
              />
            )}
            
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
                      <h3 className="font-bold text-lg mb-2">Request Received!</h3>
                      <p className="text-gray-700">
                        We're processing your try-on request for {product.name}.
                      </p>
                      <p className="text-gray-600 text-sm mt-3">
                        Check the garment icon to see your items when they're ready. Dressing normally takes <span className="font-bold text-[#5820e4]">up to 3 minutes</span> to complete.
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
                onClick={(hasTryOnItems || isUploading || isProcessing) ? undefined : triggerFileUpload}
                onTouchStart={(hasTryOnItems || isUploading || isProcessing) ? undefined : handlePhotoIconTouchStart}
                onTouchEnd={(hasTryOnItems || isUploading || isProcessing) ? undefined : handlePhotoIconTouchEnd}
                onMouseDown={(hasTryOnItems || isUploading || isProcessing) ? undefined : handlePhotoIconTouchStart}
                onMouseUp={(hasTryOnItems || isUploading || isProcessing) ? undefined : handlePhotoIconTouchEnd}
                onMouseLeave={(hasTryOnItems || isUploading || isProcessing) ? undefined : handlePhotoIconTouchEnd}
                className={`p-3 ${(hasTryOnItems || isUploading || isProcessing) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#a1a561] cursor-pointer'} text-white rounded-full shadow-lg`}
                disabled={hasTryOnItems || isUploading || isProcessing}
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
                    <h3 className="font-medium text-base mb-1">Personalise Your Experience</h3>
                    <p className="text-sm mb-2">
                      {uploadedImage 
                        ? "You're using your own photo. Want to try a different one?" 
                        : "See how this would look on you! Upload your photo for a more personalised experience."}
                    </p>
                    <button 
                      onClick={(isUploading || isProcessing) ? undefined : triggerFileUpload}
                      disabled={isUploading || isProcessing}
                      className={`flex items-center justify-center w-full py-2 px-3 border border-white/30 rounded-md text-sm ${(isUploading || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'} transition`}
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
            disabled={isUploading || isProcessing}
          />
        </div>
        
        {/* Dressing room button - Make sure it's not obscured */}
        <div className="mb-10">
          <button 
            onClick={hasTryOnItems || isProcessing ? undefined : goToDressingRoom}
            disabled={hasTryOnItems || isProcessing}
            className={`w-full py-4 ${hasTryOnItems || isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#a1a561] cursor-pointer'} text-white rounded-md font-medium relative overflow-hidden group`}
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
