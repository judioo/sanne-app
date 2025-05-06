'use client'

import Image from "next/image";
import { useState, useEffect } from "react";

// Product data
const products = [
  {
    id: 1,
    name: "Gianna green silk dress",
    price: "5,985",
    image: "/product-images/green-dress.jpg",
    category: "women",
  },
  {
    id: 2,
    name: "The Luna dress",
    price: "5,090",
    image: "/product-images/luna-dress.jpg",
    category: "women",
  },
  {
    id: 3,
    name: "Azul jeans",
    price: "4,030",
    image: "/product-images/azul-jeans.jpg",
    category: "men",
  },
  {
    id: 4,
    name: "Sunset indigo skirt",
    price: "5,970",
    image: "/product-images/indigo-skirt.jpg",
    category: "women",
  },
  {
    id: 5,
    name: "Malibu Midnight bohemian skirt",
    price: "4,685",
    image: "/product-images/bohemian-skirt.jpg",
    category: "women",
  },
  {
    id: 6,
    name: "Malibu Midnight backless top",
    price: "2,400",
    image: "/product-images/backless-top.jpg",
    category: "women",
  },
  {
    id: 7,
    name: "Daydream Corset Top",
    price: "3,585",
    image: "/product-images/corset-top.jpg",
    category: "women",
  },
  {
    id: 8,
    name: "Terra luxe leather jacket",
    price: "9,525",
    image: "/product-images/leather-jacket.jpg",
    category: "men",
  },
  {
    id: 9,
    name: "Classic Oxford Shirt",
    price: "3,250",
    image: "/product-images/oxford-shirt.jpg",
    category: "men",
  },
  {
    id: 10,
    name: "Urban Slim Chinos",
    price: "4,150",
    image: "/product-images/chinos.jpg",
    category: "men",
  },
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(true);
  const [category, setCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(products);

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
    // Filter products based on selected category
    if (category === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === category));
    }
  }, [category]);

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
          <button className="text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <div className="flex-1 flex justify-center">
            <Image
              src="/sanne-transparent.png"
              alt="Sanne Logo"
              width={120}
              height={40}
              priority
              className="mx-auto"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            <button className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex justify-center p-4 border-b">
        <div className="flex space-x-6">
          <button 
            className={`pb-2 ${category === 'all' ? 'font-bold border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          <button 
            className={`pb-2 ${category === 'women' ? 'font-bold border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setCategory('women')}
          >
            Women
          </button>
          <button 
            className={`pb-2 ${category === 'men' ? 'font-bold border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setCategory('men')}
          >
            Men
          </button>
        </div>
      </div>

      {/* New Arrivals Section */}
      <main className="flex-1 p-4">
        <h2 className="text-2xl font-bold text-center mb-6">New Arrivals</h2>
        
        {/* Filter & Sort Button */}
        <div className="flex justify-end mb-4">
          <button className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filter & Sort
          </button>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="mb-6">
              <div className="bg-gray-100 aspect-[3/4] mb-2 relative">
                {/* Placeholder for product image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  {product.name}
                </div>
              </div>
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-sm mt-1 font-bold">{product.price}د.إ</p>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-white border-t py-3 px-6">
        <div className="flex justify-between">
          <button className="flex flex-col items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Home
          </button>
          <button className="flex flex-col items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            Wishlist
          </button>
          <button className="flex flex-col items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Cart
          </button>
          <button className="flex flex-col items-center text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Profile
          </button>
        </div>
      </nav>
    </div>
  );
}
