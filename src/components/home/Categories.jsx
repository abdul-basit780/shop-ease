import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/public/categories');
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', icon: 'bg-blue-100' },
      { bg: 'from-purple-500 to-purple-600', icon: 'bg-purple-100' },
      { bg: 'from-pink-500 to-pink-600', icon: 'bg-pink-100' },
      { bg: 'from-green-500 to-green-600', icon: 'bg-green-100' },
      { bg: 'from-orange-500 to-orange-600', icon: 'bg-orange-100' },
      { bg: 'from-red-500 to-red-600', icon: 'bg-red-100' },
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Category</span>
            </h2>
            <p className="text-xl text-gray-600">Loading categories...</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                <div className="h-16 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">SHOP BY CATEGORY</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Collections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing products across all categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, idx) => {
            const colors = getCategoryColor(idx);
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative bg-white rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border border-gray-100 overflow-hidden h-full flex flex-col items-center justify-center">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon Circle */}
                  <div className={`relative w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center text-white text-3xl font-bold transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg group-hover:shadow-2xl`}>
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-300 text-lg mb-2 line-clamp-2">
                    {category.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 group-hover:text-gray-700 transition-colors">
                    {category.description}
                  </p>
                  
                  {/* Explore Link */}
                  <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300 mt-auto">
                    <span className="text-sm text-primary-600 font-medium flex items-center justify-center">
                      Explore <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/categories">
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              View All Categories
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}