import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '../index';
import { Shirt } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  size?: string;
  color?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Clothing products data
      const mockProducts: Product[] = [
        { 
          id: 'FP001', 
          name: 'Classic White T-Shirt', 
          price: 29.99, 
          category: 'T-Shirts', 
          stock: 45,
          size: 'M, L, XL',
          color: 'White'
        },
        { 
          id: 'FP002', 
          name: 'Denim Jacket', 
          price: 89.99, 
          category: 'Jackets', 
          stock: 12,
          size: 'S, M, L, XL',
          color: 'Blue'
        },
        { 
          id: 'FP003', 
          name: 'Summer Dress', 
          price: 59.99, 
          category: 'Dresses', 
          stock: 0,
          size: 'XS, S, M',
          color: 'Floral'
        },
        { 
          id: 'FP004', 
          name: 'Slim Fit Jeans', 
          price: 79.99, 
          category: 'Pants', 
          stock: 8,
          size: '30, 32, 34',
          color: 'Dark Blue'
        },
        { 
          id: 'FP005', 
          name: 'Wool Sweater', 
          price: 99.99, 
          category: 'Sweaters', 
          stock: 25,
          size: 'S, M, L, XL',
          color: 'Navy'
        },
        { 
          id: 'FP006', 
          name: 'Running Shorts', 
          price: 34.99, 
          category: 'Shorts', 
          stock: 30,
          size: 'S, M, L',
          color: 'Black'
        },
        { 
          id: 'FP007', 
          name: 'Leather Boots', 
          price: 149.99, 
          category: 'Footwear', 
          stock: 15,
          size: '8, 9, 10, 11',
          color: 'Brown'
        },
        { 
          id: 'FP008', 
          name: 'Winter Coat', 
          price: 199.99, 
          category: 'Outerwear', 
          stock: 5,
          size: 'M, L, XL',
          color: 'Black'
        }
      ];
      
      setProducts(mockProducts);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(prev => prev.filter(product => product.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <AdminLayout title="Products Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Clothing Products</h1>
            <p className="text-gray-600 mt-1">Add, edit, or remove fashion items from your store</p>
          </div>
          <button 
            onClick={() => router.push('/admin/products/add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium w-full sm:w-auto text-center flex items-center gap-2"
          >
            <Shirt className="h-5 w-5" />
            Add New Product
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fashion products...</p>
          </div>
        )}

        {/* Products Table */}
        {!isLoading && products.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                            <Shirt className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: {product.id}</div>
                            {product.color && (
                              <div className="text-xs text-gray-500">Color: {product.color}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            product.stock > 20 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : product.stock > 0 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {product.stock} in stock
                          </span>
                          {product.stock <= 10 && product.stock > 0 && (
                            <span className="ml-2 text-xs text-yellow-600">Low stock</span>
                          )}
                          {product.stock === 0 && (
                            <span className="ml-2 text-xs text-red-600">Out of stock</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors border border-blue-200 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors border border-red-200 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{products.length}</span> fashion products
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <Shirt className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No fashion products yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your fashion catalog by adding your first clothing item to the store.
            </p>
            <button 
              onClick={() => router.push('/admin/products/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium inline-flex items-center"
            >
              <Shirt className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}