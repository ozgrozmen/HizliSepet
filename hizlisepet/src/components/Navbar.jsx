import React from 'react';
import { Container, Navbar, Group, Text, ActionIcon, TextInput } from '@mantine/core';
import { IconSearch, IconShoppingCart, IconUser, IconHeart } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const NavbarComponent = () => {
  return (
    <div style={{ 
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Container size="xl" style={{ 
        maxWidth: '1200px',
        width: '100%',
        padding: '0 16px'
      }}>
        <Navbar height={60} p="md" style={{ 
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 16px'
        }}>
          <Group style={{ flex: 1 }}>
            <Text size="xl" fw={700} component={Link} to="/" style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              marginRight: '20px'
            }}>
              HızlıSepet
            </Text>
            <TextInput
              placeholder="Ürün ara..."
              leftSection={<IconSearch size={20} style={{ color: '#999' }} />}
              style={{ width: '500px' }}
              styles={{
                input: {
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  '&:focus': {
                    border: 'none'
                  }
                }
              }}
            />
          </Group>

          <Group>
            <ActionIcon 
              variant="transparent" 
              component={Link} 
              to="/favorites"
              size="lg"
              color="gray"
            >
              <IconHeart size={22} />
            </ActionIcon>
            <ActionIcon 
              variant="transparent" 
              component={Link} 
              to="/cart"
              size="lg"
              color="gray"
            >
              <IconShoppingCart size={22} />
            </ActionIcon>
            <ActionIcon 
              variant="transparent" 
              component={Link} 
              to="/profile"
              size="lg"
              color="gray"
            >
              <IconUser size={22} />
            </ActionIcon>
          </Group>
        </Navbar>
      </Container>
    </div>
  );
};

export default NavbarComponent; 