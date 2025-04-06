import { Group, TextInput, Container, ActionIcon, Menu, Button, Loader, Badge, Drawer } from '@mantine/core';
import { IconUser, IconSearch, IconHeart, IconDashboard, IconLogin, IconShoppingCart, IconMenu2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { Categories } from './Categories';

export function Navbar() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { getCartItemCount } = useCart();
  const [sidebarOpened, setSidebarOpened] = useState(false);
  
  const cartItemCount = getCartItemCount();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const handleFavoritesClick = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/favorites' } });
    } else {
      navigate('/favorites');
    }
  };

  console.log('Navbar render - Oturum durumu:', loading ? 'Yükleniyor...' : user ? 'Giriş yapılmış' : 'Giriş yapılmamış');

  return (
    <header style={{ 
      width: '100%', 
      backgroundColor: 'white',
      borderBottom: '1px solid #e9ecef',
      height: '70px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <Container fluid style={{ maxWidth: '100%', height: '100%', padding: 0 }}>
        <Group style={{ height: '100%', padding: '0 20px' }} justify="space-between">
          <Group gap="md">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() => setSidebarOpened(true)}
              onMouseEnter={() => setSidebarOpened(true)}
              sx={(theme) => ({
                backgroundColor: theme.colors.gray[0],
                border: `1px solid ${theme.colors.gray[3]}`,
                '&:hover': {
                  backgroundColor: theme.colors.gray[1],
                }
              })}
            >
              <IconMenu2 size={22} />
            </ActionIcon>
            
            {/* Logo */}
            <h1 
              style={{ 
                fontSize: '24px', 
                fontWeight: 900, 
                cursor: 'pointer',
                margin: 0
              }} 
              onClick={() => navigate('/')}
            >
              HızlıSepet
            </h1>
          </Group>

          {/* Arama */}
          <TextInput
            placeholder="Ürün ara..."
            leftSection={<IconSearch size={16} />}
            style={{ width: '40%', maxWidth: '400px' }}
          />

          {/* Sağ Menü */}
          <Group gap="md">
            <ActionIcon 
              variant="subtle" 
              size="lg" 
              onClick={handleFavoritesClick}
            >
              <IconHeart size={20} />
            </ActionIcon>

            <div style={{ position: 'relative' }}>
              <ActionIcon 
                variant="subtle" 
                size="lg" 
                onClick={() => navigate('/cart')}
              >
                <IconShoppingCart size={20} />
              </ActionIcon>
              {cartItemCount > 0 && (
                <Badge 
                  size="xs" 
                  color="red" 
                  variant="filled"
                  style={{ 
                    position: 'absolute', 
                    top: -5, 
                    right: -5,
                    pointerEvents: 'none'
                  }}
                >
                  {cartItemCount}
                </Badge>
              )}
            </div>

            {loading ? (
              <Loader size="sm" />
            ) : user ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="subtle" size="lg">
                    <IconUser size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Merhaba, {user.email}</Menu.Label>
                  <Menu.Divider />
                  <Menu.Item onClick={() => navigate('/profile')}>
                    Profilim
                  </Menu.Item>
                  <Menu.Item onClick={() => navigate('/orders')}>
                    Siparişlerim
                  </Menu.Item>
                  <Menu.Item onClick={() => navigate('/favorites')}>
                    Favorilerim
                  </Menu.Item>
                  <Menu.Item onClick={() => navigate('/cart')}>
                    Sepetim
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item onClick={() => navigate('/admin')} leftSection={<IconDashboard size={14} />}>
                    Admin Paneli
                  </Menu.Item>
                  <Menu.Item color="red" onClick={handleSignOut}>
                    Çıkış Yap
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group>
                <Button 
                  variant="subtle" 
                  leftSection={<IconLogin size={16} />}
                  onClick={() => navigate('/login')}
                >
                  Giriş Yap
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Kayıt Ol
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={sidebarOpened}
        onClose={() => setSidebarOpened(false)}
        title="Kategoriler"
        size="xs"
        padding="xs"
        overlayProps={{ opacity: 0.5, blur: 1 }}
        position="left"
        onMouseLeave={() => setSidebarOpened(false)}
        styles={{
          title: { 
            fontSize: '1.2rem', 
            fontWeight: 700,
            paddingLeft: 10, 
            marginBottom: 10
          },
          body: { padding: 10 },
          header: { 
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            marginBottom: 5
          }
        }}
      >
        <div style={{ padding: '0 5px' }}>
          <Categories />
        </div>
      </Drawer>
    </header>
  );
} 