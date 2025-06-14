import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Admin kontrolü için basit fonksiyon
  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  // Kullanıcı profilini getir
  const fetchUserProfile = async (userId) => {
    try {
      console.log('Profil yükleniyor:', userId);
      
      // Timeout kaldırıldı - direkt sorgu
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profil hatası:', error);
        
        // Bilinen admin email'leri için fallback
        const { data: { user } } = await supabase.auth.getUser();
        const knownAdminEmails = [
          'sefedemircan@gmail.com',
          'ozgrozmen7@gmail.com', 
          'oguzozmen7@gmail.com',
          'oguzozmen07@gmail.com',
          'ozay.m.yildiz@gmail.com',
          'tiryaki2424@gmail.com'
        ];
        
        const isKnownAdmin = knownAdminEmails.includes(user?.email);
        
        return {
          id: userId,
          email: user?.email,
          role: isKnownAdmin ? 'admin' : 'user',
          is_fallback: true
        };
      }

      console.log('Profil yüklendi:', data.role);
      return data;
    } catch (err) {
      console.error('Profil yükleme hatası:', err);
      
      // Timeout durumunda da fallback döndür
      return {
        id: userId, 
        role: 'user', 
        email: null,
        is_error: true
      };
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout;
    let isInitializing = false;

    const initializeAuth = async () => {
      // Eğer zaten initialization devam ediyorsa, tekrar başlatma
      if (isInitializing) {
        console.log('Auth initialization zaten devam ediyor, atlaniyor...');
        return;
      }

      isInitializing = true;

      try {
        console.log('Auth başlatılıyor...');
        
        // Önce Supabase'in hazır olup olmadığını kontrol et
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session hatası:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
          setLoading(false);
          }
          return;
        }

        if (data?.session) {
          console.log('Session bulundu:', data.session.user.email);
          if (mounted) {
          setUser(data.session.user);
            
            // Profil yükle - basit timeout ile
            try {
              const userProfile = await fetchUserProfile(data.session.user.id);
              setProfile(userProfile);
              console.log('Kullanıcı rolü:', userProfile?.role);
          } catch (profileError) {
              console.warn('Profil yükleme hatası, fallback kullanılıyor:', profileError);
              // Fallback profil oluştur
              setProfile({
                id: data.session.user.id, 
                email: data.session.user.email,
                role: 'user',
                is_timeout: true
              });
            }
          }
        } else {
          console.log('Session yok');
          if (mounted) {
          setUser(null);
          setProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        // Hata durumunda da state'leri temizle
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        isInitializing = false;
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Kısa bir delay ile initialize et (çoklu çağrıları önlemek için)
    const timeoutId = setTimeout(() => {
    initializeAuth();
    }, 100);

    // Auth state değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth State Change:', event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('Giriş yapıldı:', session.user.email);
          setUser(session.user);
          
          try {
            const userProfile = await fetchUserProfile(session.user.id);
              setProfile(userProfile);
            console.log('Kullanıcı rolü:', userProfile?.role);
          } catch (error) {
            console.error('Auth state change profil yükleme hatası:', error);
            setProfile({
                id: session.user.id, 
              email: session.user.email,
              role: 'user',
              is_error: true
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Çıkış yapıldı');
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token yenilendi:', session.user.email);
          setUser(session.user);
          
          // Profil varsa koru, yoksa yükle
          if (!profile || profile.id !== session.user.id) {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
                setProfile(userProfile);
            } catch (error) {
              console.error('Token refresh profil yükleme hatası:', error);
            }
          }
        }
        
        // Auth state change'de loading'i false yap
          setLoading(false);
      }
    );

    return () => {
      mounted = false;
      isInitializing = false;
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
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
        setAuthError(error.message);
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      console.log('Giriş başarılı:', data.user.email);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    authError,
    isAdmin,
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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 