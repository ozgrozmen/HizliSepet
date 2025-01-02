import { Card, Image, Text, Group, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';

export function ProductCard({ product }) {
  const fallbackImage = 'https://placehold.co/400x400?text=Ürün+Görseli';

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder 
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '400px',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <Card.Section>
          <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
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

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500} lineClamp={2} style={{ height: '48px' }}>
            {product?.name || 'Ürün Adı'}
          </Text>
        </Group>

        <Text size="sm" c="dimmed" mb="sm">
          {product?.brand || 'Marka'}
        </Text>
      </div>

      <Group justify="space-between" align="center">
        <Text size="xl" fw={700}>
          {(product?.price || 0).toFixed(2)} TL
        </Text>
        <Button 
          variant="light" 
          color="blue" 
          leftSection={<IconShoppingCart size={20} />}
        >
          Sepete Ekle
        </Button>
      </Group>
    </Card>
  );
} 