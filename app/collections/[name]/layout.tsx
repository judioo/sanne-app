'use client'

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../../../utils/trpc";
import GarmentIcon from "../../components/GarmentIcon";
import TryOnList from "../../components/TryOnList";
import { TOI_STATUS } from "../../../server/utils/toi-constants";

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTryOnList, setShowTryOnList] = useState(false);
  const [hasPendingTryOn, setHasPendingTryOn] = useState(false);
  const [pendingTryOnCount, setPendingTryOnCount] = useState(0);
  const [garmentColor, setGarmentColor] = useState('#a1a561');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch all collections for the side menu
  const { data: collections = [] } = trpc.products.getCollections.useQuery();
  
  // Toggle try-on list display
  const toggleTryOnList = () => {
    setShowTryOnList(!showTryOnList);
  };
  
  // Close try-on list
  const closeTryOnList = () => {
    setShowTryOnList(false);
  };
  
  // Check localStorage for pending try-on items
  useEffect(() => {
    const checkTryOnItems = () => {
      const storedItems = localStorage.getItem('tryOnItems');
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          
          // Filter out old items (older than 24 hours)
          const now = new Date();
          const filteredItems = items.filter((item: any) => {
            const timestamp = new Date(item.timestamp);
            const hoursSinceCreated = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
            return hoursSinceCreated < 24;
          });
          
          // Check for pending items
          const pendingItems = filteredItems.filter((item: any) => item.status !== TOI_STATUS.COMPLETED);
          setHasPendingTryOn(pendingItems.length > 0);
          setPendingTryOnCount(pendingItems.length);
          setGarmentColor('#a1a561');
        } catch (e) {
          console.error('Error checking try-on items:', e);
        }
      }
    };
    
    // Check initially and set up interval
    checkTryOnItems();
    const interval = setInterval(checkTryOnItems, 5000);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);

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
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
