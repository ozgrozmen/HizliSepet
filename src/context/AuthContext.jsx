import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { notifications } from '@mantine/notifications';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mevcut oturum kontrolü
    const { data: { session } } = supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // E-posta doğrulama kontrolü
        if (error.message === 'Email not confirmed') {
          notifications.show({
            title: 'E-posta Doğrulanmamış',
            message: 'Lütfen e-posta adresinize gönderilen doğrulama bağlantısını tıklayın. Doğrulama e-postasını tekrar göndermek için "Tekrar Gönder" butonunu kullanabilirsiniz.',
            color: 'yellow',
            autoClose: false,
          });
          return { error: 'email_not_confirmed' };
        }

        notifications.show({
          title: 'Giriş Hatası',
          message: 'E-posta veya şifre hatalı.',
          color: 'red',
        });
        return { error };
      }

      setUser(data.user);
      return { user: data.user };
    } catch (error) {
      notifications.show({
        title: 'Beklenmeyen Hata',
        message: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
        color: 'red',
      });
      return { error };
    }
  };

  const register = async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        notifications.show({
          title: 'Kayıt Hatası',
          message: authError.message,
          color: 'red',
        });
        return { error: authError };
      }

      // Kullanıcı başarıyla oluşturuldu, şimdi profiles tablosuna ekleyelim
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              role: 'user', // Varsayılan rol
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              full_name: '',
              phone: '',
              address: '',
              city: '',
              district: '',
              postal_code: '',
            }
          ]);

        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
          notifications.show({
            title: 'Profil Oluşturma Hatası',
            message: 'Kullanıcı kaydı başarılı ancak profil bilgileri kaydedilemedi.',
            color: 'yellow',
          });
        }
      }

      notifications.show({
        title: 'Kayıt Başarılı',
        message: 'Lütfen e-posta adresinize gönderilen doğrulama bağlantısını tıklayın.',
        color: 'green',
        autoClose: false,
      });

      return { user: authData.user };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      notifications.show({
        title: 'Beklenmeyen Hata',
        message: 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.',
        color: 'red',
      });
      return { error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      notifications.show({
        title: 'Çıkış Hatası',
        message: 'Çıkış yapılırken bir hata oluştu.',
        color: 'red',
      });
    }
  };

  const resendConfirmationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      notifications.show({
        title: 'E-posta Gönderildi',
        message: 'Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'Doğrulama e-postası gönderilirken bir hata oluştu.',
        color: 'red',
      });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 