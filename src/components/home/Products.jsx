import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Star, TrendingUp, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import { useCartWishlist } from '@/contexts/CartWishlistContext';
import toast from 'react-hot-toast';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});

  // Use context for wishlist
  const { wishlist, addToWishlist, isInWishlist } = useCartWishlist();

  useEffect(() => {
    fetchProducts();
    checkUser();
    
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleLogout);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const handleUserLogin = () => {
    checkUser();
  };

  const checkUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/public/products');
      if (response.success && response.data?.products) {
        setProducts(response.data.products.slice(0, 8));
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate minimum price: base + minimum price from each option type
  const getMinimumPrice = (product) => {
    let minPrice = product.price; // Start with base price
    
    // If product has option types, add the minimum price from each option type
    if (product.optionTypes && product.optionTypes.length > 0) {
      product.optionTypes.forEach(optionType => {
        if (optionType.values && optionType.values.length > 0) {
          // Find the minimum price among all values in this option type
          const minOptionPrice = Math.min(
            ...optionType.values.map(val => {
              if (typeof val === 'object' && val.price !== undefined) {
                return val.price;
              }
              return 0;
            })
          );
          
          minPrice += minOptionPrice;
        }
      });
    }
    
    return minPrice;
  };

  const handleAddToWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authService.isAuthenticated()) {
      toast.error('Please login to add items to wishlist', {
        icon: '🔒',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
      
      setTimeout(() => {
        router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      }, 1500);
      return;
    }
    
    setWishlistLoading(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const result = await addToWishlist(product.id);
      
      if (result.success) {
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: {
            borderRadius: '12px',
            background: '#d946ef',
            color: '#fff',
          },
        });
      } else {
        if (result.error && (result.error.includes('already') || result.error.includes('exists'))) {
          toast('Already in wishlist!', {
            icon: '💜',
            style: {
              borderRadius: '12px',
              background: '#8b5cf6',
              color: '#fff',
            },
          });
        } else {
          toast.error(result.error || 'Failed to add to wishlist', {
            style: {
              borderRadius: '12px',
              background: '#ef4444',
              color: '#fff',
            },
          });
        }
      }
    } catch (error) {
      toast.error('Failed to add to wishlist. Please try again.', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setWishlistLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const getAnimationClass = (idx) => {
    const animations = [
      'animate-fade-in-up',
      'animate-fade-in-down', 
      'animate-slide-in-left',
      'animate-slide-in-right',
      'animate-bounce-in',
      'animate-scale-in',
    ];
    return animations[idx % animations.length];
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Products</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-md animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Products</span>
              </h2>
              <p className="text-gray-600">Check out our best-selling items</p>
            </div>
          </div>
          {products.length > 0 && (
            <Link href="/customer/all-products">
              <button className="hidden md:inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                View All
              </button>
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const inWishlist = isInWishlist(product.id);
              const isWishlistLoading = wishlistLoading[product.id];
              const minPrice = getMinimumPrice(product);
              const hasOptions = product.optionTypes && product.optionTypes.length > 0;
              
              return (
                <div 
                  key={product.id} 
                   className={`group h-full ${getAnimationClass(idx)}`}
                  style={{ 
                    animationDelay: `${idx * 150}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="relative h-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 flex flex-col">
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {product.img ? (
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover md:object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      <div 
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                        style={{ display: product.img ? 'none' : 'flex' }}
                      >
                        <span className="text-gray-400 text-4xl font-bold">
                          {product.name.charAt(0)}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute bottom-4 left-4 right-4">
                          <Link href={`/customer/product/${product.id}`}>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-500 shadow-lg">
                              <Eye className="h-5 w-5" />
                              <span>View Details</span>
                            </button>
                          </Link>
                        </div>
                      </div>

                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce z-10">
                          Out of Stock
                        </div>
                      )}
                      {product.stock > 0 && product.stock < 5 && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse z-10">
                          Only {product.stock} left
                        </div>
                      )}

                      <button
                        onClick={(e) => handleAddToWishlist(e, product)}
                        disabled={inWishlist || isWishlistLoading}
                        className={`absolute top-3 right-3 p-2.5 backdrop-blur-sm rounded-full hover:scale-110 transition-all shadow-lg z-10 ${
                          inWishlist 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/95 text-gray-600 hover:text-red-500 hover:bg-white'
                        } disabled:opacity-50`}
                        title={inWishlist ? 'In wishlist' : 'Add to wishlist'}
                      >
                        {isWishlistLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        ) : (
                          <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                        {product.categoryName}
                      </p>

                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>

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

                      <div className="flex items-center justify-between">
                        <div>
                          {hasOptions ? (
                            <div>
                              <span className="text-sm font-normal text-gray-500 block">From</span>
                              <span className="text-2xl font-bold text-blue-600">
                                ${minPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-blue-600">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <Link
                          href={`/customer/product/${product.id}`}
                          className={`p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all transform hover:scale-110 duration-300 ${
                            product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="View product"
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-50 blur-sm"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment</p>
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-12 md:hidden">
            <Link href="/customer/all-products">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                View All Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}