// lib/utils/swagger/paths/adminDashboard.ts
export const adminDashboardPaths = {
  "/api/admin/dashboard/stats": {
    get: {
      summary: "Get dashboard statistics (Admin)",
      description:
        "Retrieve comprehensive dashboard statistics including customers, orders, revenue, products, categories, feedback, trends, and insights. Provides a complete overview for admin dashboard. Admin only.",
      tags: ["Admin - Dashboard"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "startDate",
          in: "query",
          description: "Start date for statistics (default: 30 days ago)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-09-11T00:00:00.000Z",
          },
        },
        {
          name: "endDate",
          in: "query",
          description: "End date for statistics (default: today)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-10-11T23:59:59.999Z",
          },
        },
      ],
      responses: {
        "200": {
          description: "Dashboard statistics retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DashboardStatsResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },

  "/api/admin/dashboard/revenue": {
    get: {
      summary: "Get revenue analytics (Admin)",
      description:
        "Retrieve detailed revenue analytics with period-based breakdown (daily, weekly, or monthly). Shows revenue trends, order counts, and average order values over time. Admin only.",
      tags: ["Admin - Dashboard"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "period",
          in: "query",
          description: "Analysis period granularity",
          schema: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
            default: "daily",
          },
        },
        {
          name: "startDate",
          in: "query",
          description: "Start date for analysis (default: 30 days ago)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-09-11T00:00:00.000Z",
          },
        },
        {
          name: "endDate",
          in: "query",
          description: "End date for analysis (default: today)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-10-11T23:59:59.999Z",
          },
        },
      ],
      responses: {
        "200": {
          description: "Revenue analytics retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RevenueAnalyticsResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },
};
