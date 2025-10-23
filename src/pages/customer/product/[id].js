import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingCart, Heart, Star, ArrowLeft, Package, Truck, 
  Shield, RotateCcw, Plus, Minus, ChevronRight, User 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [product, setProduct] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchFeedbacks();
      fetchSimilarProducts();
      checkWishlist();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/public/products/${id}`);
      
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await apiClient.get(
        `/api/public/products/${id}/feedbacks?page=1&limit=10&sortBy=createdAt&sortOrder=desc`
      );
      
      if (response.success && response.data) {
        setFeedbacks(response.data.feedbacks || []);
        setFeedbackStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await apiClient.get(
        `/api/public/recommendations/similar/${id}?limit=4`
      );
      
      if (response.success && response.data) {
        setSimilarProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const checkWishlist = async () => {
    if (!authService.isAuthenticated()) return;
    
    try {
      const response = await apiClient.get('/api/customer/wishlist');
      if (response.success && response.data?.products) {
        const inWishlist = response.data.products.some(p => p.productId === id);
        setIsInWishlist(inWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
  if (!authService.isAuthenticated()) {
    toast.error('Please login to add items to cart', {
      icon: '🔒',
    });
    router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
    return;
  }

  try {
    const response = await apiClient.post('/api/customer/cart', {
      productId: product.id,
      quantity: quantity
    });
    
    if (response.success) {
      // Dispatch event to update cart count in header/navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success(`Added ${quantity} item(s) to cart!`, {
        icon: '🛒',
      });
      
      // Optional: Reset quantity to 1 after successful add
      setQuantity(1);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    // Handle specific error messages from the API
    const errorMessage = error.response?.data?.message || 'Failed to add to cart';
    toast.error(errorMessage);
  }
};

  const handleAddToWishlist = async () => {
    if (!authService.isAuthenticated()) {
      toast.error('Please login to add items to wishlist', {
        icon: '🔒',
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    try {
      const response = await apiClient.post('/api/customer/wishlist', {
        productId: product.id
      });
      
      if (response.success) {
        setIsInWishlist(true);
        toast.success('Added to wishlist!', {
          icon: '❤️',
        });
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const displayedReviews = showAllReviews ? feedbacks : feedbacks.slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link href="/products">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Back to Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 animate-fade-in">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Home
          </Link>
          <ChevronRight className="inline h-4 w-4 mx-2 text-gray-400" />
          <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
            Products
          </Link>
          <ChevronRight className="inline h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-600">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                {product.img ? (
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover"
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
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              </div>
              
              {product.stock < 5 && product.stock > 0 && (
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-orange-800 text-sm font-medium">
                  ⚠️ Only {product.stock} left in stock!
                </div>
              )}
              
              {product.stock === 0 && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-800 text-sm font-bold">
                  ❌ Out of Stock
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in animation-delay-300">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold uppercase">
                {product.categoryName}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {feedbackStats && feedbackStats.totalReviews > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(feedbackStats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {feedbackStats.averageRating.toFixed(1)} ({feedbackStats.totalReviews} reviews)
                </span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-5xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-20 text-center font-bold text-lg py-3 border-0 focus:outline-none"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-gray-600">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleAddToWishlist}
                disabled={isInWishlist}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-110 ${
                  isInWishlist
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Truck, text: 'Free Shipping', subtext: 'On orders $50+' },
                { icon: Shield, text: 'Secure Payment', subtext: '100% protected' },
                { icon: RotateCcw, text: '30-Day Returns', subtext: 'Easy returns' },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">{feature.text}</div>
                      <div className="text-sm text-gray-600">{feature.subtext}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {feedbacks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              {feedbackStats && (
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {feedbackStats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">
                    out of 5 ({feedbackStats.totalReviews} reviews)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {displayedReviews.map((feedback, idx) => (
                <div
                  key={feedback.id || idx}
                  className="bg-white rounded-2xl shadow-md p-6 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {feedback.customerName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.comment}</p>
                </div>
              ))}
            </div>

            {feedbacks.length > 2 && !showAllReviews && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                >
                  See All Reviews ({feedbacks.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Similar Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similar, idx) => (
                <Link
                  key={similar.id}
                  href={`/products/${similar.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative h-48 bg-gray-100">
                      {similar.img ? (
                        <img
                          src={similar.img}
                          alt={similar.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {similar.name}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${similar.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}