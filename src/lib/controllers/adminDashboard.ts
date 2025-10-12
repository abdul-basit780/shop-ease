// lib/controllers/adminDashboard.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Customer } from "../models/Customer";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Feedback } from "../models/Feedback";
import connectToDatabase from "../db/mongodb";
import { OrderStatus } from "../models/enums";

interface DashboardResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
}

// Get dashboard overview statistics
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<DashboardResponse> => {
  await connectToDatabase();

  const dashboardResponse: DashboardResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    // Get date filters from query (optional)
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days default

    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Parallel fetch all statistics
    const [
      // Customer stats
      totalCustomers,
      activeCustomers,
      blockedCustomers,
      verifiedCustomers,
      newCustomersCount,

      // Order stats
      totalOrders,
      ordersStatusBreakdown,
      recentOrders,

      // Revenue stats
      revenueStats,

      // Product stats
      totalProducts,
      activeProducts,
      lowStockProducts,

      // Category stats
      totalCategories,
      activeCategories,

      // Feedback stats
      totalFeedbacks,
      avgRating,

      // Top products
      topSellingProducts,
    ] = await Promise.all([
      // Customers
      Customer.countDocuments({}),
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: false }),
      Customer.countDocuments({ isVerified: true }),
      Customer.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      // Orders
      Order.countDocuments({}),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Order.find({})
        .sort({ datetime: -1 })
        .limit(5)
        .populate("customerId", "name email")
        .lean(),

      // Revenue
      Order.aggregate([
        {
          $match: {
            status: { $in: [OrderStatus.COMPLETED, OrderStatus.SHIPPED] },
            datetime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
      ]),

      // Products
      Product.countDocuments({}),
      Product.countDocuments({ deletedAt: null }),
      Product.find({ deletedAt: null, stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(10)
        .populate("categoryId", "name")
        .lean(),

      // Categories
      Category.countDocuments({}),
      Category.countDocuments({ deletedAt: null }),

      // Feedbacks
      Feedback.countDocuments({}),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]),

      // Top selling products
      Order.aggregate([
        {
          $match: {
            status: { $in: [OrderStatus.COMPLETED, OrderStatus.SHIPPED] },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalSold: { $sum: "$products.quantity" },
            revenue: {
              $sum: { $multiply: ["$products.price", "$products.quantity"] },
            },
            productName: { $first: "$products.name" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Format order status breakdown
    const ordersByStatus: Record<string, number> = {};
    Object.values(OrderStatus).forEach((status) => {
      ordersByStatus[status] = 0;
    });
    ordersStatusBreakdown.forEach((item: any) => {
      ordersByStatus[item._id] = item.count;
    });

    // Calculate revenue metrics
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      avgOrderValue: 0,
      orderCount: 0,
    };

    // Get revenue trend (last 7 days)
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          status: { $in: [OrderStatus.COMPLETED, OrderStatus.SHIPPED] },
          datetime: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$datetime" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build response
    dashboardResponse.success = true;
    dashboardResponse.message = "Dashboard statistics retrieved successfully";
    dashboardResponse.data = {
      overview: {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          blocked: blockedCustomers,
          verified: verifiedCustomers,
          unverified: totalCustomers - verifiedCustomers,
          newCustomers: newCustomersCount,
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus,
        },
        revenue: {
          total: Math.round(revenue.totalRevenue * 100) / 100,
          avgOrderValue: Math.round(revenue.avgOrderValue * 100) / 100,
          orderCount: revenue.orderCount,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          deleted: totalProducts - activeProducts,
          lowStock: lowStockProducts.length,
        },
        categories: {
          total: totalCategories,
          active: activeCategories,
          deleted: totalCategories - activeCategories,
        },
        feedback: {
          total: totalFeedbacks,
          avgRating: avgRating[0]?.avgRating
            ? Math.round(avgRating[0].avgRating * 10) / 10
            : 0,
        },
      },
      trends: {
        revenueTrend: revenueTrend.map((item) => ({
          date: item._id,
          revenue: Math.round(item.revenue * 100) / 100,
          orders: item.orders,
        })),
      },
      insights: {
        topSellingProducts: topSellingProducts.map((item) => ({
          productId: item._id,
          name: item.productName,
          totalSold: item.totalSold,
          revenue: Math.round(item.revenue * 100) / 100,
        })),
        lowStockProducts: lowStockProducts.map((item: any) => ({
          _id: item._id,
          name: item.name,
          stock: item.stock,
          price: item.price,
          category: item.categoryId?.name || "N/A",
        })),
        recentOrders: recentOrders.map((order: any) => ({
          _id: order._id,
          customer: {
            name: order.customerId?.name || "N/A",
            email: order.customerId?.email || "N/A",
          },
          totalAmount: order.totalAmount,
          status: order.status,
          datetime: order.datetime,
        })),
      },
      dateRange: {
        startDate,
        endDate,
      },
    };
    dashboardResponse.statusCode = 200;

    return dashboardResponse;
  } catch (err) {
    console.error("Get dashboard stats error:", err);
    dashboardResponse.message = "Failed to retrieve dashboard statistics";
    dashboardResponse.statusCode = 500;
    return dashboardResponse;
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<DashboardResponse> => {
  await connectToDatabase();

  const dashboardResponse: DashboardResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const period = (req.query.period as string) || "daily"; // daily, weekly, monthly
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Determine date format based on period
    let dateFormat = "%Y-%m-%d";
    if (period === "weekly") {
      dateFormat = "%Y-W%U";
    } else if (period === "monthly") {
      dateFormat = "%Y-%m";
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: [OrderStatus.COMPLETED, OrderStatus.SHIPPED] },
          datetime: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$datetime" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    dashboardResponse.success = true;
    dashboardResponse.message = "Revenue analytics retrieved successfully";
    dashboardResponse.data = {
      period,
      dateRange: { startDate, endDate },
      data: revenueData.map((item) => ({
        period: item._id,
        revenue: Math.round(item.revenue * 100) / 100,
        orders: item.orders,
        avgOrderValue: Math.round(item.avgOrderValue * 100) / 100,
      })),
    };
    dashboardResponse.statusCode = 200;

    return dashboardResponse;
  } catch (err) {
    console.error("Get revenue analytics error:", err);
    dashboardResponse.message = "Failed to retrieve revenue analytics";
    dashboardResponse.statusCode = 500;
    return dashboardResponse;
  }
};
