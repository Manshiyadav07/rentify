import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get('/api/wishlist');
      if (data.success) {
        setWishlist(data.books || []);
        const ids = new Set((data.books || []).map(b => (b._id || b).toString()));
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (book) => {
    if (!user) {
      toast.info('Please log in to save books to your wishlist.');
      return;
    }

    const bookId = (book._id || book).toString();
    const isCurrentlySaved = wishlistIds.has(bookId);

    // Optimistic UI update
    const updatedSet = new Set(wishlistIds);
    if (isCurrentlySaved) {
      updatedSet.delete(bookId);
      setWishlist(prev => prev.filter(b => (b._id || b).toString() !== bookId));
    } else {
      updatedSet.add(bookId);
      setWishlist(prev => [...prev, book]);
    }
    setWishlistIds(updatedSet);

    try {
      const { data } = await axios.post('/api/wishlist/toggle', { bookId });
      if (data.success) {
        toast.info(data.message);
      }
    } catch (err) {
      // Revert on failure
      fetchWishlist();
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = (bookId) => {
    return wishlistIds.has((bookId || '').toString());
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
