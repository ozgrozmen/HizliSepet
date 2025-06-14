import { Box, Button, Stack, Alert, Loader, Text } from '@mantine/core';
import { useNavigate, Outlet } from 'react-router-dom';
import { IconHome, IconPackage, IconCategory, IconUsers, IconArrowLeft, IconShoppingCart, IconLock } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin } = useAuth();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      console.log('Admin kontrol - User:', !!user, 'Profile:', !!profile, 'IsAdmin:', isAdmin());
      
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      // Profil yoksa kısa süre bekle
      if (!profile) {
        const timeout = setTimeout(() => {
          if (!isAdmin()) {
            navigate('/', { replace: true });
          }
          setCheckComplete(true);
        }, 2000);
        return () => clearTimeout(timeout);
      }

      // Profil var, admin kontrolü
      if (!isAdmin()) {
        navigate('/', { replace: true });
        return;
      }

      setCheckComplete(true);
    }
  }, [user, profile, loading, isAdmin, navigate]);

  // Yükleniyor veya kontrol devam ediyor
  if (loading || (!checkComplete && user && !profile)) {
    return (
      <Box style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Admin yetkileriniz kontrol ediliyor...</Text>
        </Stack>
      </Box>
    );
  }

  // Giriş yapmamış
  if (!user) {
    return (
      <Box style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Alert 
          icon={<IconLock size={20} />} 
          title="Erişim Reddedildi" 
          color="red"
          style={{ maxWidth: '400px' }}
        >
          <Text mb="md">Admin paneline erişim için giriş yapmanız gerekiyor.</Text>
          <Button onClick={() => navigate('/login')} fullWidth>
            Giriş Yap
          </Button>
        </Alert>
      </Box>
    );
  }

  // Admin değil
  if (!isAdmin()) {
    return (
      <Box style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Alert 
          icon={<IconLock size={20} />} 
          title="Yetkisiz Erişim" 
          color="red"
          style={{ maxWidth: '400px' }}
        >
          <Text mb="md">
            Bu sayfaya erişim yetkiniz bulunmamaktadır. 
            Sadece yöneticiler admin panelini kullanabilir.
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            Mevcut rol: {profile?.role || 'Bilinmiyor'}
          </Text>
          <Button onClick={() => navigate('/')} fullWidth>
            Ana Sayfaya Dön
          </Button>
        </Alert>
      </Box>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: IconHome },
    { label: 'Ürünler', path: '/admin/products', icon: IconPackage },
    { label: 'Kategoriler', path: '/admin/categories', icon: IconCategory },
    { label: 'Kullanıcılar', path: '/admin/users', icon: IconUsers },
    { label: 'Siparişler', path: '/admin/orders', icon: IconShoppingCart },
  ];

  return (
    <Box style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Box style={{ 
        width: '300px', 
        minHeight: '100vh',
        borderRight: '1px solid #eee',
        padding: '20px',
        backgroundColor: 'white'
      }}>
        <Stack>
          {/* Admin kullanıcı bilgisi */}
          <Box 
            style={{ 
              padding: '12px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}
          >
            <Text size="sm" fw={500}>Admin Panel</Text>
            <Text size="xs" c="dimmed">{user.email}</Text>
            <Text size="xs" c="green">Yönetici ({profile?.role})</Text>
          </Box>

          <Button
            leftSection={<IconArrowLeft size={20} />}
            variant="light"
            onClick={() => navigate('/')}
            mb="xl"
          >
            Ana Sayfaya Dön
          </Button>

          {menuItems.map((item) => (
            <Button
              key={item.path}
              leftSection={<item.icon size={20} />}
              variant="subtle"
              onClick={() => navigate(item.path)}
              fullWidth
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </Box>
    </Box>
  );
} 