// lib/controllers/navbarCategory.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Category } from "../models/Category";
import connectToDatabase from "../db/mongodb";

export interface NavbarCategory {
  id: string;
  name: string;
  children?: NavbarCategory[];
}

interface Response {
  success: boolean;
  message: string;
  categories?: NavbarCategory[];
  statusCode: number | undefined;
}

// Get categories for navbar (nested structure)
export const getNavbarCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    categories: [],
    statusCode: 500,
  };

  try {
    // Get all non-deleted categories
    const allCategories = await Category.find({ deletedAt: null })
      .select("_id name parentId")
      .sort({ name: 1 })
      .lean();

    // Build nested structure
    const categoryMap = new Map<string, NavbarCategory>();
    const rootCategories: NavbarCategory[] = [];

    // First pass: create all category objects
    allCategories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), {
        id: cat._id.toString(),
        name: cat.name,
        children: [],
      });
    });

    // Second pass: build hierarchy
    allCategories.forEach((cat) => {
      const category = categoryMap.get(cat._id.toString())!;

      if (cat.parentId) {
        // This is a subcategory
        const parent = categoryMap.get(cat.parentId.toString());
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category);
        }
      } else {
        // This is a root category
        rootCategories.push(category);
      }
    });

    // Clean up: remove empty children arrays
    const cleanupChildren = (categories: NavbarCategory[]) => {
      categories.forEach((cat) => {
        if (cat.children && cat.children.length === 0) {
          delete cat.children;
        } else if (cat.children) {
          cleanupChildren(cat.children);
        }
      });
    };

    cleanupChildren(rootCategories);

    response.categories = rootCategories;
    response.success = true;
    response.message = "Categories retrieved successfully";
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get navbar categories error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};
