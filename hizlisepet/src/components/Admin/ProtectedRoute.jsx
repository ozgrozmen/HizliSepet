import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Box, Loader, Text, Stack } from '@mantine/core';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  console.log('ProtectedRoute kontrol:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    profileRole: profile?.role,
    isAdminFn: isAdmin(),
    requireAdmin,
    loading 
  });

  // Yükleniyor durumu
  if (loading) {
    return (
      <Box style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Yetki kontrolü yapılıyor...</Text>
        </Stack>
      </Box>
    );
  }

  // Giriş kontrolü
  if (!user) {
    console.log('ProtectedRoute: Kullanıcı giriş yapmamış, login\'e yönlendiriliyor');
    return <Navigate to="/login" replace />;
  }

  // Admin kontrolü (eğer gerekiyorsa)
  if (requireAdmin) {
    // Profil yüklenme bekleme - kısa süre
    if (!profile) {
      console.log('ProtectedRoute: Profil henüz yüklenmedi, bekleniyor...');
      return (
        <Box style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <Stack align="center">
            <Loader size="lg" />
            <Text>Profil yükleniyor...</Text>
          </Stack>
        </Box>
      );
    }

    // Admin kontrolü
    const adminCheck = isAdmin();
    console.log('ProtectedRoute admin kontrolü:', { 
      profileRole: profile.role, 
      adminCheck, 
      userEmail: user.email 
    });

    if (!adminCheck) {
      console.log('ProtectedRoute: Admin yetkisi yok, ana sayfaya yönlendiriliyor');
      return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute: Admin yetkisi onaylandı');
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
}; 