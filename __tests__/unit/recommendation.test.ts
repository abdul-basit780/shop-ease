import {
  buildRecommendationResponse,
  buildProductListResponse,
  RECOMMENDATION_MESSAGES,
} from "../../src/lib/utils/recommendation";

describe("recommendation utils", () => {
  describe("buildRecommendationResponse", () => {
    it("should build personalized recommendation response", () => {
      const mockRecommendations = [
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            name: "Laptop",
            price: 999.99,
            img: "laptop.jpg",
            categoryId: { name: "Electronics" },
            stock: 50,
          },
          reason: "Based on your recent purchases",
          score: 0.95,
        },
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439012" },
            name: "Mouse",
            price: 29.99,
            img: "mouse.jpg",
            categoryId: { name: "Accessories" },
            stock: 100,
          },
          reason: "Frequently bought together",
          score: 0.85,
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "personalized"
      );

      expect(response).toEqual({
        type: "personalized",
        count: 2,
        recommendations: [
          {
            id: "507f1f77bcf86cd799439011",
            name: "Laptop",
            price: 999.99,
            img: "laptop.jpg",
            category: "Electronics",
            stock: 50,
            reason: "Based on your recent purchases",
            score: 0.95,
            optionTypes: [],
          },
          {
            id: "507f1f77bcf86cd799439012",
            name: "Mouse",
            price: 29.99,
            img: "mouse.jpg",
            category: "Accessories",
            stock: 100,
            reason: "Frequently bought together",
            score: 0.85,
            optionTypes: [],
          },
        ],
      });
    });

    it("should build popular recommendation response", () => {
      const mockRecommendations = [
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            name: "Bestseller",
            price: 49.99,
            img: "bestseller.jpg",
            categoryId: { name: "Books" },
            stock: 200,
          },
          reason: "Most popular this month",
          score: 0.99,
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "popular"
      );

      expect(response.type).toBe("popular");
      expect(response.count).toBe(1);
      expect(response.recommendations[0].optionTypes).toEqual([]);
    });

    it("should handle recommendations without product wrapper", () => {
      const mockRecommendations = [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Direct Product",
          price: 19.99,
          img: "product.jpg",
          categoryId: { name: "Category" },
          stock: 30,
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "popular"
      );

      expect(response.recommendations[0].id).toBe("507f1f77bcf86cd799439011");
      expect(response.recommendations[0].name).toBe("Direct Product");
      expect(response.recommendations[0].reason).toBe("Popular choice");
      expect(response.recommendations[0].score).toBe(0);
      expect(response.recommendations[0].optionTypes).toEqual([]);
    });

    it("should handle categoryId as string", () => {
      const mockRecommendations = [
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            name: "Product",
            price: 29.99,
            img: "product.jpg",
            categoryId: "Electronics",
            stock: 40,
          },
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "popular"
      );

      expect(response.recommendations[0].category).toBe("Electronics");
      expect(response.recommendations[0].optionTypes).toEqual([]);
    });

    it("should return empty recommendations for empty input", () => {
      const response = buildRecommendationResponse([], "personalized");

      expect(response).toEqual({
        type: "personalized",
        count: 0,
        recommendations: [],
      });
    });

    it("should use default reason when not provided", () => {
      const mockRecommendations = [
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            name: "Product",
            price: 29.99,
            img: "product.jpg",
            categoryId: { name: "Category" },
            stock: 40,
          },
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "popular"
      );

      expect(response.recommendations[0].reason).toBe("Popular choice");
      expect(response.recommendations[0].optionTypes).toEqual([]);
    });

    it("should use default score when not provided", () => {
      const mockRecommendations = [
        {
          product: {
            _id: { toString: () => "507f1f77bcf86cd799439011" },
            name: "Product",
            price: 29.99,
            img: "product.jpg",
            categoryId: { name: "Category" },
            stock: 40,
          },
        },
      ];

      const response = buildRecommendationResponse(
        mockRecommendations,
        "popular"
      );

      expect(response.recommendations[0].score).toBe(0);
      expect(response.recommendations[0].optionTypes).toEqual([]);
    });
  });

  describe("buildProductListResponse", () => {
    it("should build product list response", () => {
      const mockProducts = [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Product 1",
          price: 99.99,
          img: "product1.jpg",
          categoryId: { name: "Category 1" },
          stock: 50,
        },
        {
          _id: { toString: () => "507f1f77bcf86cd799439012" },
          name: "Product 2",
          price: 149.99,
          img: "product2.jpg",
          categoryId: { name: "Category 2" },
          stock: 30,
        },
      ];

      const response = buildProductListResponse(mockProducts);

      expect(response).toEqual({
        count: 2,
        products: [
          {
            id: "507f1f77bcf86cd799439011",
            name: "Product 1",
            price: 99.99,
            img: "product1.jpg",
            category: "Category 1",
            stock: 50,
            optionTypes: [],
          },
          {
            id: "507f1f77bcf86cd799439012",
            name: "Product 2",
            price: 149.99,
            img: "product2.jpg",
            category: "Category 2",
            stock: 30,
            optionTypes: [],
          },
        ],
      });
    });

    it("should handle categoryId as string", () => {
      const mockProducts = [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Product",
          price: 49.99,
          img: "product.jpg",
          categoryId: "Electronics",
          stock: 20,
        },
      ];

      const response = buildProductListResponse(mockProducts);

      expect(response.products[0].category).toBe("Electronics");
      expect(response.products[0].optionTypes).toEqual([]);
    });

    it("should return empty list for empty input", () => {
      const response = buildProductListResponse([]);

      expect(response).toEqual({
        count: 0,
        products: [],
      });
    });

    it("should handle products with different fields", () => {
      const mockProducts = [
        {
          _id: { toString: () => "507f1f77bcf86cd799439011" },
          name: "Test Product",
          price: 29.99,
          img: "test.jpg",
          categoryId: { name: "Test Category" },
          stock: 15,
        },
      ];

      const response = buildProductListResponse(mockProducts);

      expect(response.products).toHaveLength(1);
      expect(response.products[0]).toHaveProperty("id");
      expect(response.products[0]).toHaveProperty("name");
      expect(response.products[0]).toHaveProperty("price");
      expect(response.products[0]).toHaveProperty("img");
      expect(response.products[0]).toHaveProperty("category");
      expect(response.products[0]).toHaveProperty("stock");
      expect(response.products[0]).toHaveProperty("optionTypes");
      expect(response.products[0].optionTypes).toEqual([]);
    });

    it("should correctly count products", () => {
      const mockProducts = Array(10)
        .fill(null)
        .map((_, i) => ({
          _id: { toString: () => `507f1f77bcf86cd79943901${i}` },
          name: `Product ${i}`,
          price: 10 + i,
          img: `product${i}.jpg`,
          categoryId: { name: `Category ${i}` },
          stock: 10 + i,
        }));

      const response = buildProductListResponse(mockProducts);

      expect(response.count).toBe(10);
      expect(response.products).toHaveLength(10);
      expect(response.products[0].optionTypes).toEqual([]);
    });
  });

  describe("RECOMMENDATION_MESSAGES", () => {
    it("should have all required message constants", () => {
      expect(RECOMMENDATION_MESSAGES.RETRIEVED).toBe(
        "Recommendations retrieved successfully"
      );
      expect(RECOMMENDATION_MESSAGES.POPULAR_RETRIEVED).toBe(
        "Popular products retrieved successfully"
      );
      expect(RECOMMENDATION_MESSAGES.TRENDING_RETRIEVED).toBe(
        "Trending products retrieved successfully"
      );
      expect(RECOMMENDATION_MESSAGES.SIMILAR_RETRIEVED).toBe(
        "Similar products retrieved successfully"
      );
      expect(RECOMMENDATION_MESSAGES.PRODUCT_NOT_FOUND).toBe(
        "Product not found"
      );
    });
  });
});
