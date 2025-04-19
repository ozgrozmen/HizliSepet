import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Sadece bir kez yüklenecek başlangıç işlemi (sayfa yüklendiğinde)
  useEffect(() => {
    console.log('Sayfa yüklendiğinde sepet kontrolü yapılıyor...');
    const checkCart = async () => {
      if (user) {
        // Kullanıcı girişi yapılmış, veritabanından verileri yükle
        console.log('Oturum açmış kullanıcı için sepet verileri yükleniyor:', user.id);
        await fetchCartItems();
      } else {
        // Kullanıcı giriş yapmamışsa, yerel depolamadan sepeti yükle
        console.log('Oturum açılmamış, localStorage\'dan sepet yükleniyor');
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            console.log('Yerel sepet bulundu:', parsedCart);
            
            // Tüm ürün referanslarının doğru olduğundan emin olalım
            const validatedCart = parsedCart.map(item => {
              // Eğer product nesnesi yoksa veya eksikse düzeltelim
              if (!item.product && item.product_id) {
                console.warn('Eksik ürün bilgisi, varsayılan bilgiler kullanılıyor:', item.product_id);
                return {
                  ...item,
                  product: {
                    id: item.product_id,
                    name: 'Ürün bilgisi yüklenemedi',
                    price: item.price || 0,
                    image_url: '',
                    description: ''
                  }
                };
              }
              return item;
            });
            
            setCartItems(validatedCart);
          } catch (error) {
            console.error('Sepet verisi ayrıştırılırken hata:', error);
            setCartItems([]);
            localStorage.setItem('cart', JSON.stringify([]));
          }
        } else {
          console.log('Yerel sepet bulunamadı, boş sepet oluşturuluyor');
          setCartItems([]);
          localStorage.setItem('cart', JSON.stringify([]));
        }
        setLoading(false);
      }
    };
    
    checkCart();
  }, []); // Sadece bir kez çalış
  
  // Kullanıcı değiştiğinde sepeti güncelle
  useEffect(() => {
    console.log('Kullanıcı durumu değişti, sepet güncelleniyor:', user ? 'Giriş yapılmış' : 'Giriş yapılmamış');
    if (user) {
      fetchCartItems();
    } else {
      // Kullanıcı çıkış yaptığında yerel depolamadan sepeti yükle
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart));
        } catch (error) {
          console.error('Sepet verisi ayrıştırılırken hata:', error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setLoading(false);
    }
  }, [user]);

  // Farklı sekmelerde localStorage senkronizasyonu için storage event dinleyicisi
  useEffect(() => {
    if (!user) {
      // Storage event listener ekleniyor
      const handleStorageChange = (e) => {
        console.log('Storage değişikliği algılandı:', e);
        
        // Sadece cart anahtarı değiştiğinde tepki ver
        if (e.key === 'cart') {
          try {
            // cart silindiyse boş dizi kullan, değilse yeni değeri kullan
            const newCart = e.newValue ? JSON.parse(e.newValue) : [];
            console.log('Sepet güncelleniyor:', newCart);
            setCartItems(newCart);
          } catch (error) {
            console.error('Sepet verisi ayrıştırılırken hata:', error);
          }
        }
      };

      // Event listener'ı ekle
      window.addEventListener('storage', handleStorageChange);
      
      // Component unmount olduğunda event listener'ı kaldır
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [user]);

  // Sepet değiştiğinde yerel depolamayı güncelle (giriş yapmamış kullanıcılar için)
  useEffect(() => {
    if (!user) {
      console.log('Sepet değişti, localStorage güncelleniyor:', cartItems);
      // Her durumda sepeti kaydet (boş olsa bile)
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
    
    // Ürün nesnesi içindeki tüm gerekli bilgileri saklayacağız
    // Böylece sayfa yenilendiğinde ürün bilgileri korunacak
    const safeProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      description: product.description,
      // Diğer gerekli ürün bilgilerini ekle
      stock: product.stock,
      category: product.category,
      subcategory: product.subcategory
    };
    
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
            product: safeProduct, // Tam ürün nesnesi yerine sadece gerekli bilgileri içeren nesne
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
      
      // Yerel depolamayı güncelle (boş olsa bile array olarak)
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
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

  // Sepeti lokalde temizle (giriş yapmamış kullanıcılar için)
  const clearCartLocally = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
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