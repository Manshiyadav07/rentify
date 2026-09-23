import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

const recalculateLocalTotals = (items) => {
  let subtotal = 0;
  let securityDepositTotal = 0;

  const validItems = (items || []).filter(item => item && item.book);

  validItems.forEach(item => {
    const fee = item.book.rentalPrice || 0;
    const deposit = item.book.securityDeposit || 0;
    subtotal += fee;
    securityDepositTotal += deposit;
  });

  return {
    items: validItems,
    subtotal,
    securityDepositTotal,
    grandTotal: subtotal + securityDepositTotal,
    itemCount: validItems.length
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('rentifyGuestCart');
      if (stored) {
        const parsed = JSON.parse(stored);
        return recalculateLocalTotals(parsed);
      }
    } catch {
      // Ignore
    }
    return {
      items: [],
      subtotal: 0,
      securityDepositTotal: 0,
      grandTotal: 0,
      itemCount: 0
    };
  });

  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch cart from server when user is logged in
  const fetchCart = useCallback(async () => {
    if (!user) {
      try {
        const stored = localStorage.getItem('rentifyGuestCart');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCart(recalculateLocalTotals(parsed));
          return;
        }
      } catch {
        // Fallback
      }
      setCart({ items: [], subtotal: 0, securityDepositTotal: 0, grandTotal: 0, itemCount: 0 });
      return;
    }

    try {
      setLoading(true);

      // 1. Check if there are any guest cart items to sync to backend
      const storedGuest = localStorage.getItem('rentifyGuestCart');
      if (storedGuest) {
        const parsedGuest = JSON.parse(storedGuest);
        if (Array.isArray(parsedGuest) && parsedGuest.length > 0) {
          for (const item of parsedGuest) {
            const bId = item.book?._id || item.book;
            if (bId) {
              await axios.post('/api/cart', {
                bookId: bId,
                rentalDays: item.rentalDays || 14
              }).catch(() => {});
            }
          }
          localStorage.removeItem('rentifyGuestCart');
        }
      }

      // 2. Fetch fresh cart from server
      const { data } = await axios.get('/api/cart');
      if (data.success) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Add book to cart (Supports both authenticated users & guest visitors)
   */
  const addToCart = async (bookOrId, rentalDays = 14) => {
    const bookId = typeof bookOrId === 'object' ? bookOrId._id : bookOrId;
    const bookObj = typeof bookOrId === 'object' ? bookOrId : null;

    if (!bookId) {
      toast.error('Invalid book selected');
      return false;
    }

    // Authenticated User Workflow
    if (user) {
      try {
        setLoading(true);
        const { data } = await axios.post('/api/cart', { bookId, rentalDays: Number(rentalDays) });
        if (data.success) {
          setCart(data.cart);
          toast.success(data.message || 'Added to your rental cart!');
          setIsDrawerOpen(true);
          return true;
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add to cart');
        return false;
      } finally {
        setLoading(false);
      }
    }

    // Guest Visitor Workflow (Stores in localStorage with real calculations)
    try {
      let resolvedBook = bookObj;
      if (!resolvedBook) {
        const { data } = await axios.get(`/api/books/${bookId}`);
        resolvedBook = data.book;
      }

      if (!resolvedBook) {
        toast.error('Could not find book details');
        return false;
      }

      const storedGuest = localStorage.getItem('rentifyGuestCart');
      const guestItems = storedGuest ? JSON.parse(storedGuest) : [];

      const existingIndex = guestItems.findIndex(
        i => (i.book?._id || i.book) === bookId
      );

      const fee = resolvedBook.rentalPrice || 0;
      const deposit = resolvedBook.securityDeposit || 0;

      const cartItem = {
        _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        book: resolvedBook,
        rentalDays: Number(rentalDays),
        rentalFee: fee,
        securityDeposit: deposit,
        totalItemCost: fee + deposit
      };

      if (existingIndex > -1) {
        guestItems[existingIndex].rentalDays = Number(rentalDays);
      } else {
        guestItems.push(cartItem);
      }

      localStorage.setItem('rentifyGuestCart', JSON.stringify(guestItems));
      const updatedTotals = recalculateLocalTotals(guestItems);
      setCart(updatedTotals);
      toast.success(`"${resolvedBook.title}" added to your rental cart!`);
      setIsDrawerOpen(true);
      return true;
    } catch (err) {
      console.error('Guest cart error:', err);
      toast.error('Could not add to cart');
      return false;
    }
  };

  /**
   * Update rental duration for an item
   */
  const updateRentalDays = async (bookId, rentalDays) => {
    if (user) {
      try {
        const { data } = await axios.put(`/api/cart/${bookId}`, { rentalDays: Number(rentalDays) });
        if (data.success) {
          setCart(data.cart);
        }
      } catch (err) {
        toast.error('Failed to update rental duration');
      }
      return;
    }

    // Guest cart update
    try {
      const storedGuest = localStorage.getItem('rentifyGuestCart');
      if (storedGuest) {
        const items = JSON.parse(storedGuest);
        const item = items.find(i => (i.book?._id || i.book) === bookId);
        if (item) {
          item.rentalDays = Number(rentalDays);
          localStorage.setItem('rentifyGuestCart', JSON.stringify(items));
          setCart(recalculateLocalTotals(items));
        }
      }
    } catch (err) {
      console.error('Failed to update guest duration:', err);
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = async (bookId) => {
    if (user) {
      try {
        const { data } = await axios.delete(`/api/cart/${bookId}`);
        if (data.success) {
          setCart(data.cart);
          toast.info(data.message || 'Item removed from cart');
        }
      } catch (err) {
        toast.error('Failed to remove item');
      }
      return;
    }

    // Guest cart removal
    try {
      const storedGuest = localStorage.getItem('rentifyGuestCart');
      if (storedGuest) {
        const items = JSON.parse(storedGuest);
        const filtered = items.filter(i => (i.book?._id || i.book) !== bookId);
        localStorage.setItem('rentifyGuestCart', JSON.stringify(filtered));
        setCart(recalculateLocalTotals(filtered));
        toast.info('Item removed from cart');
      }
    } catch (err) {
      console.error('Failed to remove guest item:', err);
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    localStorage.removeItem('rentifyGuestCart');
    if (user) {
      try {
        await axios.delete('/api/cart');
      } catch (err) {
        console.error('Failed to clear server cart:', err);
      }
    }
    setCart({ items: [], subtotal: 0, securityDepositTotal: 0, grandTotal: 0, itemCount: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount || 0,
        loading,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        updateRentalDays,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
