import { useRouter } from "next/router";
import { ShoppingCart, Package, Star, X, Sparkles } from "lucide-react";

export default function RecommendationsModal({
  isOpen,
  onClose,
  recommendations = [],
  onProductClick,
  onViewCart,
}) {
  const router = useRouter();

  if (!isOpen || recommendations.length === 0) return null;

  const handleProductClick = (productId) => {
    // Navigate to product
    router.push(`/customer/product/${productId}`);
    // Call parent's onProductClick which will close the modal
    if (onProductClick) {
      onProductClick(productId);
    }
  };
  console.log(recommendations);

  const handleViewCart = () => {
    onClose();
    onViewCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 sm:p-8 transform transition-all animate-modal-enter max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              You Might Also Love These! ✨
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Handpicked just for you based on your taste
            </p>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {recommendations.map((rec, idx) => (
              <button
                key={rec.id}
                onClick={() => handleProductClick(rec.id)}
                className="group text-left w-full"
              >
                <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative h-40 sm:h-48 bg-gray-100 overflow-hidden">
                    {rec.img ? (
                      <img
                        src={rec.img}
                        alt={rec.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}

                    {/* Reason Badge */}
                    {rec.reason && (
                      <div className="absolute top-2 left-2 right-2">
                        <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                          {rec.reason}
                        </span>
                      </div>
                    )}

                    {/* Rating Badge - Top Right */}
                    {rec.averageRating > 0 && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-900">
                            {rec.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stock Badge */}
                    {rec.stock < 5 && rec.stock > 0 && (
                      <div className="absolute bottom-2 right-2">
                        <span className="inline-block px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                          Only {rec.stock} left!
                        </span>
                      </div>
                    )}

                    {/* Out of Stock Badge */}
                    {rec.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {rec.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        ${rec.price}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {rec.category}
                      </span>
                    </div>
                    {rec.score && (
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{rec.score.toFixed(1)}% match</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleViewCart}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              View Cart
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}