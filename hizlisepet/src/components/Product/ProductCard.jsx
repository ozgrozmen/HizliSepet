import React from 'react';
import { Card, Image, Text, Button, Group, ActionIcon, Badge } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconShoppingCart } from '@tabler/icons-react';
import { useFavorite } from '../../context/FavoriteContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

// Fallback image
const fallbackImage = 'https://placehold.co/400x400?text=Ürün+Görseli';

// ProductCard bileşenini memo ile optimize et
const ProductCard = React.memo(({ product }) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Favoriler kontrolü
  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    await toggleFavorite(product.id);
  };

  // Sepete ekleme handler'ı
  const handleAddToCart = async () => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      notifications.show({
        title: 'Giriş Yapmalısınız',
        message: 'Sepete ürün eklemek için lütfen giriş yapın',
        color: 'orange'
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    const success = await addToCart(product);
    
    if (success) {
      notifications.show({
        title: 'Başarılı',
        message: `${product.name} sepete eklendi`,
        color: 'green'
      });
    } else {
      notifications.show({
        title: 'Hata',
        message: 'Ürün sepete eklenirken bir hata oluştu',
        color: 'red'
      });
    }
    setLoading(false);
  };

  // Ürün detay sayfasına gitme handler'ı
  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      shadow="sm" 
      padding="md" 
      radius="md" 
      withBorder
      style={{ 
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        minHeight: '400px',
        maxHeight: '450px'
      }}
      onClick={handleProductClick}
    >
      <Card.Section style={{ flex: 0 }}>
        <div style={{ 
          width: '100%', 
          height: '200px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa'
        }}>
          <img
            src={product?.image_url || fallbackImage}
            alt={product?.name || 'Ürün'}
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </Card.Section>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 8px', justifyContent: 'space-between' }}>
        <div>
          <Text fw={500} size="md" mt="xs" lineClamp={2} style={{ minHeight: '3em' }}>
            {product?.name || 'Ürün Adı'}
          </Text>

          <Badge color="blue" variant="light" style={{ marginBottom: '8px', display: 'inline-block' }}>
            {product?.category || 'Kategori'}
          </Badge>

          <Text size="sm" c="dimmed" mb="md">
            {product?.brand || 'Marka'}
          </Text>
        </div>

        <Group justify="space-between" mt="auto" style={{ borderTop: '1px solid #eee', paddingTop: '10px', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
          <Text size="lg" fw={700} style={{ color: '#228be6' }}>
            {(product?.price || 0).toFixed(2)} TL
          </Text>
          <Group gap="xs" justify="center">
            <ActionIcon 
              variant="light"
              color="red"
              size="md"
              onClick={handleFavoriteClick}
            >
              {isFavorite(product.id) ? (
                <IconHeartFilled size={18} />
              ) : (
                <IconHeart size={18} />
              )}
            </ActionIcon>
            <Button 
              variant="light" 
              color="blue"
              size="sm"
              style={{ flex: '1 1 auto' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              leftSection={<IconShoppingCart size={16} />}
              loading={loading}
              disabled={loading}
            >
              Sepete Ekle
            </Button>
          </Group>
        </Group>
      </div>
    </Card>
  );
});

// Display name ekle
ProductCard.displayName = 'ProductCard';

export { ProductCard }; 