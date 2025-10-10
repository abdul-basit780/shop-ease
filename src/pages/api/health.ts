// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from "next";
import { checkDatabaseHealth } from "../../lib/db/mongodb";
import {
  sendSuccess,
  sendError,
  asyncHandler,
} from "../../lib/utils/apiResponse";

interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: {
    status: "connected" | "disconnected";
    latency?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

const healthHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return sendError(res, "Method not allowed", 405);
  }

  try {
    const startTime = Date.now();

    // Check database health
    const isDatabaseHealthy = await checkDatabaseHealth();
    const dbLatency = Date.now() - startTime;

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsed = memoryUsage.heapUsed;
    const memoryTotal = memoryUsage.heapTotal;
    const memoryPercentage = Math.round((memoryUsed / memoryTotal) * 100);

    // Prepare health response
    const healthData: HealthResponse = {
      status: isDatabaseHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: {
        status: isDatabaseHealthy ? "connected" : "disconnected",
        latency: dbLatency,
      },
      memory: {
        used: Math.round(memoryUsed / 1024 / 1024), // Convert to MB
        total: Math.round(memoryTotal / 1024 / 1024), // Convert to MB
        percentage: memoryPercentage,
      },
    };

    // Return appropriate status code
    const statusCode = isDatabaseHealthy ? 200 : 503;
    const message = isDatabaseHealthy ? "API is healthy" : "API is unhealthy";

    if (isDatabaseHealthy) {
      sendSuccess(res, healthData, message, statusCode);
    } else {
      sendError(res, message, statusCode);
    }
  } catch (error: any) {
    console.error("Health check error:", error);

    const unhealthyData: HealthResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: {
        status: "disconnected",
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    };

    res.status(503).json({
      success: false,
      message: "Health check failed",
      data: unhealthyData,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

export default asyncHandler(healthHandler);