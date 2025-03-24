import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Kullanıcının sepetini veritabanından çek
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      // Kullanıcı giriş yapmamışsa, yerel depolamadan sepeti yükle
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      } else {
        setCartItems([]);
      }
      setLoading(false);
    }
  }, [user]);

  // Sepet değiştiğinde yerel depolamayı güncelle (giriş yapmamış kullanıcılar için)
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const fetchCartItems = async () => {
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
        setLoading(false);
        return;
      }

      setCartItems(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Sepet yüklenirken beklenmeyen hata:', err);
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, color = null, size = null) => {
    console.log('addToCart çağrıldı', { product, quantity, color, size });
    
    if (!product || !product.id) {
      console.error('Geçersiz ürün veya ürün ID\'si:', product);
      return false;
    }

    try {
      if (user) {
        // Oturum açmış kullanıcılar için veritabanına kaydet
        try {
          console.log('Oturum açmış kullanıcı için sepete ekleme işlemi başlatılıyor', user.id);
          
          // Önce aynı ürünün sepette olup olmadığını kontrol et
          const existingItemIndex = cartItems.findIndex(
            item => item.product_id === product.id && 
                  item.color === color && 
                  item.size === size
          );

          console.log('Mevcut sepet durumu:', { cartItems, existingItemIndex });

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
              // Veritabanı hatası durumunda yerel depolamaya geç
              return addToCartLocally(product, quantity, color, size);
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
              // Veritabanı hatası durumunda yerel depolamaya geç
              return addToCartLocally(product, quantity, color, size);
            }

            // Eklenen ürün bilgilerini almak için ikinci bir sorgu
            if (data && data.length > 0) {
              const cartItem = data[0];
              const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', product.id)
                .single();
              
              if (!productError && productData) {
                const newItem = {
                  ...cartItem,
                  product: productData
                };
                setCartItems([...cartItems, newItem]);
              } else {
                // Ürün detayları alınamadıysa, sadece sepet öğesini ekle
                setCartItems([...cartItems, ...data]);
              }
            }
          }

          console.log('Ürün başarıyla sepete eklendi');
          return true;
        } catch (err) {
          console.error('Sepete ekleme hatası, yerel depolamaya geçiliyor:', err);
          // Herhangi bir hata durumunda yerel depolamaya geç
          return addToCartLocally(product, quantity, color, size);
        }
      } else {
        // Kullanıcı giriş yapmamışsa direkt lokale kaydet
        return addToCartLocally(product, quantity, color, size);
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
      // Son çare olarak yine lokale kaydetmeyi dene
      return addToCartLocally(product, quantity, color, size);
    }
  };

  // Yerel depolamaya ürünü ekle (ortak fonksiyon)
  const addToCartLocally = (product, quantity, color, size) => {
    console.log('Oturum açmamış kullanıcı için yerel depolamaya ekleniyor');
    
    const existingItemIndex = cartItems.findIndex(
      item => item.product_id === product.id && 
             item.color === color && 
             item.size === size
    );

    try {
      if (existingItemIndex >= 0) {
        console.log('Ürün zaten yerel sepette var, miktar güncelleniyor');
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        setCartItems(updatedItems);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      } else {
        console.log('Yeni ürün yerel sepete ekleniyor');
        const newCart = [
          ...cartItems,
          {
            id: Date.now().toString(),
            product_id: product.id,
            product: product,
            quantity,
            color,
            size,
            price: product.price
          }
        ];
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      
      console.log('Ürün başarıyla yerel sepete eklendi');
      return true;
    } catch (localErr) {
      console.error('Yerel depolamaya eklenirken hata:', localErr);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    console.log('removeFromCart çağrıldı, itemId:', itemId);

    try {
      if (user) {
        // Oturum açmış kullanıcılar için veritabanından sil
        try {
          console.log('Oturum açmış kullanıcı için sepetten silme işlemi başlatılıyor');
          
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

          if (error) {
            console.error('Sepetten silinirken hata:', error);
            // Veritabanı hatası durumunda yerel işleme geç
            return removeFromCartLocally(itemId);
          }

          console.log('Ürün veritabanından silindi, sepet güncelleniyor');
          setCartItems(cartItems.filter(item => item.id !== itemId));
          return true;
        } catch (err) {
          console.error('Sepetten silme hatası, yerel işleme geçiliyor:', err);
          // Herhangi bir hata durumunda yerel işleme geç
          return removeFromCartLocally(itemId);
        }
      } else {
        // Kullanıcı giriş yapmamışsa direkt lokalden sil
        return removeFromCartLocally(itemId);
      }
    } catch (err) {
      console.error('Beklenmeyen silme hatası:', err);
      // Son çare olarak yine lokali güncellemeyi dene
      return removeFromCartLocally(itemId);
    }
  };

  // Yerel depolamadan ürünü sil (ortak fonksiyon)
  const removeFromCartLocally = (itemId) => {
    console.log('Yerel sepetten ürün siliniyor, itemId:', itemId);
    
    try {
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      
      // Yerel depolamayı güncelle
      if (updatedItems.length > 0) {
        localStorage.setItem('cart', JSON.stringify(updatedItems));
      } else {
        localStorage.removeItem('cart');
      }
      
      console.log('Ürün başarıyla yerel sepetten silindi');
      return true;
    } catch (localErr) {
      console.error('Yerel depolamadan silinirken hata:', localErr);
      return false;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    console.log('updateQuantity çağrıldı', { itemId, newQuantity });
    
    // 0 veya negatif değerler için sepetten kaldır
    if (newQuantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      if (user) {
        try {
          console.log('Oturum açmış kullanıcı için miktar güncelleniyor');
          
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', itemId);

          if (error) {
            console.error('Miktar güncellenirken hata:', error);
            return updateQuantityLocally(itemId, newQuantity);
          }

          const updatedItems = cartItems.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          );
          setCartItems(updatedItems);
          return true;
        } catch (err) {
          console.error('Miktar güncelleme hatası, yerel işleme geçiliyor:', err);
          return updateQuantityLocally(itemId, newQuantity);
        }
      } else {
        return updateQuantityLocally(itemId, newQuantity);
      }
    } catch (err) {
      console.error('Beklenmeyen miktar güncelleme hatası:', err);
      return updateQuantityLocally(itemId, newQuantity);
    }
  };

  // Yerel depolamada miktarı güncelle (ortak fonksiyon)
  const updateQuantityLocally = (itemId, newQuantity) => {
    console.log('Yerel sepette miktar güncelleniyor:', { itemId, newQuantity });
    
    try {
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      
      // Yerel depolamayı güncelle
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      console.log('Miktar başarıyla yerel sepette güncellendi');
      return true;
    } catch (localErr) {
      console.error('Yerel depolamada miktar güncellenirken hata:', localErr);
      return false;
    }
  };

  // Sepeti tamamen temizle
  const clearCart = async () => {
    console.log('clearCart çağrıldı');
    
    try {
      if (user) {
        try {
          console.log('Oturum açmış kullanıcı için sepet temizleniyor');
          
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            console.error('Sepet temizlenirken hata:', error);
            return clearCartLocally();
          }

          setCartItems([]);
          return true;
        } catch (err) {
          console.error('Sepet temizleme hatası, yerel işleme geçiliyor:', err);
          return clearCartLocally();
        }
      } else {
        return clearCartLocally();
      }
    } catch (err) {
      console.error('Beklenmeyen sepet temizleme hatası:', err);
      return clearCartLocally();
    }
  };

  const clearCartLocally = () => {
    try {
      localStorage.removeItem('guestCart');
      setCartItems([]);
      console.log('Yerel sepet başarıyla temizlendi');
      return true;
    } catch (error) {
      console.error('Yerel sepet temizleme hatası:', error);
      return false;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Ürün fiyatını alırken, ürün bilgisi farklı formatta olabilir
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