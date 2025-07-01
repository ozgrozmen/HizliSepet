import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Admin kontrolü için basit fonksiyon
  const isAdmin = useCallback(() => {
    return profile?.role === 'admin';
  }, [profile]);

  // Kullanıcı profilini getir
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) return null;
    
    try {
      console.log('👤 Profil yükleniyor:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Profil hatası:', error.message);
        
        // Fallback profil oluştur
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const knownAdminEmails = [
          'sefedemircan@gmail.com',
          'ozgrozmen7@gmail.com', 
          'oguzozmen7@gmail.com',
          'oguzozmen07@gmail.com',
          'ozay.m.yildiz@gmail.com',
          'tiryaki2424@gmail.com'
        ];
        
        const isKnownAdmin = knownAdminEmails.includes(currentUser?.email);
        
        return {
          id: userId,
          email: currentUser?.email,
          role: isKnownAdmin ? 'admin' : 'user',
          is_fallback: true
        };
      }

      console.log('✅ Profil yüklendi:', data.role);
      return data;
    } catch (err) {
      console.error('❌ Profil yükleme hatası:', err);
      
      return {
        id: userId, 
        role: 'user', 
        email: null,
        is_error: true
      };
    }
  }, []);

  // Session'ı yükle
  const loadSession = useCallback(async (session) => {
    if (!session?.user) {
      // clearSession'ı çağırmak yerine direkt işlemi yap
      console.log('🧹 Session temizleniyor...');
      setUser(null);
      setProfile(null);
      setAuthError(null);
      return;
    }

    console.log('📦 Session yükleniyor:', session.user.email);
    setUser(session.user);
    
    try {
      const userProfile = await fetchUserProfile(session.user.id);
      setProfile(userProfile);
      console.log('👤 Kullanıcı rolü:', userProfile?.role);
    } catch (error) {
      console.error('❌ Profil yükleme hatası:', error);
      setProfile({
        id: session.user.id, 
        email: session.user.email,
        role: 'user',
        is_error: true
      });
    }
  }, [fetchUserProfile]);

  // Auth durumunu initialize et
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Auth başlatılıyor...');
        
        // Mevcut session'ı kontrol et
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session alınamadı:', error);
          if (mounted) {
            // clearSession inline
            console.log('🧹 Session temizleniyor...');
            setUser(null);
            setProfile(null);
            setAuthError(null);
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        if (mounted) {
          if (session) {
            await loadSession(session);
          } else {
            console.log('ℹ️ Session bulunamadı');
            // clearSession inline
            console.log('🧹 Session temizleniyor...');
            setUser(null);
            setProfile(null);
            setAuthError(null);
          }
          
          setLoading(false);
          setIsInitialized(true);
        }

      } catch (err) {
        console.error('❌ Auth init hatası:', err);
        if (mounted) {
          // clearSession inline
          console.log('🧹 Session temizleniyor...');
          setUser(null);
          setProfile(null);
          setAuthError(null);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Auth state change listener
    const setupAuthListener = () => {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log(`🔄 Auth Event: ${event}`);
        
        switch (event) {
          case 'INITIAL_SESSION':
            // İlk session yüklemesi - initializeAuth tarafından handle edilir
            break;
            
          case 'SIGNED_IN':
            console.log('✅ Giriş yapıldı:', session?.user?.email);
            if (session) {
              await loadSession(session);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 Çıkış yapıldı');
            // clearSession'ı inline yap
            console.log('🧹 Session temizleniyor...');
            setUser(null);
            setProfile(null);
            setAuthError(null);
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token yenilendi:', session?.user?.email);
            if (session) {
              setUser(session.user);
              // Profil güncellemesi için fetchUserProfile'ı direkt çağır
              const userProfile = await fetchUserProfile(session.user.id);
              setProfile(userProfile);
            }
            break;
            
          case 'PASSWORD_RECOVERY':
            console.log('🔑 Şifre sıfırlama');
            break;
            
          default:
            console.log(`⚠️ Bilinmeyen auth event: ${event}`);
        }
      });
      
      return data.subscription;
    };

    // Initialize
    initializeAuth().then(() => {
      if (mounted) {
        authSubscription = setupAuthListener();
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [loadSession]);

  // Auth functions
  const signUp = useCallback(async (email, password) => {
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

      console.log('✅ Kayıt başarılı:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
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

      console.log('✅ Giriş başarılı:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    
    try {
      console.log('👋 Çıkış yapılıyor...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Çıkış hatası:', error);
        throw error;
      }
      
      // Auth listener otomatik olarak clearSession'ı çağıracak
      console.log('✅ Çıkış başarılı');
    } catch (error) {
      console.error('❌ Çıkış hatası:', error);
      // Hata olsa bile local state'i temizle - inline
      console.log('🧹 Session temizleniyor...');
      setUser(null);
      setProfile(null);
      setAuthError(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    profile,
    loading,
    authError,
    isInitialized,
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