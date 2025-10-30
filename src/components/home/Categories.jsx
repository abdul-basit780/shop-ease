import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoScrollInterval = useRef(null);
  const isScrolling = useRef(false);
  const DISPLAY_LIMIT = 8;

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/api/public/categories`);
        
        if (response.success && response.data?.categories && isMounted) {
          const subcategories = response.data.categories.filter(cat => cat.parentId != null);
          setCategories(subcategories.slice(0, DISPLAY_LIMIT));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) {
          toast.error('Failed to load categories');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    checkScrollButtons();
  }, [categories]);

  // Infinite loop auto-scroll effect
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        if (scrollContainerRef.current && !isScrolling.current) {
          const container = scrollContainerRef.current;
          const scrollAmount = 1; // Smooth continuous scroll
          
          container.scrollLeft += scrollAmount;
          
          // When we've scrolled past the original items, reset to beginning
          const maxScroll = container.scrollWidth / 2;
          if (container.scrollLeft >= maxScroll) {
            container.scrollLeft = 0;
          }
        }
      }, 15); // Run every 15ms for smooth animation
    };

    if (categories.length > 0) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [categories]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleMouseEnter = () => {
    isScrolling.current = true;
  };

  const handleMouseLeave = () => {
    isScrolling.current = false;
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      isScrolling.current = true;
      
      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
      
      setTimeout(() => {
        isScrolling.current = false;
        checkScrollButtons();
      }, 500);
    }
  };

  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', icon: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      { bg: 'from-purple-500 to-purple-600', icon: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      { bg: 'from-pink-500 to-pink-600', icon: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
      { bg: 'from-green-500 to-green-600', icon: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      { bg: 'from-red-500 to-red-600', icon: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      { bg: 'from-teal-500 to-teal-600', icon: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      { bg: 'from-indigo-500 to-indigo-600', icon: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    ];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (name) => {
    const icons = {
      'women': '👗',
      'mens': '👔',
      'men': '👔',
      'kids': '🧸',
      'electronics': '📱',
      'home': '🏠',
      'sports': '⚽',
      'beauty': '💄',
      'books': '📚',
      'toys': '🎮',
      'food': '🍔',
      'health': '💊'
    };
    const lowerName = name.toLowerCase();
    return icons[lowerName] || name.charAt(0).toUpperCase();
  };

  // Duplicate categories for infinite loop effect
  const duplicatedCategories = [...categories, ...categories];

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
              SHOP BY CATEGORY
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600">Loading categories...</p>
          </div>

          <div className="flex gap-6 overflow-hidden">
            {[...Array(DISPLAY_LIMIT)].map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-64 h-80 bg-white rounded-3xl p-6 shadow-md animate-pulse border-2 border-gray-100">
                <div className="h-28 w-28 bg-gray-200 rounded-3xl mb-5 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded mb-2 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No categories available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
            SHOP BY CATEGORY
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Collections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing products across our curated categories
          </p>
        </div>

        {/* Slider Container */}
        <div 
          className="relative group mb-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 border-2 border-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-600 hover:text-primary-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 border-2 border-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Scrollable Categories - Infinite Loop */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {duplicatedCategories.map((category, idx) => {
              const colors = getCategoryColor(idx % categories.length);
              const icon = getCategoryIcon(category.name);
              return (
                <Link
                  key={`${category.id}-${idx}`}
                  href={`/customer/all-products?subcategoryId=${category.id}`}
                  className="group animate-scale-in flex-shrink-0"
                  style={{ animationDelay: `${(idx % categories.length) * 50}ms` }}
                >
                  <div className={`relative bg-white rounded-3xl p-6 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border-2 ${colors.border} overflow-hidden w-64 h-80 flex flex-col items-center justify-center`}>
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    
                    {/* Icon Circle */}
                    <div className={`relative w-28 h-28 mx-auto mb-5 bg-gradient-to-br ${colors.bg} rounded-3xl flex items-center justify-center text-white text-5xl font-bold transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-xl group-hover:shadow-2xl`}>
                      {icon}
                    </div>
                    
                    {/* Category Name */}
                    <h3 className={`font-bold text-gray-900 group-hover:${colors.text} transition-colors duration-300 text-2xl mb-3 line-clamp-1 px-2 capitalize`}>
                      {category.name}
                    </h3>
                    
                    {/* Description */}
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 px-2 group-hover:text-gray-700 transition-colors">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Explore Button */}
                    <div className="mt-auto">
                      <span className={`inline-flex items-center px-5 py-2.5 ${colors.icon} ${colors.text} font-semibold rounded-xl group-hover:shadow-md transition-all`}>
                        Shop Now <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>

                    {/* Corner Decoration */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full`}></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* View All Button - Separate from slider */}
        <div className="text-center animate-fade-in">
          <Link href="/customer/all-categories">
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
              <span className="mr-2">View All Categories</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 animate-fade-in">
          <p className="text-gray-600 mb-4 text-lg">Can't find what you're looking for?</p>
          <Link href="/customer/all-products">
            <button className="inline-flex items-center px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transform hover:scale-105 transition-all duration-300">
              Browse All Products
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}