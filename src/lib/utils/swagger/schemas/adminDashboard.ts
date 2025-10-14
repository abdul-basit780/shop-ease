// lib/utils/swagger/schemas/adminDashboard.ts
export const adminDashboardSchemas = {
  // Dashboard Stats Response
  DashboardStatsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Dashboard statistics retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          overview: {
            type: "object",
            properties: {
              customers: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 1250 },
                  active: { type: "integer", example: 1180 },
                  blocked: { type: "integer", example: 70 },
                  verified: { type: "integer", example: 950 },
                  unverified: { type: "integer", example: 300 },
                  newCustomers: { type: "integer", example: 45 },
                },
              },
              orders: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 5420 },
                  byStatus: {
                    type: "object",
                    properties: {
                      pending: { type: "integer", example: 120 },
                      processing: { type: "integer", example: 350 },
                      shipped: { type: "integer", example: 1200 },
                      completed: { type: "integer", example: 3500 },
                      cancelled: { type: "integer", example: 250 },
                    },
                  },
                },
              },
              revenue: {
                type: "object",
                properties: {
                  total: { type: "number", example: 485320.5 },
                  avgOrderValue: { type: "number", example: 89.55 },
                  orderCount: { type: "integer", example: 5420 },
                },
              },
              products: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 450 },
                  active: { type: "integer", example: 420 },
                  deleted: { type: "integer", example: 30 },
                  lowStock: { type: "integer", example: 15 },
                },
              },
              categories: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 25 },
                  active: { type: "integer", example: 23 },
                  deleted: { type: "integer", example: 2 },
                },
              },
              feedback: {
                type: "object",
                properties: {
                  total: { type: "integer", example: 3240 },
                  avgRating: { type: "number", example: 4.3 },
                },
              },
            },
          },
          trends: {
            type: "object",
            properties: {
              revenueTrend: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", example: "2025-10-11" },
                    revenue: { type: "number", example: 15420.5 },
                    orders: { type: "integer", example: 172 },
                  },
                },
              },
            },
          },
          insights: {
            type: "object",
            properties: {
              topSellingProducts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    productId: { type: "string" },
                    name: { type: "string", example: "Wireless Headphones" },
                    totalSold: { type: "integer", example: 450 },
                    revenue: { type: "number", example: 44950.0 },
                  },
                },
              },
              lowStockProducts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    stock: { type: "integer", example: 5 },
                    price: { type: "number", example: 99.99 },
                    category: { type: "string", example: "Electronics" },
                  },
                },
              },
              recentOrders: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    customer: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" },
                      },
                    },
                    totalAmount: { type: "number" },
                    status: { type: "string" },
                    datetime: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          dateRange: {
            type: "object",
            properties: {
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  },

  // Revenue Analytics Response
  RevenueAnalyticsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Revenue analytics retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
            example: "daily",
          },
          dateRange: {
            type: "object",
            properties: {
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
            },
          },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                period: { type: "string", example: "2025-10-11" },
                revenue: { type: "number", example: 15420.5 },
                orders: { type: "integer", example: 172 },
                avgOrderValue: { type: "number", example: 89.66 },
              },
            },
          },
        },
      },
    },
  },
};
