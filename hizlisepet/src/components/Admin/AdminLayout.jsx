import { Box, Button, Stack } from '@mantine/core';
import { useNavigate, Outlet } from 'react-router-dom';
import { IconHome, IconPackage, IconCategory, IconUsers, IconArrowLeft } from '@tabler/icons-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: IconHome },
    { label: 'Ürünler', path: '/admin/products', icon: IconPackage },
    { label: 'Kategoriler', path: '/admin/categories', icon: IconCategory },
    { label: 'Kullanıcılar', path: '/admin/users', icon: IconUsers },
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