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
      url: process.env.NEXT_PUBLIC_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
      description: process.env.NODE_ENV === 'production' ? "Production server" : "Development server",
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
    {
      name: "Admin - Dashboard",
      description: "Dashboard operations (Admin only)",
    },
    {
      name: "Admin - Customer Management",
      description: "Customer management operations (Admin only)",
    },
    {
      name: "Admin - Category Management",
      description: "Category management operations (Admin only)",
    },
    {
      name: "Admin - Product Management",
      description: "Product management operations (Admin only)",
    },
    {
      name: "Admin - Product Options",
      description: "Product options management operations (Admin only)",
    },
    {
      name: "Admin - Order Management",
      description: "Order management operations (Admin only)",
    },
    {
      name: "Admin - Feedback Management",
      description: "Feedback management operations (Admin only)",
    },
    {
      name: "Customer - Cart",
      description: "Cart operations (Customer only)",
    },
    {
      name: "Customer - Wishlist",
      description: "Wishlist operations (Customer only)",
    },
    {
      name: "Customer - Address",
      description: "Address operations (Customer only)",
    },
    {
      name: "Customer - Orders",
      description: "Order operations (Customer only)",
    },
    {
      name: "Customer - Feedback",
      description: "Feedback operations (Customer only)",
    },
    {
      name: "Customer - Profile",
      description: "Profile operations (Customer only)",
    },
    {
      name: "Customer - Recommendations",
      description: "Recommendations operations (Customer only)",
    },
    {
      name: "Public - Categories",
      description: "Public Category operations (all users)",
    },
    {
      name: "Public - Products",
      description: "Public Product operations (all users)",
    },
    {
      name: "Public - Recommendations",
      description: "Public Recommendations operations (all users)",
    },
    {
      name: "Public - Navbar",
      description: "Public Navbar operations (all users)",
    },
  ],
};
