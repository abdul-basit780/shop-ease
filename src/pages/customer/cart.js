import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    if (!authService.isAuthenticated()) {
      router.push("/auth/login?returnUrl=/cart");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role === "admin") {
      toast.error("This page is only accessible to customers", {
        icon: "🚫",
        duration: 1000,
      });

      setTimeout(() => {
        router.push("/admin");
      }, 1000);
      return;
    }

    fetchCart();

    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [router]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/api/customer/cart");

      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
      setCart({ products: [], totalAmount: 0, count: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity, selectedOptions) => {
    if (newQuantity < 1) return;

    const itemKey = `${productId}-${selectedOptions?.map(o => o.id).join('-') || 'no-options'}`;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));

    try {
      const requestBody = {
        quantity: newQuantity,
      };

      if (selectedOptions && selectedOptions.length > 0) {
        requestBody.selectedOptions = selectedOptions.map(option => option.id);
      }

      const response = await apiClient.put(
        `/api/customer/cart/${productId}`,
        requestBody
      );

      if (response.success && response.data) {
        setCart(response.data);
        
        toast.success("Quantity updated", {
          duration: 1500,
          style: {
            borderRadius: '12px',
          },
        });
        
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update quantity";
      toast.error(errorMessage);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const removeItem = async (productId, selectedOptions) => {
    const itemKey = `${productId}-${selectedOptions?.map(o => o.id).join('-') || 'no-options'}`;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));

    try {
      const requestBody = {};

      if (selectedOptions && selectedOptions.length > 0) {
        requestBody.selectedOptions = selectedOptions.map(option => option.id);
      }

      const response = await apiClient.delete(
        `/api/customer/cart/${productId}`,
        requestBody
      );

      if (response.success) {
        setCart(response.data);
        
        toast.success("Item removed from cart", {
          icon: "🗑️",
          duration: 2000,
          style: {
            borderRadius: '12px',
          },
        });
        
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to remove item";
      toast.error(errorMessage);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const isItemUpdating = (productId, selectedOptions) => {
    const itemKey = `${productId}-${selectedOptions?.map(o => o.id).join('-') || 'no-options'}`;
    return updatingItems.has(itemKey);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.products || cart.products.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some products to get started!
            </p>
            <Link href="/customer/all-products">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shippingCost = cart.totalAmount >= 50 ? 0 : 9.99;
  const taxAmount = cart.totalAmount * 0.1;
  const finalTotal = cart.totalAmount + shippingCost + taxAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cart.count} {cart.count === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.products.map((item, idx) => {
              const isUpdating = isItemUpdating(item.productId, item.selectedOptions);
              // Calculate unit price from subtotal (backend already calculated base + options)
              const unitPrice = item.subtotal / item.quantity;
              
              return (
                <div
                  key={`${item.productId}-${item.selectedOptions?.map(o => o.id).join('-') || idx}`}
                  className={`bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg ${
                    isUpdating ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link href={`/customer/product/${item.productId}`}>
                      <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ display: item.img ? "none" : "flex" }}
                        >
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={`/customer/product/${item.productId}`}>
                            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                              {item.name}
                            </h3>
                          </Link>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold uppercase">
                            {item.categoryName}
                          </span>
                          
                          {/* Display Selected Options */}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.selectedOptions.map((option, optIdx) => (
                                <span
                                  key={optIdx}
                                  className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                                >
                                  {option.optionTypeName && (
                                    <span className="font-semibold mr-1">{option.optionTypeName}:</span>
                                  )}
                                  {option.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedOptions)}
                          disabled={isUpdating}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-2 hover:bg-red-50 rounded-lg"
                          title="Remove item"
                        >
                          {isUpdating ? (
                            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Availability Warning */}
                      {!item.isAvailable && (
                        <div className="flex items-center gap-2 mb-3 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-semibold">
                            Currently unavailable
                          </span>
                        </div>
                      )}

                      {item.isAvailable && item.stock < 5 && (
                        <div className="flex items-center gap-2 mb-3 text-orange-600 text-sm bg-orange-50 p-2 rounded-lg">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-semibold">
                            Only {item.stock} left in stock
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.selectedOptions
                              )
                            }
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.selectedOptions
                              )
                            }
                            disabled={item.quantity >= item.stock || isUpdating}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price - Backend already calculated base + options */}
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            ${unitPrice.toFixed(2)} each
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            ${item.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})
                  </span>
                  <span className="font-semibold">
                    ${cart.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span
                    className={`font-semibold ${
                      shippingCost === 0 ? "text-green-600" : ""
                    }`}
                  >
                    {shippingCost === 0
                      ? "FREE"
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (estimated)</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-2xl text-blue-600">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {cart.totalAmount < 50 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                  💡 Add{" "}
                  <span className="font-bold">
                    ${(50 - cart.totalAmount).toFixed(2)}
                  </span>{" "}
                  more for FREE shipping!
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.products.some((p) => !p.isAvailable)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <Link href="/customer/all-products">
                <button className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}