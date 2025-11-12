import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';
import { useCartWishlist } from '@/contexts/CartWishlistContext';
import { Search, Filter, Package, Heart, ShoppingCart, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllProducts() {
  const router = useRouter();
  const { search, subcategoryId, minPrice, maxPrice, inStock, sortBy, sortOrder, page } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    search: search || '',
    subcategoryId: subcategoryId || '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
    inStock: inStock === 'true',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    page: parseInt(page) || 1,
    limit: 12
  });

  // Use context for wishlist
  const { addToWishlist, isInWishlist } = useCartWishlist();

  // Calculate minimum price: base + minimum price from each option type
  const getMinimumPrice = (product) => {
    let minPrice = product.price; // Start with base price
    
    // If product has option types, add the minimum price from each option type
    if (product.optionTypes && product.optionTypes.length > 0) {
      product.optionTypes.forEach(optionType => {
        if (optionType.values && optionType.values.length > 0) {
          // Find the minimum price among all values in this option type
          const minOptionPrice = Math.min(
            ...optionType.values.map(val => {
              if (typeof val === 'object' && val.price !== undefined) {
                return val.price;
              }
              return 0;
            })
          );
          
          minPrice += minOptionPrice;
        }
      });
    }
    
    return minPrice;
  };

  // Calculate effective stock based on option values
  const getEffectiveStock = (product) => {
    // If no option types, return base stock
    if (!product.optionTypes || product.optionTypes.length === 0) {
      return product.stock;
    }

    // Find the minimum stock across all option values
    let minStock = product.stock; // Start with base stock
    
    product.optionTypes.forEach(optionType => {
      if (optionType.values && optionType.values.length > 0) {
        optionType.values.forEach(val => {
          if (typeof val === 'object' && val.stock !== undefined) {
            // If any option value has lower stock, use that
            if (val.stock < minStock) {
              minStock = val.stock;
            }
          }
        });
      }
    });
    
    return minStock;
  };

  // Fetch products whenever filters or router query changes
  useEffect(() => {
    if (router.isReady) {
      // Update filters from URL query
      setFilters(prev => ({
        ...prev,
        search: search || '',
        subcategoryId: subcategoryId || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        inStock: inStock === 'true',
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
        page: parseInt(page) || 1,
      }));
      
      fetchProducts();
    }
  }, [router.query, router.isReady]);

  useEffect(() => {
    fetchCategories();
    checkUser();
    
    // Listen for auth changes
    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleLogout);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const handleUserLogin = () => {
    checkUser();
  };

  const checkUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (search) queryParams.append('search', search);
      if (subcategoryId) queryParams.append('categoryId', subcategoryId);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (inStock === 'true') queryParams.append('inStock', 'true');
      queryParams.append('sortBy', sortBy || 'createdAt');
      queryParams.append('sortOrder', sortOrder || 'desc');
      queryParams.append('page', page || '1');
      queryParams.append('limit', '12');

      const response = await apiClient.get(`/api/public/products?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/public/categories');
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const queryParams = new URLSearchParams(router.query);
    
    if (value) {
      queryParams.set(key, value);
    } else {
      queryParams.delete(key);
    }
    
    if (key !== 'page') {
      queryParams.set('page', '1');
    }
    
    router.push(`/customer/all-products?${queryParams.toString()}`, undefined, { shallow: true });
  };

  const handlePageChange = (newPage) => {
    handleFilterChange('page', newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };

  const clearAllFilters = () => {
    router.push('/customer/all-products');
  };

  const clearFilter = (filterKey) => {
    const queryParams = new URLSearchParams(router.query);
    queryParams.delete(filterKey);
    queryParams.set('page', '1');
    router.push(`/customer/all-products?${queryParams.toString()}`, undefined, { shallow: true });
  };

  const handleAddToWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!authService.isAuthenticated()) {
      toast.error('Please login to add items to wishlist', {
        icon: '🔒',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
      
      setTimeout(() => {
        router.push(`/auth/login?returnUrl=${encodeURIComponent(router.asPath)}`);
      }, 1500);
      return;
    }
    
    try {
      const result = await addToWishlist(product.id);
      
      if (result.success) {
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: {
            borderRadius: '12px',
            background: '#d946ef',
            color: '#fff',
          },
        });
      } else {
        if (result.error && (result.error.includes('already') || result.error.includes('exists'))) {
          toast('Already in wishlist!', {
            icon: '💜',
            style: {
              borderRadius: '12px',
              background: '#8b5cf6',
              color: '#fff',
            },
          });
        } else {
          toast.error(result.error || 'Failed to add to wishlist', {
            style: {
              borderRadius: '12px',
              background: '#ef4444',
              color: '#fff',
            },
          });
        }
      }
    } catch (error) {
      toast.error('Failed to add to wishlist. Please try again.', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  };

  const activeFiltersCount = [search, subcategoryId, minPrice, maxPrice, inStock].filter(Boolean).length;
  const selectedCategory = categories.find(cat => cat.id === subcategoryId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {search ? `Search Results for "${search}"` : 
             selectedCategory ? selectedCategory.name : 
             'All Products'}
          </h1>
          <p className="text-gray-600">
            {pagination && `Showing ${products.length} of ${pagination.total} products`}
          </p>
          
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Search: {search}
                  <button onClick={() => clearFilter('search')} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Category: {selectedCategory.name}
                  <button onClick={() => clearFilter('subcategoryId')} className="hover:text-purple-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Min: ${minPrice}
                  <button onClick={() => clearFilter('minPrice')} className="hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Max: ${maxPrice}
                  <button onClick={() => clearFilter('maxPrice')} className="hover:text-green-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {inStock === 'true' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  In Stock
                  <button onClick={() => clearFilter('inStock')} className="hover:text-orange-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </form>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* In Stock */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 mb-2">No products found</p>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product, idx) => {
                    const inWishlist = isInWishlist(product.id);
                    const minPrice = getMinimumPrice(product);
                    const effectiveStock = getEffectiveStock(product);
                    const hasOptions = product.optionTypes && product.optionTypes.length > 0;
                    
                    return (
                      <div
                        key={product.id}
                        className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 animate-scale-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="relative aspect-square bg-gray-100">
                          <Link href={`/customer/product/${product.id}`}>
                            <img
                              src={product.img || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                            />
                          </Link>
                          
                          {effectiveStock === 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">Out of Stock</span>
                            </div>
                          )}

                          {effectiveStock > 0 && effectiveStock < 5 && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse z-10">
                              Only {effectiveStock} left
                            </div>
                          )}

                          <button
                            onClick={(e) => handleAddToWishlist(e, product)}
                            className={`absolute top-3 right-3 p-2.5 backdrop-blur-sm rounded-full hover:scale-110 transition-all shadow-lg z-10 ${
                              inWishlist 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/95 text-gray-600 hover:text-red-500 hover:bg-white'
                            }`}
                            title={inWishlist ? 'In wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <div className="p-5">
                          {product.categoryName && (
                            <span className="inline-block mb-2 px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full uppercase">
                              {product.categoryName}
                            </span>
                          )}

                          <Link href={`/customer/product/${product.id}`}>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                              {product.name}
                            </h3>
                          </Link>

                          {product.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <div>
                              {hasOptions ? (
                                <div>
                                  <span className="text-sm font-normal text-gray-500 block">From</span>
                                  <span className="text-2xl font-bold text-blue-600">
                                    ${minPrice.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-2xl font-bold text-blue-600">
                                  ${product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              Stock: {effectiveStock}
                            </span>
                          </div>

                          <Link href={`/customer/product/${product.id}`}>
                            <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {[...Array(Math.min(pagination.totalPages, 5))].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              pagination.page === pageNum
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'border-2 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}