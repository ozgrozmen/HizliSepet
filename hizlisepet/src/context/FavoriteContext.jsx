import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Kullanıcının favorilerini veritabanından çek
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Favoriler çekilirken hata:', error);
        setError('Favoriler yüklenirken bir hata oluştu');
        return;
      }

      setFavorites(data.map(fav => fav.product_id));
    } catch (err) {
      console.error('Favoriler çekilirken beklenmeyen hata:', err);
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!user) {
      return false;
    }

    try {
      const isFavorite = favorites.includes(productId);

      if (isFavorite) {
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
    } catch (err) {
      console.error('Favori işlemi sırasında hata:', err);
      return false;
    }
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  return (
    <FavoriteContext.Provider value={{ 
      favorites, 
      toggleFavorite, 
      isFavorite, 
      loading,
      error,
      refetch: fetchFavorites 
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  return useContext(FavoriteContext);
} 