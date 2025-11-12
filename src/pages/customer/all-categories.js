import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, Package, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/public/categories?limit=100');
        if (response.success && response.data?.categories && isMounted) {
          // Organize categories into parent-child structure
          const parentCategories = response.data.categories.filter(cat => cat.parentId === null);
          const categoriesWithChildren = parentCategories.map(parent => ({
            ...parent,
            children: response.data.categories.filter(cat => cat.parentId === parent.id)
          }));
          setCategories(categoriesWithChildren);
        }
      } catch (error) {
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
  }, []); // Empty dependency array - fetches on every mount

  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
      { bg: 'from-green-500 to-green-600', light: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      { bg: 'from-red-500 to-red-600', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
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
    };
    const lowerName = name.toLowerCase();
    return icons[lowerName] || '📦';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                All Categories
              </h1>
              <p className="text-xl text-gray-600">
                Browse through {categories.length} main categories
              </p>
            </div>
            <Link href="/customer/all-products">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                View All Products
              </button>
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => {
            const colors = getCategoryColor(idx);
            const icon = getCategoryIcon(category.name);

            return (
              <div
                key={category.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-blue-200 animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Category Header */}
                <Link href={`/customer/all-products?subcategoryId=${category.id}`}>
                  <div className={`relative p-6 bg-gradient-to-br ${colors.bg} cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform">
                          {icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white capitalize">
                            {category.name}
                          </h2>
                          {category.description && (
                            <p className="text-white/90 text-sm mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Subcategories */}
                <div className="p-6">
                  {category.children && category.children.length > 0 ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                        Subcategories ({category.children.length})
                      </h3>
                      <div className="space-y-2">
                        {category.children.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/customer/all-products?subcategoryId=${subcategory.id}`}
                            className={`flex items-center justify-between p-3 ${colors.light} hover:bg-opacity-80 rounded-lg transition-all group/sub cursor-pointer`}
                          >
                            <span className={`font-medium ${colors.text} capitalize`}>
                              {subcategory.name}
                            </span>
                            <ChevronRight className={`h-4 w-4 ${colors.text} group-hover/sub:translate-x-1 transition-transform`} />
                          </Link>
                        ))}
                      </div>
                      <Link href={`/customer/all-products?subcategoryId=${category.id}`}>
                        <button className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all">
                          View All {category.name}
                        </button>
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm mb-4">No subcategories</p>
                      <Link href={`/customer/all-products?subcategoryId=${category.id}`}>
                        <button className={`px-6 py-2.5 ${colors.light} ${colors.text} font-semibold rounded-lg hover:shadow-md transition-all`}>
                          Browse Products
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h2>
            <p className="text-gray-600">Check back later for new categories</p>
          </div>
        )}
      </div>

      <style jsx>{`
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
            transform: scale(0.95);
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
    </div>
  );
}