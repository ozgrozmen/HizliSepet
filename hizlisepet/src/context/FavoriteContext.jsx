import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Kullanıcının favorilerini veritabanından çek
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Favoriler çekilirken hata:', error);
      return;
    }

    setFavorites(data.map(fav => fav.product_id));
  };

  const toggleFavorite = async (productId) => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa işlemi engelle
      return false;
    }

    const isFavorite = favorites.includes(productId);

    if (isFavorite) {
      // Favorilerden çıkar
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Favori silinirken hata:', error);
        return false;
      }

      setFavorites(favorites.filter(id => id !== productId));
    } else {
      // Favorilere ekle
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: user.id, product_id: productId }
        ]);

      if (error) {
        console.error('Favori eklenirken hata:', error);
        return false;
      }

      setFavorites([...favorites, productId]);
    }

    return true;
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  return useContext(FavoriteContext);
} 