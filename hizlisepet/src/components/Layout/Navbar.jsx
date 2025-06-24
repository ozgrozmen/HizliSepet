import React, { useState, useCallback, useMemo } from 'react';
import { Group, TextInput, Container, ActionIcon, Menu, Button, Loader, Badge, Drawer, Paper } from '@mantine/core';
import { IconUser, IconSearch, IconHeart, IconDashboard, IconLogin, IconShoppingCart, IconMenu2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Categories } from './Categories';
import { searchProducts } from '../../lib/supabase';

// İlk harfi büyük yapma fonksiyonu
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Navbar bileşenini memo ile optimize et
export const Navbar = React.memo(() => {
  const navigate = useNavigate();
  const { user, profile, loading, isAdmin, signOut } = useAuth();
  const { getCartItemCount } = useCart();
  const [sidebarOpened, setSidebarOpened] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Cart count'u memoize et
  const cartItemCount = useMemo(() => getCartItemCount(), [getCartItemCount]);

  // Arama önerilerini getir
  const fetchSuggestions = useCallback(async (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await searchProducts(term);
      setSuggestions(results);
    } catch (error) {
      console.error('Öneri getirme hatası:', error);
      setSuggestions([]);
    }
  }, []);

  // Arama terimini güncelle
  const handleSearchChange = useCallback((e) => {
    const value = capitalizeFirstLetter(e.target.value);
    setSearchTerm(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  // Arama işlemi
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  }, [searchTerm, navigate]);

  // Öneri seçme
  const handleSuggestionClick = useCallback((productId) => {
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  }, [navigate]);

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
          <div style={{ width: '40%', maxWidth: '400px', position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <TextInput
                placeholder="Ürün ara..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={() => {
                  // Tıklama eventi öneri seçiminden önce tetiklenmesin diye timeout kullan
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                onFocus={() => setShowSuggestions(true)}
                style={{ width: '100%' }}
              />
            </form>

            {/* Öneriler */}
            {showSuggestions && suggestions.length > 0 && (
              <Paper
                shadow="md"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '4px'
                }}
              >
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    style={{
                      padding: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      '&:hover': {
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40x40';
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {product.price} TL
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Paper>
            )}
          </div>

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
                onClick={handleCartClick}
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
              <UserMenu 
                user={user}
                profile={profile}
                showAdminPanel={showAdminPanel}
                onSignOut={handleSignOut}
                navigate={navigate}
              />
            ) : (
              <AuthButtons navigate={navigate} />
            )}
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={sidebarOpened}
        onClose={handleSidebarClose}
        title="Kategoriler"
        size="xs"
        padding="xs"
        overlayProps={{ opacity: 0.5, blur: 1 }}
        position="left"
        onMouseLeave={handleSidebarClose}
        styles={{
          title: { 
            fontWeight: 600, 
            fontSize: '18px' 
          }
        }}
      >
        <Categories />
      </Drawer>
    </header>
  );
});

// User menu bileşenini memo ile ayır
const UserMenu = React.memo(({ user, profile, showAdminPanel, onSignOut, navigate }) => (
  <Menu shadow="md" width={200}>
    <Menu.Target>
      <ActionIcon variant="subtle" size="lg">
        <IconUser size={20} />
      </ActionIcon>
    </Menu.Target>

    <Menu.Dropdown>
      <Menu.Label>Merhaba, {user.email}</Menu.Label>
      {profile && (
        <Menu.Label size="xs" c="dimmed">Rol: {profile.role}</Menu.Label>
      )}
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
      {showAdminPanel && (
        <>
          <Menu.Divider />
          <Menu.Item 
            onClick={() => navigate('/admin')} 
            leftSection={<IconDashboard size={14} />}
            color="blue"
          >
            Admin Paneli
          </Menu.Item>
        </>
      )}
      <Menu.Divider />
      <Menu.Item color="red" onClick={onSignOut}>
        Çıkış Yap
      </Menu.Item>
    </Menu.Dropdown>
  </Menu>
));

// Auth buttons bileşenini memo ile ayır
const AuthButtons = React.memo(({ navigate }) => (
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
));

// Display name'leri ekle
Navbar.displayName = 'Navbar';
UserMenu.displayName = 'UserMenu';
AuthButtons.displayName = 'AuthButtons'; 