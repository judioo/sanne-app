'use client'

import Image from "next/image";
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../server/routers/index";
import { useRouter, useSearchParams } from "next/navigation";
import GarmentIcon from "./components/GarmentIcon";
import TryOnList from "./components/TryOnList";

// Define type for product data from tRPC
type RouterOutput = inferRouterOutputs<AppRouter>;
type ProductType = {
  id: number;
  name: string;
  price: string;
  numericPrice: number;
  images: string[];
  collections: string[];
  category: "men" | "women";
  productUrl?: string;
};

// Store listings state in a module-level variable
// This will persist between page navigations
let cachedProducts: ProductType[] = [];
let cachedCategory: 'all' | 'men' | 'women' = 'all';
let cachedSortBy: 'price_asc' | 'price_desc' | undefined = undefined;
let cachedSearchTerm: string = "";
let cachedPage: number = 1;

// Main component that doesn't use useSearchParams directly
export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomeContent />
    </Suspense>
  );
}

// Loading spinner component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  );
}

// Actual content component that uses useSearchParams
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(true);
  const [category, setCategory] = useState<'all' | 'men' | 'women'>(cachedCategory);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | undefined>(cachedSortBy);
  const [searchTerm, setSearchTerm] = useState(cachedSearchTerm);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(cachedPage);
  const [allProducts, setAllProducts] = useState<ProductType[]>(cachedProducts);
  const [hasMore, setHasMore] = useState(true);
  const [hasPendingTryOn, setHasPendingTryOn] = useState(false);
  const [pendingTryOnCount, setPendingTryOnCount] = useState(0);
  const [garmentColor, setGarmentColor] = useState('#a1a561');
  const [showTryOnList, setShowTryOnList] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialLoad = useRef(cachedProducts.length === 0);
  const isProcessingData = useRef(false);
  
  // Memoize query input to prevent unnecessary refetches
  const queryInput = useMemo(() => ({
    category,
    sortBy,
    search: searchTerm,
    collection: "New Arrivals",
    page: currentPage,
    limit: 12,
  }), [category, sortBy, searchTerm, currentPage]);
  
  // Fetch all collections for the side menu - with caching
  const { data: collections = [] } = trpc.products.getCollections.useQuery();

  // Fetch products using tRPC with pagination - optimized with conditions
  const { data: productData, isLoading, isFetching } = trpc.products.getAll.useQuery(queryInput, {
    // Only run the query if we need to fetch data (initial load or filter change)
    enabled: isInitialLoad.current || 
             category !== cachedCategory || 
             sortBy !== cachedSortBy || 
             searchTerm !== cachedSearchTerm ||
             currentPage > cachedPage
  });
  
  // Optimized handling of product data changes with better performance
  useEffect(() => {
    // Avoid processing if we've already started or don't have data
    if (isProcessingData.current || !productData) return;
    
    try {
      // Mark as processing to prevent re-entrancy
      isProcessingData.current = true;
      
      // Fast path optimization - if this is a subsequent page with no filter changes
      if (currentPage > 1 && 
          category === cachedCategory && 
          sortBy === cachedSortBy && 
          searchTerm === cachedSearchTerm) {
        
        // Directly append products without creating intermediate arrays
        setAllProducts(prev => [...prev, ...productData.products]);
        setHasMore(productData.pagination.hasMore);
        
        // Only update the cached page
        cachedPage = currentPage;
      } 
      // Filter change path - reset and replace all products
      else if (currentPage === 1 || 
               category !== cachedCategory || 
               sortBy !== cachedSortBy || 
               searchTerm !== cachedSearchTerm) {
               
        // Update all states in a batch
        setAllProducts(productData.products);
        setHasMore(productData.pagination.hasMore);
        
        // Update cache values
        cachedProducts = productData.products;
        cachedCategory = category;
        cachedSortBy = sortBy;
        cachedSearchTerm = searchTerm;
        cachedPage = currentPage;
      }
      
      // Always mark initial load as complete
      isInitialLoad.current = false;
    } finally {
      // Always reset processing flag when done
      isProcessingData.current = false;
    }
  }, [productData, currentPage, category, sortBy, searchTerm]);
  
  // Reset pagination when filters change - separated from data processing for better performance
  useEffect(() => {
    if ((category !== cachedCategory) || 
        (sortBy !== cachedSortBy) || 
        (searchTerm !== cachedSearchTerm)) {
      setCurrentPage(1);
      // Don't clear products here, wait for the new data
    }
  }, [category, sortBy, searchTerm]);

  // Update URL with filters for better back button behavior
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (sortBy) params.set('sortBy', sortBy);
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const url = params.toString() ? `/?${params.toString()}` : '/';
    window.history.replaceState({}, '', url);
  }, [category, sortBy, searchTerm, currentPage]);

  // Restore filters from URL on initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      const categoryParam = searchParams.get('category') as 'all' | 'men' | 'women' | null;
      const sortByParam = searchParams.get('sortBy') as 'price_asc' | 'price_desc' | null;
      const searchParam = searchParams.get('search');
      const pageParam = searchParams.get('page');
      
      if (categoryParam && ['all', 'men', 'women'].includes(categoryParam)) {
        setCategory(categoryParam);
        cachedCategory = categoryParam;
      }
      
      if (sortByParam && ['price_asc', 'price_desc'].includes(sortByParam)) {
        setSortBy(sortByParam);
        cachedSortBy = sortByParam;
      }
      
      if (searchParam) {
        setSearchTerm(searchParam);
        cachedSearchTerm = searchParam;
      }
      
      if (pageParam && !isNaN(Number(pageParam))) {
        const page = Number(pageParam);
        setCurrentPage(page);
        cachedPage = page;
      }
    }
  }, [searchParams]);

  // Intersection Observer for infinite scrolling with better performance
  const lastProductElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetching || !hasMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isProcessingData.current) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { 
      threshold: 0.2, // Lower threshold for earlier loading
      rootMargin: '100px' // Start loading before item is fully visible
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [isLoading, isFetching, hasMore]);

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Focus the search input when search is opened
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('#main-menu') && !target.closest('#menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Check for pending try-on items in localStorage
  useEffect(() => {
    const checkPendingTryOn = () => {
      const storedItems = localStorage.getItem('tryOnItems');
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          const now = new Date();
          
          // Filter out old items and count pending items
          const validItems = items.filter((item: any) => {
            const timestamp = new Date(item.timestamp);
            const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
            return hoursSinceCreated < 24;
          });
          
          // Count pending and ready items
          const pendingCount = validItems.filter((item: any) => item.status === 'pending').length;
          const readyCount = validItems.filter((item: any) => item.status === 'ready').length;
          
          // Update status based on pending and ready counts
          setHasPendingTryOn(pendingCount > 0 || readyCount > 0);
          setPendingTryOnCount(pendingCount + readyCount);
          
          // Update localStorage with filtered items
          if (validItems.length !== items.length) {
            localStorage.setItem('tryOnItems', JSON.stringify(validItems));
          }
          
          // Set garment color based on ready/pending status
          if (readyCount > 0) {
            // Use a slightly brighter color when there are ready items
            setGarmentColor('#b1b571');
          } else if (pendingCount > 0) {
            // Use the standard olive color for pending items
            setGarmentColor('#a1a561');
          } else {
            // Default color
            setGarmentColor('#a1a561');
          }
        } catch (e) {
          console.error('Error parsing tryOnItems:', e);
          localStorage.removeItem('tryOnItems');
          setHasPendingTryOn(false);
          setPendingTryOnCount(0);
        }
      } else {
        setHasPendingTryOn(false);
        setPendingTryOnCount(0);
      }
    };
    
    checkPendingTryOn();
    
    // Check on visibility change and periodically
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingTryOn();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check every 30 seconds for status updates
    const interval = setInterval(checkPendingTryOn, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  // Toggle try-on list visibility when garment icon is clicked
  const toggleTryOnList = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation to /cart
    setShowTryOnList(!showTryOnList);
  };

  // Close try-on list
  const closeTryOnList = () => {
    setShowTryOnList(false);
    // Recheck pending items after closing the list
    // This ensures the notification dot updates correctly after removing items
    const storedItems = localStorage.getItem('tryOnItems');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        const now = new Date();
        
        // Filter and count
        const validItems = items.filter((item: any) => {
          const timestamp = new Date(item.timestamp);
          const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
          return hoursSinceCreated < 24;
        });
        
        const pendingCount = validItems.filter((item: any) => item.status === 'pending').length;
        const readyCount = validItems.filter((item: any) => item.status === 'ready').length;
        
        setHasPendingTryOn(pendingCount > 0 || readyCount > 0);
        setPendingTryOnCount(pendingCount + readyCount);
      } catch (e) {
        console.error('Error rechecking tryOnItems:', e);
      }
    }
  };

  // Desktop view with QR code
  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Image
          src="/sanne-transparent.png"
          alt="Sanne Logo"
          width={200}
          height={80}
          priority
        />
        <h1 className="text-2xl font-bold mt-8 mb-4">This site is optimized for mobile devices</h1>
        <p className="mb-8">Please scan the QR code below to visit on your mobile device</p>
        <div className="border p-4 inline-block bg-white">
          <Image
            src="/sanne-qrcode.png"
            alt="QR Code"
            width={200}
            height={200}
            priority
          />
        </div>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 shadow-sm">
        <div className="flex justify-between items-center p-4">
          <button 
            id="menu-button"
            className="text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <Link href="/" className="flex-1 flex justify-center">
            <Image
              src="/sanne-transparent.png"
              alt="Sanne Logo"
              width={120}
              height={40}
              priority
              className="mx-auto"
            />
          </Link>
          
          <div className="flex space-x-4">
            <button 
              className="text-gray-700"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            <div className="relative">
              <button 
                onClick={toggleTryOnList}
                className="text-gray-700 relative"
              >
                {/* Garment icon with notification dot */}
                <GarmentIcon color={garmentColor} className="w-6 h-6" />
                
                {/* Notification dot for pending try-on */}
                {hasPendingTryOn && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full flex items-center justify-center">
                    {pendingTryOnCount > 1 ? (
                      <span className="text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                        {pendingTryOnCount > 9 ? '9+' : pendingTryOnCount}
                      </span>
                    ) : (
                      <div className="w-3 h-3"></div>
                    )}
                  </div>
                )}
              </button>
              
              {/* Try-on list popup */}
              {showTryOnList && <TryOnList onClose={closeTryOnList} />}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="px-4 pb-4 animate-fade-in">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                className="w-full p-2 border rounded-md pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-5 h-5 absolute left-2 top-2.5 text-gray-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {searchTerm && (
                <button 
                  className="absolute right-2 top-2.5 text-gray-400"
                  onClick={() => setSearchTerm("")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Category Tabs */}
        <div className="flex justify-around border-b">
          <button
            className={`flex-1 py-2 px-4 ${
              category === 'all' ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          <button
            className={`flex-1 py-2 px-4 ${
              category === 'women' ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setCategory('women')}
          >
            Women
          </button>
          <button
            className={`flex-1 py-2 px-4 ${
              category === 'men' ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setCategory('men')}
          >
            Men
          </button>
          <button
            className={`flex-1 py-2 px-4 flex items-center justify-center ${
              isFilterOpen ? 'border-b-2 border-black' : ''
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>
        </div>
      </header>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div 
            id="main-menu"
            className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg transform transition-transform animate-slide-in"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button 
                  className="text-gray-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-4">
                <Link href="/" className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  Home
                </Link>
                <Link href="#" className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  Wishlist
                </Link>
                <Link href="#" className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Cart
                </Link>
                <Link href="#" className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  Profile
                </Link>
              </nav>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Collections</h3>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <Link 
                      key={collection} 
                      href={`/collections/${encodeURIComponent(collection)}`}
                      className="block py-1 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {collection}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Filter Options */}
        {isFilterOpen && (
          <div className="bg-white p-4 mb-4 rounded-md shadow">
            <h3 className="font-medium mb-2">Sort By</h3>
            <div className="space-y-2">
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
        
        {/* Initial Loading State */}
        {isLoading && allProducts.length === 0 && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {/* Product Grid - with performance optimizations */}
        {allProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {allProducts.map((product, index) => {
              // If this is the last product and there's more to load, attach the ref
              const isLastProduct = index === allProducts.length - 1 && hasMore;
              
              return (
                <div key={`${product.id}-${index}`} ref={isLastProduct ? lastProductElementRef : null}>
                  <Link 
                    href={`/product/${product.id}`} 
                    className="block mb-6"
                  >
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
                            priority={index < 4} // Only prioritize first 4 images
                            loading={index >= 4 ? "lazy" : undefined} // Lazy load non-critical images
                          />
                          {product.images.length > 1 && (
                            <Image 
                              src={product.images[1]} 
                              alt={`${product.name} alternate view`}
                              fill
                              className="object-cover opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
                              sizes="(max-width: 768px) 50vw, 33vw"
                              loading="lazy" // Lazy load secondary images
                            />
                          )}
                        </>
                      )}
                    </div>
                    <h3 className="font-medium mb-1 truncate">{product.name}</h3>
                    <p className="text-gray-700">{product.price}د.إ</p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Loading More Indicator */}
        {(isFetching && allProducts.length > 0) && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {/* No Results */}
        {!isLoading && allProducts.length === 0 && !isInitialLoad.current && (
          <div className="py-10 text-center">
            <p className="text-gray-500">No products found.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategory('all');
                setSortBy(undefined);
              }}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 px-4">
        <div className="mb-4">
          <Image
            src="/sanne-transparent.png"
            alt="Sanne Logo"
            width={100}
            height={40}
          />
        </div>
        <div className="text-sm text-gray-600">
          <p className="mb-2"> 2023 Sanne. All rights reserved.</p>
          <p>Luxury fashion at your fingertips.</p>
        </div>
      </footer>
    </div>
  );
}
