import { Card, Image, Text, Button, Group, ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconShoppingCart } from '@tabler/icons-react';
import { useFavorite } from '../../context/FavoriteContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export function ProductCard({ product }) {
  const { toggleFavorite, isFavorite } = useFavorite();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const fallbackImage = 'https://placehold.co/400x400?text=Ürün+Görseli';
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    await toggleFavorite(product.id);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setLoading(true);
      const success = await addToCart(product, 1);
      
      if (success) {
        notifications.show({
          title: 'Başarılı',
          message: `${product.name} sepete eklendi`,
          color: 'green',
          autoClose: 3000,
          withCloseButton: true,
          icon: <IconShoppingCart size={20} />
        });
        
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } else {
        setLoading(false);
        notifications.show({
          title: 'Hata',
          message: 'Ürün sepete eklenirken bir hata oluştu',
          color: 'red',
          autoClose: 3000,
          withCloseButton: true
        });
      }
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      setLoading(false);
      notifications.show({
        title: 'Hata',
        message: 'Ürün sepete eklenirken bir hata oluştu',
        color: 'red',
        autoClose: 3000,
        withCloseButton: true
      });
    }
  };

  return (
    <Card 
      shadow="sm" 
      padding="md" 
      radius="md" 
      withBorder
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        minHeight: '320px',
        maxHeight: '350px'
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <Card.Section style={{ flex: 1 }}>
        <div style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '180px',
          maxHeight: '200px',
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

      <Text fw={500} size="md" mt="xs" lineClamp={2}>
        {product?.name || 'Ürün Adı'}
      </Text>

      <Text size="sm" c="dimmed">
        {product?.brand || 'Marka'}
      </Text>

      <Group justify="space-between" mt="xs" pt="xs">
        <Text size="lg" fw={700} style={{ color: '#228be6' }}>
          {(product?.price || 0).toFixed(2)} TL
        </Text>
        <Group gap="xs">
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
            style={{ flex: '0 0 auto' }}
            onClick={handleAddToCart}
            leftSection={<IconShoppingCart size={16} />}
            loading={loading}
            disabled={loading}
          >
            Sepete Ekle
          </Button>
        </Group>
      </Group>
    </Card>
  );
} 