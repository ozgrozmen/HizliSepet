import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AppShell, LoadingOverlay, Alert, Text, Center, Box } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const [adminCheckFailed, setAdminCheckFailed] = useState(false);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const checkAdminStatus = () => {
      console.log('🔍 Admin Layout - Status kontrol ediliyor...');
      console.log('User:', !!user, 'Profile:', !!profile, 'Role:', profile?.role);

      // Auth hala yükleniyor mu?
      if (authLoading) {
        console.log('⏳ Auth hala yükleniyor...');
        return;
      }

      // Kullanıcı giriş yapmamış
      if (!user) {
        console.log('❌ Kullanıcı giriş yapmamış');
        setAdminCheckComplete(true);
        setAdminCheckFailed(true);
        return;
      }

      // Profil yok ama user var - bekle
      if (!profile) {
        console.log('⏳ Profil yüklenmemiş, bekleniyor...');
        
        // 10 saniye sonra timeout
        timeoutId = setTimeout(() => {
          console.log('❌ Profil yükleme timeout - admin olmadığı varsayılıyor');
          setAdminCheckComplete(true);
          setAdminCheckFailed(true);
        }, 10000);
        
        return;
      }

      // Profil var, admin kontrolü yap
      console.log('✅ Profil mevcut - Role kontrolü:', profile.role);
      
      if (profile.role === 'admin') {
        console.log('🎯 ADMIN ONAYLANDI - Layout render edilecek');
        setIsAdminConfirmed(true);
        setAdminCheckComplete(true);
        setAdminCheckFailed(false);
      } else {
        console.log('❌ ADMIN DEĞİL - Erişim reddedildi. Role:', profile.role);
        setAdminCheckComplete(true);
        setAdminCheckFailed(true);
      }
    };

    checkAdminStatus();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, profile, authLoading]);

  // Auth loading durumdayken
  if (authLoading) {
    console.log('🔄 AdminLayout - Auth Loading...');
    return (
      <Center h="100vh">
        <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        <Text size="lg" c="dimmed">Yetkilendirme kontrol ediliyor...</Text>
      </Center>
    );
  }

  // Admin check henüz tamamlanmadıysa
  if (!adminCheckComplete) {
    console.log('🔄 AdminLayout - Admin Check Loading...');
    return (
      <Center h="100vh">
        <Box ta="center">
          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
          <Text size="lg" c="dimmed" mt="md">Admin yetkileri kontrol ediliyor...</Text>
        </Box>
      </Center>
    );
  }

  // Admin check başarısız
  if (adminCheckFailed || !isAdminConfirmed) {
    console.log('❌ AdminLayout - Admin yetki yok, redirect...');
    return (
      <Center h="100vh">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Erişim Reddedildi"
          color="red"
          variant="light"
          maw={400}
        >
          <Text size="sm">
            Bu sayfaya erişmek için admin yetkileriniz bulunmuyor.
            {!user && ' Lütfen önce giriş yapın.'}
            {user && profile && profile.role !== 'admin' && ` Mevcut rolünüz: ${profile.role}`}
          </Text>
          <Navigate to="/" replace />
        </Alert>
      </Center>
    );
  }

  // Admin onaylandı, layout'u render et
  console.log('🎯 AdminLayout - ADMIN LAYOUT RENDER EDİLİYOR');
  
  return (
    <AppShell
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: false } }}
      padding="md"
    >
      <AppShell.Navbar>
        <AdminSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminLayout; 