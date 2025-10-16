import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../../index';
import { Shirt, ArrowLeft } from 'lucide-react';

interface ProductForm {
  name: string;
  price: string;
  category: string;
  stock: string;
  description: string;
  size: string;
  color: string;
}

// Mock product data that matches your products list
const mockProducts = {
  'FP001': {
    name: 'Classic White T-Shirt',
    price: '29.99',
    category: 'T-Shirts',
    stock: '45',
    description: 'Premium cotton t-shirt for everyday wear',
    size: 'M, L, XL',
    color: 'White'
  },
  'FP002': {
    name: 'Denim Jacket',
    price: '89.99',
    category: 'Jackets',
    stock: '12',
    description: 'Classic denim jacket with vintage wash',
    size: 'S, M, L, XL',
    color: 'Blue'
  },
  'FP003': {
    name: 'Summer Dress',
    price: '59.99',
    category: 'Dresses',
    stock: '0',
    description: 'Light and comfortable summer dress',
    size: 'XS, S, M',
    color: 'Floral'
  },
  'FP004': {
    name: 'Slim Fit Jeans',
    price: '79.99',
    category: 'Pants',
    stock: '8',
    description: 'Slim fit jeans with stretch comfort',
    size: '30, 32, 34',
    color: 'Dark Blue'
  },
  'FP005': {
    name: 'Wool Sweater',
    price: '99.99',
    category: 'Sweaters',
    stock: '25',
    description: 'Warm wool sweater for winter',
    size: 'S, M, L, XL',
    color: 'Navy'
  },
  'FP006': {
    name: 'Running Shorts',
    price: '34.99',
    category: 'Shorts',
    stock: '30',
    description: 'Lightweight running shorts',
    size: 'S, M, L',
    color: 'Black'
  },
  'FP007': {
    name: 'Leather Boots',
    price: '149.99',
    category: 'Footwear',
    stock: '15',
    description: 'Premium leather boots',
    size: '8, 9, 10, 11',
    color: 'Brown'
  },
  'FP008': {
    name: 'Winter Coat',
    price: '199.99',
    category: 'Outerwear',
    stock: '5',
    description: 'Warm winter coat with insulation',
    size: 'M, L, XL',
    color: 'Black'
  }
};

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productExists, setProductExists] = useState(true);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    size: '',
    color: ''
  });

  const categories = [
    'T-Shirts',
    'Jackets',
    'Dresses',
    'Pants',
    'Sweaters',
    'Shorts',
    'Footwear',
    'Outerwear',
    'Accessories'
  ];

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const product = mockProducts[id as keyof typeof mockProducts];
          if (product) {
            setFormData(product);
            setProductExists(true);
          } else {
            console.log('Product not found:', id);
            setProductExists(false);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setProductExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the mock product data with new values
      if (id) {
        mockProducts[id as keyof typeof mockProducts] = {
          ...mockProducts[id as keyof typeof mockProducts],
          ...formData
        };
      }
      
      console.log('Updated product:', { id, ...formData });
      
      // Show success message and redirect
      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/products')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Loading product details...</p>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // If product not found after loading
  if (!productExists) {
    return (
      <AdminLayout title="Product Not Found">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/admin/products')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-6">Product with ID "{id}" was not found.</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.push('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product details for {id}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., S, M, L or 8, 9, 10"
                />
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Shirt className="h-4 w-4" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}