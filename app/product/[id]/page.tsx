'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { trpc } from '../../../utils/trpc';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

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

  // Animation effect when component mounts
  useEffect(() => {
    // Slight delay to ensure animation works
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const closeProductPage = () => {
    setIsVisible(false);
    // Wait for the animation to complete before navigating
    setTimeout(() => {
      router.back();
    }, 300);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div 
        className={`bg-white w-full h-[90vh] rounded-t-2xl transform transition-all duration-300 ease-out ${
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

        {/* Image carousel */}
        <div className="relative h-[50vh] bg-gray-100">
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

        {/* Product details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">{product.price}د.إ</p>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Collections</h2>
            <div className="flex flex-wrap gap-2">
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
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Category</h2>
            <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm">
              {product.category === 'men' ? 'Men\'s' : 'Women\'s'}
            </span>
          </div>
          
          <button className="w-full py-3 bg-black text-white rounded-md font-medium mb-3">
            Add to Cart
          </button>
          
          <button className="w-full py-3 border border-black rounded-md font-medium">
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
