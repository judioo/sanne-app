'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { trpc } from '../../../utils/trpc';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import DressingRoom from '../../components/DressingRoom';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [showDressingRoom, setShowDressingRoom] = useState(false);
  const [hasPendingTryOn, setHasPendingTryOn] = useState(false);
  const [hasReadyTryOn, setHasReadyTryOn] = useState(false);
  const [readyTryOnImages, setReadyTryOnImages] = useState<string[]>([]);
  const [tryButtonHovered, setTryButtonHovered] = useState(false);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const cardHeightRef = useRef<number | null>(null);

  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !isNaN(productId) }
  );

  // Handle carousel navigation
  const nextImage = () => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setActiveImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Animation effect when component mounts and check if we should open dressing room
  useEffect(() => {
    // Slight delay to ensure animation works
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Check if we should automatically open the dressing room
      const shouldOpenDressingRoom = sessionStorage.getItem('openDressingRoom');
      if (shouldOpenDressingRoom === 'true' && product) {
        // Remove the flag so it doesn't trigger again on refresh
        sessionStorage.removeItem('openDressingRoom');
        // Open dressing room after the product card is visible
        setTimeout(() => {
          setShowDressingRoom(true);
        }, 300);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [product]);
  
  // Check if this product has a pending or ready try-on
  useEffect(() => {
    if (product) {
      // Get try-on items from localStorage
      const storedItems = localStorage.getItem('tryOnItems');
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          
          // Find if this product has any try-on items
          const productItems = items.filter((item: any) => 
            item.productId === product.id
          );
          
          // Check for pending items
          const pendingItems = productItems.filter((item: any) => 
            item.status === 'pending'
          );
          setHasPendingTryOn(pendingItems.length > 0);
          
          // Check for ready items
          const readyItems = productItems.filter((item: any) => 
            item.status === 'ready' && item.imageUrl
          );
          setHasReadyTryOn(readyItems.length > 0);
          
          // Collect all ready images
          const images = readyItems
            .filter((item: any) => item.imageUrl)
            .map((item: any) => item.imageUrl);
          setReadyTryOnImages(images);
          
        } catch (e) {
          console.error('Error checking for try-on items:', e);
        }
      }
    }
  }, [product]);

  const closeProductPage = () => {
    setIsVisible(false);
    // Wait for the animation to complete before navigating
    setTimeout(() => {
      router.back();
    }, 300);
  };

  // Touch handling for draggable info card
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    if (infoCardRef.current) {
      cardHeightRef.current = infoCardRef.current.offsetHeight;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || cardHeightRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = startYRef.current - currentY;
    
    // Expand card if dragged up, collapse if dragged down
    if (diff > 50 && !isCardExpanded) {
      setIsCardExpanded(true);
    } else if (diff < -50 && isCardExpanded) {
      setIsCardExpanded(false);
    }
  };

  const handleTouchEnd = () => {
    startYRef.current = null;
    cardHeightRef.current = null;
  };

  const toggleCardExpansion = () => {
    setIsCardExpanded(!isCardExpanded);
  };
  
  // Open dressing room
  const openDressingRoom = () => {
    setShowDressingRoom(true);
  };

  // Close dressing room
  const closeDressingRoom = () => {
    setShowDressingRoom(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 w-full max-w-lg mx-auto rounded-t-2xl">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white p-6 w-full max-w-lg mx-auto rounded-t-2xl">
          <p className="text-center">Product not found</p>
          <button 
            onClick={closeProductPage}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md w-full"
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showDressingRoom ? (
        <DressingRoom 
          product={product} 
          onClose={closeDressingRoom} 
          startWithClosedCurtains={hasPendingTryOn}
          readyImages={readyTryOnImages}
          showReadyImagesCarousel={hasReadyTryOn && !hasPendingTryOn}
        />
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          <div 
            className={`bg-white w-full rounded-t-2xl transform transition-all duration-300 ease-out overflow-hidden flex flex-col ${
              isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Close button */}
            <div className="relative">
              <button 
                onClick={closeProductPage}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 shadow-md"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Image carousel - increased height from 40vh to 60vh */}
            <div className="relative h-[60vh] bg-gray-100 flex-shrink-0">
              {product.images && product.images.length > 0 && (
                <div className="relative h-full">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image 
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                  
                  {/* Carousel controls */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
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
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === activeImageIndex ? 'bg-black' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Draggable info card */}
            <div 
              ref={infoCardRef}
              className={`bg-white rounded-t-xl shadow-lg transform transition-all duration-300 ease-in-out`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag handle and minimized view */}
              <div className="sticky top-0 bg-white px-6 pt-4 pb-3 border-b">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-bold truncate">{product.name}</h1>
                  <p className="text-xl font-semibold">{product.price}د.إ</p>
                </div>
                
                {/* Toggle button */}
                <button 
                  onClick={toggleCardExpansion}
                  className="absolute top-2 right-3 p-1.5 rounded-full bg-gray-100"
                >
                  {isCardExpanded ? 
                    <ChevronDownIcon className="h-4 w-4" /> : 
                    <ChevronUpIcon className="h-4 w-4" />
                  }
                </button>
              </div>
              
              {/* "Try The Look" button - always visible, replacing "Add to Cart" */}
              <div className="px-6 pt-3 pb-4 bg-white">
                <button 
                  className="w-full py-3 text-white rounded-md font-medium relative overflow-hidden group"
                  onClick={openDressingRoom}
                  onMouseEnter={() => setTryButtonHovered(true)}
                  onMouseLeave={() => setTryButtonHovered(false)}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <span className={`transition-transform duration-300 ${tryButtonHovered ? 'scale-110' : 'scale-100'}`}>
                      Try The Look
                    </span>
                  </span>
                  {/* Always show gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"></div>
                  <div className="absolute inset-y-0 left-0 bg-white w-1 opacity-20 h-full transform -skew-x-20 transition-transform duration-700 
                               group-hover:translate-x-[800%]"></div>
                </button>
              </div>
              
              {/* Expandable content */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isCardExpanded ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0">
                  {/* Add to wishlist button */}
                  <button className="w-full py-3 border border-black rounded-md font-medium mb-6">
                    Add to Wishlist
                  </button>
                  
                  {/* Tabs navigation */}
                  <div className="flex border-b mb-4 sticky top-0 bg-white z-10">
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`pb-2 px-4 ${activeTab === 'details' 
                        ? 'border-b-2 border-black font-medium' 
                        : 'text-gray-500'}`}
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => setActiveTab('collections')}
                      className={`pb-2 px-4 ${activeTab === 'collections' 
                        ? 'border-b-2 border-black font-medium' 
                        : 'text-gray-500'}`}
                    >
                      Collections
                    </button>
                    <button 
                      onClick={() => setActiveTab('category')}
                      className={`pb-2 px-4 ${activeTab === 'category' 
                        ? 'border-b-2 border-black font-medium' 
                        : 'text-gray-500'}`}
                    >
                      Category
                    </button>
                  </div>
                  
                  {/* Tab content - scrollable */}
                  <div className="tab-content">
                    {activeTab === 'details' && (
                      <div>
                        <p className="mb-6">
                          A beautiful {product.name.toLowerCase()} designed for comfort and style. 
                          Perfect for any occasion.
                        </p>
                        <p className="mb-6">
                          This product features premium materials and expert craftsmanship, ensuring
                          both durability and a luxurious feel. The attention to detail is evident in
                          every stitch.
                        </p>
                        <p className="mb-6">
                          Care instructions: Hand wash or dry clean only. Do not bleach. Iron on low heat if needed.
                        </p>
                        <p className="mb-6">
                          Each item is made with care and passion, reflecting our commitment to quality and sustainability.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'collections' && (
                      <div>
                        <h2 className="text-lg font-medium mb-2">Collections</h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {product.collections.map((collection, index) => (
                            <Link 
                              key={index} 
                              href={`/collections/${encodeURIComponent(collection)}`}
                              className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {collection}
                            </Link>
                          ))}
                        </div>
                        <p className="mb-6">
                          This product belongs to our curated collections, each representing a unique aesthetic 
                          and design philosophy. Explore similar items by clicking on the collection tags above.
                        </p>
                      </div>
                    )}
                    
                    {activeTab === 'category' && (
                      <div>
                        <h2 className="text-lg font-medium mb-2">Category</h2>
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm mb-6">
                          {product.category === 'men' ? 'Men\'s' : 'Women\'s'}
                        </span>
                        <p className="mb-6">
                          Our {product.category === 'men' ? 'men\'s' : 'women\'s'} collection is designed with 
                          modern sensibilities while remaining timeless. Each piece is carefully selected to ensure
                          versatility and style.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add some bottom space to ensure scrollability is apparent */}
                  <div className="h-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
