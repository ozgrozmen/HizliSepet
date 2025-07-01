import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Kullanıcı değiştiğinde sepeti yükle
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        console.log('Kullanıcı giriş yapmış, sepet yükleniyor:', user.email);
        await fetchCartItems();
      } else {
        console.log('Kullanıcı çıkış yapmış, sepet temizleniyor');
        setCartItems([]);
        setLoading(false);
        setError(null);
      }
    };

    loadCart();
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Sepet yüklenirken hata:', error);
        setError('Sepet yüklenirken bir hata oluştu');
        setCartItems([]);
        return;
      }

      setCartItems(data || []);
    } catch (err) {
      console.error('Sepet yüklenirken beklenmeyen hata:', err);
      setError('Beklenmeyen bir hata oluştu');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Önce ürünün sepette olup olmadığını kontrol et
      const existingItem = cartItems.find(item => item.product_id === product.id);

      if (existingItem) {
        // Ürün zaten sepette varsa miktarını güncelle
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Sepet güncellenirken hata:', error);
          setError('Ürün miktarı güncellenirken bir hata oluştu');
          return false;
        }
      } else {
        // Ürün sepette yoksa yeni ekle
        const { error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: product.id,
            quantity,
            price: product.discount_price || product.price
          }]);

        if (error) {
          console.error('Sepete ekleme hatası:', error);
          setError('Ürün sepete eklenirken bir hata oluştu');
          return false;
        }
      }

      // Sepeti yeniden yükle
      await fetchCartItems();
      return true;
    } catch (err) {
      console.error('Sepete ekleme işlemi sırasında hata:', err);
      setError('Beklenmeyen bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Sepetten ürün silinirken hata:', error);
        setError('Ürün sepetten silinirken bir hata oluştu');
        return false;
      }

      setCartItems(cartItems.filter(item => item.id !== itemId));
      return true;
    } catch (err) {
      console.error('Sepetten silme işlemi sırasında hata:', err);
      setError('Beklenmeyen bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user || quantity < 1) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Miktar güncellenirken hata:', error);
        setError('Ürün miktarı güncellenirken bir hata oluştu');
        return false;
      }

      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      return true;
    } catch (err) {
      console.error('Miktar güncelleme işlemi sırasında hata:', err);
      setError('Beklenmeyen bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Sepet temizlenirken hata:', error);
        setError('Sepet temizlenirken bir hata oluştu');
        return false;
      }

      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Sepet temizleme işlemi sırasında hata:', err);
      setError('Beklenmeyen bir hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
      refetch: fetchCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 