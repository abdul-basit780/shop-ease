import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Eye,
  ArrowLeft,
  Package,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!authService.isAuthenticated()) {
      toast.error("Please login to view your wishlist", {
        icon: "🔒",
      });
      router.push("/auth/login?returnUrl=/wishlist");
      return;
    }

    // Add role check - redirect admins
    const user = authService.getCurrentUser();
    if (user?.role === "admin") {
      toast.error("This page is only accessible to customers", {
        icon: "🚫",
        duration: 1000,
      });

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
      return;
    }

    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/customer/wishlist");
      console.log("wish page", response);
      if (response.success && response.data) {
        setWishlist(response.data);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "wishlist",
            JSON.stringify(response.data.products || [])
          );
          window.dispatchEvent(new Event("wishlistUpdated"));
        }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingId(productId);

    try {
      const response = await apiClient.delete("/api/customer/wishlist", {
        productId,
      });

      if (response.success) {
        // Update localStorage with the new wishlist from response
        if (typeof window !== "undefined") {
          const updatedProducts = response.wishlist?.products || [];
          localStorage.setItem("wishlist", JSON.stringify(updatedProducts));
        }

        // Update wishlist state with response data
        if (response.wishlist) {
          setWishlist(response.wishlist);
        } else {
          // Fallback: manually update state if no wishlist in response
          setWishlist((prev) => {
            if (!prev) return prev;
            const productToRemove = prev.products.find(
              (p) => p.productId === productId
            );
            return {
              ...prev,
              products: prev.products.filter((p) => p.productId !== productId),
              count: Math.max(0, prev.count - 1),
              totalValue: Math.max(
                0,
                prev.totalValue - (productToRemove?.price || 0)
              ),
            };
          });
        }

        toast.success("Removed from wishlist", {
          icon: "🗑️",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });

        // Dispatch event to update home page
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        toast.error(
          response.error || response.message || "Failed to remove item"
        );
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find((item) => item.id === product.productId);

      if (existingItem) {
        existingItem.quantity += 1;
        toast.success("Quantity updated in cart!", {
          icon: "🛒",
        });
      } else {
        cart.push({
          id: product.productId,
          name: product.name,
          price: product.price,
          img: product.img,
          stock: product.stock,
          description: product.description,
          categoryName: product.categoryName,
          quantity: 1,
        });
        toast.success("Added to cart!", {
          icon: "🛒",
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleMoveToCart = async (product) => {
    await handleAddToCart(product);
    await handleRemoveFromWishlist(product.productId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Shopping
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                  My Wishlist
                </h1>
                <p className="text-gray-600 mt-1">
                  {wishlist?.count || 0}{" "}
                  {wishlist?.count === 1 ? "item" : "items"} saved
                  {wishlist?.totalValue > 0 && (
                    <span className="ml-2 text-blue-600 font-semibold">
                      • Total: ${wishlist.totalValue.toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {wishlist?.products?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.products.map((product, idx) => (
              <div
                key={product.productId}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  {product.img ? (
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}

                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
                    style={{ display: product.img ? "none" : "flex" }}
                  >
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>

                  {!product.isAvailable && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Unavailable
                    </div>
                  )}

                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Out of Stock
                    </div>
                  )}

                  {product.stock > 0 && product.stock < 5 && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Only {product.stock} left
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(product.productId)}
                    disabled={removingId === product.productId}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-lg disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    {removingId === product.productId ? (
                      <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
                      <Link href={`/products/${product.productId}`}>
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-all shadow-lg">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                    {product.categoryName}
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mb-4">
                    Added{" "}
                    {new Date(product.addedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0 || !product.isAvailable}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>

                    {product.isAvailable && product.stock > 0 && (
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Move to Cart & Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist. They'll be saved
              here for later!
            </p>
            <Link href="/customer/all-products">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                <Sparkles className="h-5 w-5 mr-2" />
                Discover Products
              </button>
            </Link>
          </div>
        )}

        {wishlist?.products?.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  💝 Your Wishlist Summary
                </h3>
                <p className="text-gray-600">
                  {wishlist.count} {wishlist.count === 1 ? "item" : "items"} •
                  Total value:{" "}
                  <span className="font-bold text-blue-600">
                    ${wishlist.totalValue.toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <Link href="/products">
                  <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all border-2 border-blue-600">
                    Continue Shopping
                  </button>
                </Link>
                <Link href="/cart">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                    View Cart
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
