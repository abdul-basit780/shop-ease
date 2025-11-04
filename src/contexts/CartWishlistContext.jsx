import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { authService } from '@/lib/auth-service';

const CartWishlistContext = createContext();

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error('useCartWishlist must be used within CartWishlistProvider');
  }
  return context;
};

export const CartWishlistProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // Fetch cart data
  const fetchCart = async () => {
    if (!authService.isAuthenticated()) {
      setCart(null);
      setCartCount(0);
      return;
    }

    try {
      setIsLoadingCart(true);
      const response = await apiClient.get('/api/customer/cart');
      
      if (response.success && response.data) {
        setCart(response.data);
        setCartCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
      setCartCount(0);
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Fetch wishlist data
  const fetchWishlist = async () => {
    if (!authService.isAuthenticated()) {
      setWishlist(null);
      setWishlistCount(0);
      return;
    }

    try {
      setIsLoadingWishlist(true);
      const response = await apiClient.get('/api/customer/wishlist');
      
      if (response.success && response.data) {
        setWishlist(response.data);
        setWishlistCount(response.data.products?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist(null);
      setWishlistCount(0);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity, selectedOptions = []) => {
    try {
      const cartData = {
        productId,
        quantity,
      };

      if (selectedOptions.length > 0) {
        cartData.selectedOptions = selectedOptions;
      }

      const response = await apiClient.post('/api/customer/cart', cartData);

      if (response.success) {
        await fetchCart();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to cart' 
      };
    }
  };

  // Update cart item quantity
  const updateCartQuantity = async (productId, quantity, selectedOptions = []) => {
    try {
      const requestBody = { quantity };

      if (selectedOptions.length > 0) {
        requestBody.selectedOptions = selectedOptions;
      }

      const response = await apiClient.put(`/api/customer/cart/${productId}`, requestBody);

      if (response.success && response.data) {
        setCart(response.data);
        setCartCount(response.data.count || 0);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update cart' 
      };
    }
  };

  // Remove from cart
  const removeFromCart = async (productId, selectedOptions = []) => {
    try {
      let requestBody = null;

      // Only include selectedOptions if they exist
      if (selectedOptions && selectedOptions.length > 0) {
        const optionIds = selectedOptions.map(opt => opt.id || opt);
        requestBody = { selectedOptions: optionIds };
      }

      console.log('Removing from cart:', {
        productId,
        requestBody
      });

      const response = await apiClient.delete(`/api/customer/cart/${productId}`, requestBody);

      console.log('Remove from cart response:', response);

      if (response.success) {
        // Update cart state with the returned cart data
        if (response.cart) {
          setCart(response.cart);
          setCartCount(response.cart.count || 0);
        } else {
          // If no cart data returned, fetch it
          await fetchCart();
        }
        return { success: true, data: response.cart };
      }
      return { success: false, error: response.error || response.message };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to remove from cart' 
      };
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    try {
      const response = await apiClient.post('/api/customer/wishlist', { productId });

      if (response.success) {
        await fetchWishlist();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to wishlist' 
      };
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const response = await apiClient.delete('/api/customer/wishlist', { productId });

      if (response.success) {
        if (response.wishlist) {
          setWishlist(response.wishlist);
          setWishlistCount(response.wishlist.products?.length || 0);
        } else {
          await fetchWishlist();
        }
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from wishlist' 
      };
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!wishlist?.products) return false;
    return wishlist.products.some(p => p.productId === productId);
  };

  // Clear cart and wishlist (for logout)
  const clearData = () => {
    setCart(null);
    setWishlist(null);
    setCartCount(0);
    setWishlistCount(0);
  };

  // Load data on mount and auth changes
  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchCart();
      fetchWishlist();
    } else {
      clearData();
    }

    // Listen for events
    const handleUserLogin = () => {
      fetchCart();
      fetchWishlist();
    };

    const handleUserLogout = () => {
      clearData();
    };

    const handleCartUpdated = () => {
      fetchCart();
    };

    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('userLoggedOut', handleUserLogout);
    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('wishlistUpdated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('userLoggedOut', handleUserLogout);
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdated);
    };
  }, []);

  const value = {
    // State
    cart,
    wishlist,
    cartCount,
    wishlistCount,
    isLoadingCart,
    isLoadingWishlist,

    // Cart methods
    addToCart,
    updateCartQuantity,
    removeFromCart,
    fetchCart,

    // Wishlist methods
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,

    // Utility
    clearData,
  };

  return (
    <CartWishlistContext.Provider value={value}>
      {children}
    </CartWishlistContext.Provider>
  );
};