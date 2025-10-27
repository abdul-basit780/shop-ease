import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Flame } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/public/recommendations/popular');
      console.log(response)
      if (response.success && response.data?.products) {
        setProducts(response.data.products.slice(0, 8)); // Show first 8 products
      }
    } catch (error) {
      console.error('Error fetching popular products:', error);
      toast.error('Failed to load popular products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Added to cart!', {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: '#0ea5e9',
        color: '#fff',
      },
    });
  };

  const handleAddToWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.find(item => item.id === product.id);
    
    if (!exists) {
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
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">This Week</span>
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
                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">This Week</span>
              </h2>
              <p className="text-gray-600">Trending products everyone is buying</p>
            </div>
          </div>
          {products.length > 0 && (
            <Link href="/products?popular=true">
              <button className="hidden md:inline-flex items-center px-6 py-3 text-orange-600 hover:text-orange-700 font-semibold border-2 border-orange-600 rounded-xl hover:bg-orange-50 transition-all duration-300 transform hover:scale-105">
                View All
              </button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group animate-scale-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-gray-100">
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
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                        
                        <button
                          onClick={(e) => handleAddToWishlist(e, product)}
                          className="p-2 bg-white text-gray-600 rounded-lg hover:text-red-500 transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                        >
                          <Heart className="h-5 w-5" />
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
                  <div className="p-5">
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
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-600">(42)</span>
                    </div>

                    {/* Price and Cart */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-orange-600">
                          ${product.price}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No popular products available at the moment</p>
          </div>
        )}

        {/* Mobile View All Button */}
        {products.length > 0 && (
          <div className="text-center mt-12 md:hidden">
            <Link href="/products?popular=true">
              <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                View All Popular Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}