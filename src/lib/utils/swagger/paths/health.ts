// lib/utils/swagger/paths/health.ts
export const healthPaths = {
    "/api/health": {
      get: {
        summary: "API Health Check",
        description: "Check API and database health status",
        tags: ["Health"],
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": { description: "API is unhealthy" },
        },
      },
    },
  };