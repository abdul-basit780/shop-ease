import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Star, Flame, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import { useCartWishlist } from '@/contexts/CartWishlistContext';
import toast from 'react-hot-toast';

export default function TrendingProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const { addToWishlist, isInWishlist } = useCartWishlist();

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/public/recommendations/trending');
      
      if (response.success && response.data?.products) {
        setProducts(response.data.products.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching trending products:', error);
      toast.error('Failed to load trending products');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate effective price (base + minimum option price)
  const getEffectivePrice = (product) => {
    if (!product) return 0;

    let totalPrice = product.price;

    if (product.optionTypes && product.optionTypes.length > 0) {
      product.optionTypes.forEach((option) => {
        if (option.values && option.values.length > 0) {
          const minOptionPrice = Math.min(
            ...option.values.map((val) => {
              if (typeof val === "object" && val.price !== undefined) {
                return val.price;
              }
              return 0;
            })
          );
          totalPrice += minOptionPrice;
        }
      });
    }

    return totalPrice;
  };

  const handleAddToWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authService.isAuthenticated()) {
      toast.error("Please login to add items to wishlist", {
        icon: "🔒",
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setWishlistLoading(prev => ({ ...prev, [product.id]: true }));

    try {
      const result = await addToWishlist(product.id);
      
      if (result.success) {
        toast.success('Added to wishlist!', {
          icon: '❤️',
        });
      } else {
        toast.error(result.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      toast.error('Failed to add to wishlist');
    } finally {
      setWishlistLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleViewDetails = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/customer/product/${productId}`);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Hot <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">This Week</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-md animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                Hot <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">This Week</span>
              </h2>
              <p className="text-gray-600">Trending products everyone is buying</p>
            </div>
          </div>
          {products.length > 0 && (
            <Link href="/customer/all-products?trending=true">
              <button className="hidden md:inline-flex items-center px-6 py-3 text-orange-600 hover:text-orange-700 font-semibold border-2 border-orange-600 rounded-xl hover:bg-orange-50 transition-all duration-300 transform hover:scale-105">
                View All
              </button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const effectivePrice = getEffectivePrice(product);
              const hasOptions = product.optionTypes && product.optionTypes.length > 0;
              const inWishlist = isInWishlist(product.id);
              const isWishlistLoading = wishlistLoading[product.id];
              
              return (
                <div 
                  key={product.id} 
                  onClick={() => router.push(`/customer/product/${product.id}`)}
                  className="group h-full animate-scale-in cursor-pointer" 
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative h-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
                    {/* Trending Badge */}
                    <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 animate-bounce">
                      <Flame className="h-3 w-3" />
                      <span>Trending</span>
                    </div>

                    {/* Image Container */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {product.img ? (
                        <img
                          src={product.img}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 text-4xl font-bold">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                          <button
                            onClick={(e) => handleViewDetails(e, product.id)}
                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="h-5 w-5" />
                            <span>View Details</span>
                          </button>
                          
                          <button
                            onClick={(e) => handleAddToWishlist(e, product)}
                            disabled={inWishlist || isWishlistLoading}
                            className={`p-2 bg-white rounded-lg transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 ${
                              inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                            } disabled:opacity-50`}
                          >
                            {isWishlistLoading ? (
                              <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                            ) : (
                              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Stock Badge */}
                      {product.stock === 0 && (
                        <div className="absolute top-14 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Out of Stock
                        </div>
                      )}
                      {product.stock > 0 && product.stock < 5 && (
                        <div className="absolute top-14 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          Only {product.stock} left
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Category */}
                      <p className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">
                        {product.category}
                      </p>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Rating */}
                     <div className="flex items-center mb-4">
                        {product.averageRating > 0 ? (
                          <>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.round(product.averageRating)
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-xs text-gray-600">
                              {product.averageRating.toFixed(1)} ({product.totalReviews || 0} reviews)
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No reviews yet</span>
                        )}
                      </div>

                      {/* Price and Cart */}
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-2xl font-bold text-orange-600">
                            ${effectivePrice.toFixed(2)}
                          </span>
                          {hasOptions && effectivePrice !== product.price && (
                            <span className="text-xs text-gray-500 block">
                              from ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => handleViewDetails(e, product.id)}
                          className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No trending products available at the moment</p>
          </div>
        )}

        {/* Mobile View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12 md:hidden">
            <Link href="/customer/all-products?trending=true">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                View All Trending Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}