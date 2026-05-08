import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await getCart();
      setCart(data);
    } catch {
      // silently fail — user might not be logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const addItem = async (product_variant_id, quantity = 1, productName = 'Item') => {
    try {
      await addToCart(product_variant_id, quantity);
      await fetchCart();
      toast.success(`${productName} added to cart! 🛒`, {
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FBBF24',
          fontFamily: 'Outfit, sans-serif',
        },
        iconTheme: { primary: '#FBBF24', secondary: '#fff' },
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add item';
      toast.error(msg, {
        style: { fontFamily: 'Outfit, sans-serif' },
      });
      throw err;
    }
  };

  const updateItem = async (item_id, quantity) => {
    try {
      await updateCartItem(item_id, quantity);
      await fetchCart();
    } catch (err) {
      toast.error('Failed to update quantity');
      throw err;
    }
  };

  const removeItem = async (item_id) => {
    try {
      await removeCartItem(item_id);
      await fetchCart();
      toast('Item removed', {
        icon: '🗑️',
        style: { fontFamily: 'Outfit, sans-serif' },
      });
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const emptyCart = async () => {
    try {
      await clearCart();
      setCart({ items: [], total: 0, item_count: 0 });
    } catch {
      // ignore
    }
  };

  const cartCount = cart.items?.length || 0;
  const cartTotal = cart.total || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartCount,
      cartTotal,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      emptyCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

  // eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
