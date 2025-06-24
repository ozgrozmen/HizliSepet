import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Group, TextInput, Container, ActionIcon, Menu, Button, Loader, Badge, Drawer, Paper, Stack, Text, Image } from '@mantine/core';
import { IconUser, IconSearch, IconHeart, IconDashboard, IconLogin, IconShoppingCart, IconMenu2, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Categories } from './Categories';
import { searchProducts } from '../../lib/supabase';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';

export const Navbar = React.memo(() => {
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const { getCartItemCount } = useCart();
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Debounce search term to prevent too many API calls
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);
  
  const searchResultsRef = useClickOutside(() => {
    setShowResults(false);
  });

  // Cart count'u memoize et
  const cartItemCount = useMemo(() => getCartItemCount(), [getCartItemCount]);

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.length > 0) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const results = await searchProducts(debouncedSearchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Arama hatası:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleProductClick = useCallback((productId) => {
    setShowResults(false);
    setSearchTerm('');
    navigate(`/product/${productId}`);
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

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
              onClick={handleSidebarOpen}
              onMouseEnter={handleSidebarOpen}
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
            
            <h1 
              style={{ 
                fontSize: '24px', 
                fontWeight: 900, 
                cursor: 'pointer',
                margin: 0
              }} 
              onClick={handleLogoClick}
            >
              HızlıSepet
            </h1>
          </Group>

          {/* Arama */}
          <div style={{ width: '40%', maxWidth: '400px', position: 'relative' }} ref={searchResultsRef}>
            <TextInput
              placeholder="Ürün ara..."
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchTerm ? (
                  isSearching ? (
                    <Loader size="xs" />
                  ) : (
                    <ActionIcon size="sm" onClick={clearSearch} variant="subtle">
                      <IconX size={14} />
                    </ActionIcon>
                  )
                ) : null
              }
              value={searchTerm}
              onChange={(event) => handleSearch(event.currentTarget.value)}
              style={{ width: '100%' }}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: '#228be6'
                  }
                }
              }}
            />
            
            {showResults && (searchResults.length > 0 || isSearching || searchTerm) && (
              <Paper
                shadow="md"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  border: '1px solid #e9ecef'
                }}
              >
                <Stack spacing={0}>
                  {isSearching ? (
                    <Text size="sm" c="dimmed" ta="center" py="sm">Aranıyor...</Text>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Button
                        key={product.id}
                        variant="subtle"
                        fullWidth
                        onClick={() => handleProductClick(product.id)}
                        styles={{
                          root: {
                            height: 'auto',
                            padding: '8px',
                            '&:hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          },
                          inner: {
                            justifyContent: 'flex-start'
                          }
                        }}
                      >
                        <Group wrap="nowrap" style={{ width: '100%' }}>
                          <Image
                            src={product.image_url}
                            width={40}
                            height={40}
                            radius="sm"
                            alt={product.name}
                            style={{ flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" fw={500} lineClamp={1}>
                              {product.name}
                            </Text>
                            <Group position="apart" spacing="xs">
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {product.brand} • {product.category}
                              </Text>
                              <Text size="sm" fw={500} c="blue">
                                {product.discount_price ? (
                                  <>
                                    <span style={{ textDecoration: 'line-through', marginRight: '4px', color: '#666', fontSize: '12px' }}>
                                      {product.price}₺
                                    </span>
                                    {product.discount_price}₺
                                  </>
                                ) : (
                                  `${product.price}₺`
                                )}
                              </Text>
                            </Group>
                          </div>
                        </Group>
                      </Button>
                    ))
                  ) : searchTerm ? (
                    <Text size="sm" c="dimmed" ta="center" py="sm">"{searchTerm}" için sonuç bulunamadı</Text>
                  ) : null}
                </Stack>
              </Paper>
            )}
          </div>

          {/* ... existing code ... */}
        </Group>
      </Container>

      {/* ... existing code ... */}
    </header>
  );
}); 