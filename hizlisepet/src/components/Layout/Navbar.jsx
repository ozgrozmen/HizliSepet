import { Group, TextInput, Container, ActionIcon, Menu } from '@mantine/core';
import { IconShoppingCart, IconUser, IconSearch, IconHeart } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <header style={{ 
      width: '100%', 
      backgroundColor: 'white',
      borderBottom: '1px solid #e9ecef',
      height: '70px'
    }}>
      <Container size="xl" h="100%">
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

            <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/cart')}>
              <IconShoppingCart size={20} />
            </ActionIcon>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <IconUser size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={() => navigate('/profile')}>
                  Profilim
                </Menu.Item>
                <Menu.Item onClick={() => navigate('/orders')}>
                  Siparişlerim
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red">
                  Çıkış Yap
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </header>
  );
} 