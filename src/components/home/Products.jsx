import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Star, TrendingUp, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import toast from 'react-hot-toast';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProducts();
    checkUser();
    
    // Listen for auth changes
    window.addEventListener('userLoggedIn', checkUser);
    window.addEventListener('userLoggedOut', handleLogout);
    
    return () => {
      window.removeEventListener('userLoggedIn', checkUser);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

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
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      toast.error('Please login to add items to cart', {
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
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      toast.success('Quantity updated in cart!', {
        icon: '🛒',
        style: {
          borderRadius: '12px',
          background: '#0ea5e9',
          color: '#fff',
        },
      });
    } else {
      cart.push({ ...product, quantity: 1 });
      toast.success('Added to cart!', {
        icon: '🛒',
        style: {
          borderRadius: '12px',
          background: '#0ea5e9',
          color: '#fff',
        },
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
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
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find(item => item.id === product.id);
    
    if (exists) {
      toast('Already in wishlist!', {
        icon: '💜',
        style: {
          borderRadius: '12px',
          background: '#8b5cf6',
          color: '#fff',
        },
      });
      return;
    }
    
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
    toast.success('Added to wishlist!', {
      icon: '❤️',
      style: {
        borderRadius: '12px',
        background: '#d946ef',
        color: '#fff',
      },
    });
  };

  // Different animation classes for variety
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
        {/* Header */}
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
            <Link href="/products">
              <button className="hidden md:inline-flex items-center px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                View All
              </button>
            </Link>
          )}
        </div>

        {/* Products Grid with Varied Animations */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div 
                key={product.id} 
                className={`group ${getAnimationClass(idx)}`}
                style={{ 
                  animationDelay: `${idx * 150}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 border border-gray-100">
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

                    {/* Hover Overlay - View Details Button Only */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Link href={`/products/${product.id}`}>
                          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-500 shadow-lg">
                            <Eye className="h-5 w-5" />
                            <span>View Details</span>
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Stock Badge */}
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

                    {/* Wishlist Icon - Top Right (Always Visible) */}
                    <button
                      onClick={(e) => handleAddToWishlist(e, product)}
                      className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 hover:bg-white hover:scale-110 transition-all shadow-lg z-10"
                      title="Add to wishlist"
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    {/* Category */}
                    <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                      {product.categoryName}
                    </p>

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-600">(24)</span>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed duration-300"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>

                  {/* Glow Border on Hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent  opacity-50 blur-sm"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment</p>
          </div>
        )}

        {/* Mobile View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12 md:hidden">
            <Link href="/products">
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