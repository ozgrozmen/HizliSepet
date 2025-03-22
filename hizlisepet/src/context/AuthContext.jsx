import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Sayfa ilk yüklendiğinde mevcut oturum kontrolü
    const checkCurrentSession = async () => {
      try {
        console.log('Mevcut oturum kontrolü yapılıyor...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Oturum kontrolünde hata:', error.message);
          setAuthError(error.message);
          setUser(null);
        } else if (data?.session) {
          console.log('Aktif oturum bulundu:', data.session.user.email);
          setUser(data.session.user);
        } else {
          console.log('Aktif oturum bulunamadı');
          setUser(null);
        }
      } catch (err) {
        console.error('Beklenmeyen bir hata oluştu:', err);
        setAuthError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentSession();

    // Oturum durumu değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Oturum durumu değişti:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('Kullanıcı giriş yaptı:', session.user.email);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('Kullanıcı çıkış yaptı');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token yenilendi');
          setUser(session.user);
        } else if (event === 'USER_UPDATED' && session) {
          console.log('Kullanıcı bilgileri güncellendi');
          setUser(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Kayıt hatası:', error.message);
        setAuthError(error.message);
        throw error;
      }

      console.log('Kayıt başarılı, doğrulama e-postası gönderildi');
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      console.log('Giriş denemesi:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Giriş hatası:', error.message);
        setAuthError(error.message);
        throw error;
      }

      console.log('Giriş başarılı:', data.user.email);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('Çıkış yapılıyor...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Çıkış hatası:', error.message);
        setAuthError(error.message);
        throw error;
      }
      
      console.log('Çıkış başarılı');
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 