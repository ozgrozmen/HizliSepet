import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
      }
    };

    loadCart();
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Sepet yüklenirken hata:', error);
        setCartItems([]);
        return;
      }

      setCartItems(data || []);
    } catch (err) {
      console.error('Sepet yüklenirken beklenmeyen hata:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, color = null, size = null) => {
    console.log('addToCart çağrıldı', { product, quantity, color, size });
    
    if (!product || !product.id) {
      console.error('Geçersiz ürün veya ürün ID\'si:', product);
      return false;
    }

    // Kullanıcı giriş yapmamışsa işlemi engelle
    if (!user) {
      console.warn('Kullanıcı giriş yapmamış, sepete ekleme engellendi');
      return false;
    }

    try {
      console.log('Oturum açmış kullanıcı için sepete ekleme işlemi başlatılıyor', user.id);
      
      // Önce aynı ürünün sepette olup olmadığını kontrol et
      const existingItemIndex = cartItems.findIndex(
        item => item.product_id === product.id && 
              item.color === color && 
              item.size === size
      );

      if (existingItemIndex >= 0) {
        // Ürün zaten sepette, miktarı güncelle
        console.log('Ürün sepette var, miktar güncelleniyor');
        const updatedItems = [...cartItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', updatedItems[existingItemIndex].id);

        if (error) {
          console.error('Sepet güncellenirken hata:', error);
          return false;
        }

        updatedItems[existingItemIndex].quantity = newQuantity;
        setCartItems(updatedItems);
        console.log('Miktar güncellendi:', newQuantity);
      } else {
        // Yeni ürün ekle
        console.log('Yeni ürün sepete ekleniyor:', {
          user_id: user.id,
          product_id: product.id,
          quantity,
          color,
          size,
          price: product.price
        });
        
        const { data, error } = await supabase
          .from('cart_items')
          .insert([
            { 
              user_id: user.id, 
              product_id: product.id, 
              quantity, 
              color, 
              size,
              price: product.price
            }
          ])
          .select();

        if (error) {
          console.error('Sepete eklenirken hata:', error);
          return false;
        }

        // Eklenen ürün bilgilerini almak için ikinci bir sorgu
        if (data && data.length > 0) {
          const cartItem = data[0];
          const newItem = {
            ...cartItem,
            product: product
          };
          setCartItems([...cartItems, newItem]);
        }
      }

      console.log('Ürün başarıyla sepete eklendi');
      return true;
    } catch (err) {
      console.error('Sepete ekleme hatası:', err);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    console.log('removeFromCart çağrıldı, itemId:', itemId);

    if (!user) {
      console.warn('Kullanıcı giriş yapmamış');
      return false;
    }

    try {
      console.log('Sepetten silme işlemi başlatılıyor');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Sepetten silinirken hata:', error);
        return false;
      }

      console.log('Ürün veritabanından silindi, sepet güncelleniyor');
      setCartItems(cartItems.filter(item => item.id !== itemId));
      return true;
    } catch (err) {
      console.error('Sepetten silme hatası:', err);
      return false;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    console.log('updateQuantity çağrıldı', { itemId, newQuantity });
    
    if (!user) {
      console.warn('Kullanıcı giriş yapmamış');
      return false;
    }
    
    // 0 veya negatif değerler için sepetten kaldır
    if (newQuantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      console.log('Miktar güncelleniyor');
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) {
        console.error('Miktar güncellenirken hata:', error);
        return false;
      }

      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      return true;
    } catch (err) {
      console.error('Miktar güncelleme hatası:', err);
      return false;
    }
  };

  // Sepeti tamamen temizle
  const clearCart = async () => {
    console.log('clearCart çağrıldı');
    
    if (!user) {
      console.warn('Kullanıcı giriş yapmamış');
      setCartItems([]);
      return true;
    }

    try {
      console.log('Sepet temizleniyor');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Sepet temizlenirken hata:', error);
        return false;
      }

      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Sepet temizleme hatası:', err);
      return false;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || (item.product ? item.product.price : 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 