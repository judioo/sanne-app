'use client'

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '../../../utils/trpc';
import Image from 'next/image';
import Link from 'next/link';

export default function CollectionPage() {
  const params = useParams();
  const collectionName = decodeURIComponent(params.name as string);
  
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Fetch products in this collection using tRPC
  const { data: products = [], isLoading } = trpc.products.getAll.useQuery({
    collection: collectionName,
    sortBy,
  });

  return (
    <div className="flex-1 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">{collectionName}</h2>
      
      {/* Filter & Sort Button */}
      <div className="flex justify-end mb-4">
        <button 
          className="flex items-center text-sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Filter & Sort
        </button>
      </div>

      {/* Filter & Sort Panel */}
      {isFilterOpen && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md animate-fade-in">
          <h3 className="font-medium mb-3">Sort by Price</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="sort"
                checked={sortBy === 'price_asc'}
                onChange={() => setSortBy('price_asc')}
                className="mr-2"
              />
              Price: Low to High
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sort"
                checked={sortBy === 'price_desc'}
                onChange={() => setSortBy('price_desc')}
                className="mr-2"
              />
              Price: High to Low
            </label>
            {sortBy && (
              <button 
                className="text-sm text-blue-600 mt-2"
                onClick={() => setSortBy(undefined)}
              >
                Clear Sort
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {/* Product Grid */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="block mb-6">
              <div className="bg-gray-100 aspect-[3/4] mb-2 relative overflow-hidden">
                {/* Product image with hover effect for second image */}
                {product.images && product.images.length > 0 && (
                  <>
                    <Image 
                      src={product.images[0]} 
                      alt={product.name}
                      fill
                      className="object-cover transition-opacity duration-300 ease-in-out hover:opacity-0"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    {product.images.length > 1 && (
                      <Image 
                        src={product.images[1]} 
                        alt={`${product.name} alternate view`}
                        fill
                        className="object-cover opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    )}
                  </>
                )}
                {(!product.images || product.images.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    {product.name}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-sm mt-1 font-bold">{product.price}د.إ</p>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found in this collection</p>
          <Link href="/" className="mt-4 inline-block text-blue-600">
            Return to home
          </Link>
        </div>
      )}
    </div>
  );
}
