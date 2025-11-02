import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronRight,
  Calendar,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/login?returnUrl=/customer/orders");
      return;
    }

    const user = authService.getCurrentUser();
    if (user?.role === "admin") {
      toast.error("This page is only accessible to customers");
      router.push("/admin");
      return;
    }

    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `/api/customer/order?page=${page}&limit=10`
      );
      console.log(response);

      if (response.success && response.data) {
        setOrders(response.data.orders || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "paid":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "cancelled":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">
                {pagination
                  ? `${pagination.total} total orders`
                  : "View your order history"}
              </p>
            </div>
            <Link href="/customer/all-products">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg animate-fade-in">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </p>
            <Link href="/customer/all-products">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105">
                <Package className="h-5 w-5 mr-2" />
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.datetime).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <Link href={`/customer/orders/${order.id}`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="text-lg font-bold text-gray-900">
                          {order.products.length}{" "}
                          {order.products.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Payment</p>
                        <p
                          className={`text-sm font-bold capitalize ${getPaymentStatusColor(
                            order.payment?.status
                          )}`}
                        >
                          {order.payment?.method} - {order.payment?.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="border-t pt-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {order.products.slice(0, 4).map((product, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
                        >
                          {product.img ? (
                            <img
                              src={product.img}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.products.length > 4 && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">
                            +{order.products.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/customer/orders/${order.id}`}
                      className="flex-1"
                    >
                      <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                        View Details
                      </button>
                    </Link>
                    {order.canCancel && (
                      <Link href={`/customer/orders/${order.id}`}>
                        <button className="px-6 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all">
                          Cancel Order
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      pagination.page === pageNum
                        ? "bg-blue-600 text-white shadow-lg"
                        : "border-2 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

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
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
