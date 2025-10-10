// lib/utils/swagger/definition.ts
export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "ShopEase API",
    version: "1.0.0",
    description:
      "Complete RESTful API for managing shop products with payment integration, feedback system, and role-based access control",
    contact: {
      name: "API Support",
      email: "support@appointmentsystem.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://docease.vercel.app",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
    },
  },
  tags: [
    { name: "Health", description: "API health monitoring" },
    { name: "Authentication", description: "User authentication endpoints" },
    // {
    //   name: "Admin - Dashboard",
    //   description: "Dashboard operations (Admin only)",
    // },
    // {
    //   name: "Admin - Customer Management",
    //   description: "Customer management operations (Admin only)",
    // },
    {
      name: "Admin - Category Management",
      description: "Category management operations (Admin only)",
    },
    {
      name: "Admin - Product Management",
      description: "Product management operations (Admin only)",
    },
    {
      name: "Customer - Wishlist",
      description: "Wishlist operations (Customer only)",
    },
  ],
};
