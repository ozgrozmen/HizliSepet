import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Group, 
  TextInput, 
  Container, 
  ActionIcon, 
  Menu, 
  Button, 
  Loader, 
  Badge, 
  Drawer, 
  Paper, 
  Stack, 
  Text, 
  Image,
  Box,
  Transition,
  Flex
} from '@mantine/core';
import { 
  IconUser, 
  IconSearch, 
  IconHeart, 
  IconDashboard, 
  IconLogin, 
  IconShoppingCart, 
  IconMenu2, 
  IconX,
  IconTag,
  IconCategory2
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Categories } from './Categories';
import { searchProducts } from '../../lib/supabase';
import { useClickOutside, useDebouncedValue } from '@mantine/hooks';

// Fiyat formatı fonksiyonu
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Navbar bileşenini memo ile optimize et
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

  // Event handler'ları useCallback ile optimize et
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  }, [signOut, navigate]);

  const handleFavoritesClick = useCallback(() => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/favorites' } });
    } else {
      navigate('/favorites');
    }
  }, [user, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleSidebarOpen = useCallback(() => {
    setSidebarOpened(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpened(false);
  }, []);

  // Admin kontrolü - memoize et
  const showAdminPanel = useMemo(() => {
    return user && profile && isAdmin();
  }, [user, profile, isAdmin]);

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
            {/* Logo */}
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
          <Box style={{ width: '40%', maxWidth: '500px', position: 'relative' }} ref={searchResultsRef}>
          <TextInput
              placeholder="Ürün, marka veya kategori ara..."
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
              onFocus={() => {
                if (searchTerm && searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              radius="xl"
              size="md"
              styles={(theme) => ({
                input: {
                  '&:focus': {
                    borderColor: theme.colors.blue[6]
                  }
                }
              })}
            />
            
            <Transition mounted={showResults && (searchResults.length > 0 || isSearching || searchTerm)} transition="pop-top-left" duration={200}>
              {(styles) => (
                <Paper
                  shadow="md"
                  style={{
                    ...styles,
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    border: '1px solid #e9ecef'
                  }}
                  radius="md"
                  p="xs"
                >
                  <Stack spacing={8}>
                    {isSearching ? (
                      <Flex align="center" justify="center" p="md">
                        <Loader size="sm" />
                        <Text size="sm" c="dimmed" ml="sm">Aranıyor...</Text>
                      </Flex>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <Paper
                          key={product.id}
                          withBorder
                          p="xs"
                          radius="md"
                          onClick={() => handleProductClick(product.id)}
                          style={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          }}
                        >
                          <Group wrap="nowrap" style={{ width: '100%' }}>
                            <Image
                              src={product.image_url}
                              width={60}
                              height={60}
                              radius="md"
                              alt={product.name}
                              style={{ flexShrink: 0 }}
                            />
                            <Box style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" fw={500} lineClamp={1} mb={4}>
                                {product.name}
                              </Text>
                              <Group spacing={8} mb={4}>
                                {product.brand && (
                                  <Badge size="sm" variant="dot" color="gray">
                                    {product.brand}
                                  </Badge>
                                )}
                                <Badge size="sm" variant="light" color="blue">
                                  {product.category}
                                </Badge>
                              </Group>
                              <Group position="apart">
                                <Text size="sm" fw={700} c="blue.7">
                                  {formatPrice(product.price)}
                                </Text>
                                {product.discount_price && (
                                  <Text size="xs" td="line-through" c="dimmed">
                                    {formatPrice(product.price)}
                                  </Text>
                                )}
                              </Group>
                            </Box>
                          </Group>
                        </Paper>
                      ))
                    ) : searchTerm ? (
                      <Text size="sm" c="dimmed" ta="center" py="sm">
                        "{searchTerm}" için sonuç bulunamadı
                      </Text>
                    ) : null}
                  </Stack>
                </Paper>
              )}
            </Transition>
          </Box>

          {/* Sağ Menü */}
          <Group>
            {/* Favoriler */}
            <ActionIcon 
              variant="subtle" 
              size="lg" 
              onClick={handleFavoritesClick}
              color="gray"
            >
              <IconHeart size={22} stroke={1.5} />
            </ActionIcon>

            {/* Sepet */}
            <div style={{ position: 'relative' }}>
              <ActionIcon 
                variant="subtle" 
                size="lg" 
                onClick={handleCartClick}
                color="gray"
              >
                <IconShoppingCart size={22} stroke={1.5} />
              </ActionIcon>
              {cartItemCount > 0 && (
                <Badge 
                  size="xs" 
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

            {/* Kullanıcı Menüsü */}
            {!loading && (
              user ? (
  <Menu shadow="md" width={200}>
    <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      size="lg"
                      color="gray"
                    >
                      <IconUser size={22} stroke={1.5} />
      </ActionIcon>
    </Menu.Target>

    <Menu.Dropdown>
                    <Menu.Label>Hesap</Menu.Label>
      <Menu.Item onClick={() => navigate('/profile')}>
        Profilim
      </Menu.Item>
      <Menu.Item onClick={() => navigate('/orders')}>
        Siparişlerim
      </Menu.Item>
      {showAdminPanel && (
        <>
          <Menu.Divider />
                        <Menu.Label>Yönetim</Menu.Label>
          <Menu.Item 
                          leftSection={<IconDashboard size={14} />}
            onClick={() => navigate('/admin')} 
          >
            Admin Paneli
          </Menu.Item>
        </>
      )}
      <Menu.Divider />
                    <Menu.Item color="red" onClick={handleSignOut}>
        Çıkış Yap
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
              ) : (
    <Button 
                  variant="light"
      leftSection={<IconLogin size={16} />}
      onClick={() => navigate('/login')}
                  radius="xl"
    >
      Giriş Yap
    </Button>
              )
            )}
          </Group>
  </Group>
      </Container>

      {/* Kategoriler Drawer */}
      <Drawer
        opened={sidebarOpened}
        onClose={handleSidebarClose}
        size="sm"
        padding="md"
        title={<Text fw={700}>Kategoriler</Text>}
      >
        <Categories onClose={handleSidebarClose} />
      </Drawer>
    </header>
  );
});

// Display name'leri ekle
Navbar.displayName = 'Navbar';