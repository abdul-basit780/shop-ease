import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/auth-service";
import { useCartWishlist } from "@/contexts/CartWishlistContext";
import RecommendationsModal from "@/components/ProductRecommendationsModal";
import toast from "react-hot-toast";

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
  const [selectedOptions, setSelectedOptions] = useState({});
  const [displayImage, setDisplayImage] = useState("");
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Use context for cart and wishlist
  const { cart, addToCart, addToWishlist, isInWishlist } = useCartWishlist();

  // Check if there are stored recommendations on mount
  useEffect(() => {
    const storedRecs = sessionStorage.getItem('recommendationsModal');
    if (storedRecs) {
      try {
        const { recommendations: recs, show } = JSON.parse(storedRecs);
        setRecommendations(recs);
        setShowRecommendationsModal(show);
      } catch (e) {
        console.error('Error parsing stored recommendations:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchFeedbacks();
      fetchSimilarProducts();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      setDisplayImage(product.img);
    }
  }, [product]);

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/public/products/${id}`);

      if (response.success && response.data) {
        setProduct(response.data);

        if (response.data.optionTypes && response.data.optionTypes.length > 0) {
          const initialOptions = {};

          response.data.optionTypes.forEach((option) => {
            let selectedValue = null;

            if (option.values && option.values.length > 0) {
              selectedValue = option.values.find((val) => {
                if (typeof val === "object") {
                  return val.stock === undefined || val.stock > 0;
                }
                return true;
              });

              if (!selectedValue) {
                selectedValue = option.values[0];
              }

              if (typeof selectedValue === "string") {
                selectedValue = {
                  id: selectedValue,
                  value: selectedValue,
                  price: 0,
                  stock: undefined,
                };
              }
            }

            initialOptions[option.name] = selectedValue;
          });

          setSelectedOptions(initialOptions);
        }
      }
    } catch (error) {
      toast.error("Failed to load product");
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
      console.error("Error fetching feedbacks:", error);
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
      console.error("Error fetching similar products:", error);
    }
  };

  const handleOptionChange = (optionName, valueObj) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: valueObj,
    }));

    if (valueObj && valueObj.img) {
      setDisplayImage(valueObj.img);
    } else if (product.img) {
      setDisplayImage(product.img);
    }
  };

  const validateOptions = () => {
    if (!product.optionTypes || product.optionTypes.length === 0) {
      return true;
    }

    for (const option of product.optionTypes) {
      if (!selectedOptions[option.name] || !selectedOptions[option.name].id) {
        toast.error(`Please select ${option.name}`, {
          icon: "⚠️",
        });
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      toast.error("Please login to add items to cart", {
        icon: "🔒",
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!validateOptions()) {
      return;
    }

    setIsAddingToCart(true);

    try {
      const optionIds = product.optionTypes && product.optionTypes.length > 0
        ? Object.values(selectedOptions)
            .filter((opt) => opt && opt.id)
            .map((opt) => opt.id)
        : [];

      const result = await addToCart(product.id, quantity, optionIds);

      if (result.success) {
        toast.success(`Added ${quantity} item(s) to cart!`, {
          icon: "🛒",
        });

        setQuantity(1);
        
        // Fetch and show personalized recommendations
        fetchRecommendations();
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await apiClient.get("/api/customer/recommendations?limit=6");
      
      if (response.success && response.data?.recommendations) {
        const recs = response.data.recommendations;
        setRecommendations(recs);
        setShowRecommendationsModal(true);
        
        // Store in sessionStorage so it persists across page changes
        sessionStorage.setItem('recommendationsModal', JSON.stringify({
          recommendations: recs,
          show: true
        }));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const handleCloseRecommendations = () => {
    setShowRecommendationsModal(false);
    // Keep recommendations in sessionStorage but mark as closed
    const storedRecs = sessionStorage.getItem('recommendationsModal');
    if (storedRecs) {
      try {
        const data = JSON.parse(storedRecs);
        sessionStorage.setItem('recommendationsModal', JSON.stringify({
          ...data,
          show: false
        }));
      } catch (e) {
        sessionStorage.removeItem('recommendationsModal');
      }
    }
  };

  const handleReopenRecommendations = () => {
    const storedRecs = sessionStorage.getItem('recommendationsModal');
    if (storedRecs) {
      try {
        const data = JSON.parse(storedRecs);
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setShowRecommendationsModal(true);
          sessionStorage.setItem('recommendationsModal', JSON.stringify({
            ...data,
            show: true
          }));
        }
      } catch (e) {
        console.error('Error reopening recommendations:', e);
      }
    }
  };

  const handleAddToWishlist = async () => {
    if (!authService.isAuthenticated()) {
      toast.error("Please login to add items to wishlist", {
        icon: "🔒",
      });
      router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsAddingToWishlist(true);

    try {
      const result = await addToWishlist(product.id);

      if (result.success) {
        toast.success("Added to wishlist!", {
          icon: "❤️",
        });
      } else {
        toast.error(result.error || "Failed to add to wishlist");
      }
    } catch (error) {
      toast.error("Failed to add to wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const getEffectivePrice = () => {
    if (!product) return 0;

    let totalPrice = product.price;

    if (product.optionTypes && product.optionTypes.length > 0) {
      const selectedOptionValues = Object.values(selectedOptions).filter(
        (opt) => opt && opt.id
      );

      selectedOptionValues.forEach((opt) => {
        if (opt.price !== undefined && opt.price > 0) {
          totalPrice += opt.price;
        }
      });
    }

    return totalPrice;
  };

  const getEffectiveStock = () => {
    if (!product) return 0;

    if (!product.optionTypes || product.optionTypes.length === 0) {
      return product.stock;
    }

    const selectedOptionValues = Object.values(selectedOptions).filter(
      (opt) => opt && opt.id
    );
    if (selectedOptionValues.length === 0) {
      return product.stock;
    }

    let minStock = product.stock;
    selectedOptionValues.forEach((opt) => {
      if (opt.stock !== undefined && opt.stock < minStock) {
        minStock = opt.stock;
      }
    });

    return minStock;
  };

  const getQuantityInCart = () => {
    if (!cart || !cart.products || !product) return 0;

    const selectedOptionIds = product.optionTypes && product.optionTypes.length > 0
      ? Object.values(selectedOptions)
          .filter((opt) => opt && opt.id)
          .map((opt) => opt.id)
          .sort()
      : [];

    const cartItem = cart.products.find((item) => {
      if (item.productId !== product.id) return false;

      if (selectedOptionIds.length === 0 && (!item.selectedOptions || item.selectedOptions.length === 0)) {
        return true;
      }

      if (selectedOptionIds.length !== (item.selectedOptions?.length || 0)) {
        return false;
      }

      const itemOptionIds = (item.selectedOptions || [])
        .map((opt) => opt.id)
        .sort();

      return JSON.stringify(selectedOptionIds) === JSON.stringify(itemOptionIds);
    });

    return cartItem ? cartItem.quantity : 0;
  };

  const effectivePrice = product ? getEffectivePrice() : 0;
  const quantityInCart = getQuantityInCart();
  const baseStock = product ? getEffectiveStock() : 0;
  const effectiveStock = Math.max(0, baseStock - quantityInCart);
  const displayedReviews = showAllReviews ? feedbacks : feedbacks.slice(0, 2);
  const productInWishlist = product ? isInWishlist(product.id) : false;

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <Link href="/customer/all-products">
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
        <div className="mb-6 animate-fade-in">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Home
          </Link>
          <ChevronRight className="inline h-4 w-4 mx-2 text-gray-400" />
          <Link href="/customer/all-products" className="text-blue-600 hover:text-blue-700 font-medium">
            Products
          </Link>
          <ChevronRight className="inline h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-600">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 md:sticky md:top-24">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                  style={{ display: displayImage ? "none" : "flex" }}
                >
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              </div>

              {product.optionTypes &&
                product.optionTypes.some(
                  (opt) =>
                    opt.values &&
                    opt.values.some((val) => typeof val === "object" && val.img)
                ) && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    <button
                      onClick={() => setDisplayImage(product.img)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        displayImage === product.img
                          ? "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={product.img}
                        alt="Main"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {product.optionTypes.map((option) =>
                      option.values
                        .filter((val) => typeof val === "object" && val.img)
                        .map((val, idx) => (
                          <button
                            key={`${option.name}-${idx}`}
                            onClick={() => {
                              setDisplayImage(val.img);
                              handleOptionChange(option.name, val);
                            }}
                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              displayImage === val.img
                                ? "border-blue-600 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            title={`${option.name}: ${val.value}`}
                          >
                            <img
                              src={val.img}
                              alt={val.value}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))
                    )}
                  </div>
                )}

              {effectiveStock < 5 && effectiveStock > 0 && (
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-orange-800 text-sm font-medium">
                  ⚠️ Only {effectiveStock} left in stock!
                </div>
              )}

              {effectiveStock === 0 && baseStock > 0 && quantityInCart > 0 && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-blue-800 text-sm font-medium">
                  ℹ️ You already have {quantityInCart} in your cart (all available stock)
                </div>
              )}

              {effectiveStock === 0 && baseStock === 0 && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-800 text-sm font-bold">
                  ❌ Out of Stock
                </div>
              )}

              {quantityInCart > 0 && effectiveStock > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-green-800 text-sm font-medium">
                  🛒 {quantityInCart} already in cart
                </div>
              )}
            </div>
          </div>

          <div className="animate-fade-in animation-delay-300">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold uppercase">
                {product.categoryName}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {product.name}
            </h1>

            {feedbackStats && feedbackStats.totalReviews > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(feedbackStats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium text-sm sm:text-base">
                  {feedbackStats.averageRating.toFixed(1)} (
                  {feedbackStats.totalReviews} reviews)
                </span>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl sm:text-5xl font-bold text-blue-600">
                  ${effectivePrice.toFixed(2)}
                </span>
              </div>
              {product.optionTypes && product.optionTypes.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      Base: ${product.price.toFixed(2)}
                    </span>
                    {Object.entries(selectedOptions).map(
                      ([optionName, optionValue]) => {
                        if (optionValue && optionValue.price > 0) {
                          return (
                            <span
                              key={optionName}
                              className="text-purple-600 font-medium"
                            >
                              + {optionName}: ${optionValue.price.toFixed(2)}
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {product.optionTypes && product.optionTypes.length > 0 && (
              <div className="mb-8 space-y-6">
                {product.optionTypes.map((option, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select{" "}
                      {option.name.charAt(0).toUpperCase() +
                        option.name.slice(1)}{" "}
                      *
                    </label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {option.values.map((value, valueIdx) => {
                        const displayValue =
                          typeof value === "object" ? value.value : value;
                        const valueObj =
                          typeof value === "object"
                            ? value
                            : { id: value, value: value };
                        const isSelected =
                          selectedOptions[option.name]?.value === displayValue;
                        const isOutOfStock =
                          typeof value === "object" &&
                          value.stock !== undefined &&
                          value.stock === 0;
                        const hasImage = typeof value === "object" && value.img;

                        return (
                          <button
                            key={valueIdx}
                            onClick={() =>
                              !isOutOfStock &&
                              handleOptionChange(option.name, valueObj)
                            }
                            disabled={isOutOfStock}
                            className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 font-semibold transition-all transform hover:scale-105 text-sm sm:text-base ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                                : isOutOfStock
                                ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                : "border-gray-300 text-gray-700 hover:border-blue-400"
                            }`}
                          >
                            <span className="capitalize">{displayValue}</span>
                            {hasImage && (
                              <span className="ml-2 text-xs">🖼️</span>
                            )}
                            {isOutOfStock && (
                              <span className="absolute top-1 right-1 text-xs text-red-500">
                                ✕
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>
                    All options are required. Price shown includes selected
                    options.
                  </span>
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= effectiveStock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 sm:w-20 text-center font-bold text-base sm:text-lg py-2 sm:py-3 border-0 focus:outline-none"
                    min="1"
                    max={effectiveStock}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(effectiveStock, quantity + 1))
                    }
                    disabled={quantity >= effectiveStock}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <span className="text-sm sm:text-base text-gray-600">
                  {effectiveStock} available
                  {quantityInCart > 0 && ` (${quantityInCart} in cart)`}
                </span>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={effectiveStock === 0 || isAddingToCart}
                className="flex-1 flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddToWishlist}
                disabled={productInWishlist || isAddingToWishlist}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all transform hover:scale-110 ${
                  productInWishlist
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAddingToWishlist ? (
                  <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-2 border-current border-t-transparent rounded-full"></div>
                ) : (
                  <Heart
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${productInWishlist ? "fill-current" : ""}`}
                  />
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  icon: Truck,
                  text: "Free Shipping",
                  subtext: "On orders $50+",
                },
                {
                  icon: Shield,
                  text: "Secure Payment",
                  subtext: "100% protected",
                },
                {
                  icon: RotateCcw,
                  text: "30-Day Returns",
                  subtext: "Easy returns",
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {feature.text}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {feature.subtext}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {feedbacks.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Customer Reviews
              </h2>
              {feedbackStats && (
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                    {feedbackStats.averageRating.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    out of 5 ({feedbackStats.totalReviews} reviews)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              {displayedReviews.map((feedback, idx) => (
                <div
                  key={feedback.id || idx}
                  className="bg-white rounded-2xl shadow-md p-4 sm:p-6 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {feedback.customerId.name || "Anonymous"}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < feedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">{feedback.comment}</p>
                </div>
              ))}
            </div>

            {feedbacks.length > 2 && !showAllReviews && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all text-sm sm:text-base"
                >
                  See All Reviews ({feedbacks.length})
                </button>
              </div>
            )}
          </div>
        )}

        {similarProducts.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Similar Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((similar, idx) => (
                <Link
                  key={similar.id}
                  href={`/customer/product/${similar.id}`}
                  className="group"
                >
                  <div
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="relative h-40 sm:h-48 bg-gray-100">
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
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                        {similar.name}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">
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

      <RecommendationsModal
        isOpen={showRecommendationsModal}
        onClose={handleCloseRecommendations}
        recommendations={recommendations}
        onProductClick={(productId) => {
          handleCloseRecommendations();
          console.log('Viewing recommended product:', productId);
        }}
      />

      {!showRecommendationsModal && recommendations.length > 0 && (
        <button
          onClick={handleReopenRecommendations}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center gap-2 animate-bounce-gentle"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-bold text-sm sm:text-base hidden sm:inline">View Recommendations</span>
          <span className="font-bold text-sm sm:text-base sm:hidden">Picks</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {recommendations.length}
          </span>
        </button>
      )}

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

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}