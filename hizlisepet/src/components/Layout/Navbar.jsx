import { Group, TextInput, Container, ActionIcon, Menu, Button } from '@mantine/core';
import { IconUser, IconSearch, IconHeart, IconDashboard } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

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
        <Group h="100%" justify="space-between" px="md">
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

          {/* Arama */}
          <TextInput
            placeholder="Ürün ara..."
            leftSection={<IconSearch size={16} />}
            style={{ width: '40%', maxWidth: '400px' }}
          />

          {/* Sağ Menü */}
          <Group>
            <ActionIcon variant="subtle" size="lg">
              <IconHeart size={20} />
            </ActionIcon>

            {user ? (
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
                <Button variant="subtle" onClick={() => navigate('/login')}>
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
    </header>
  );
} 