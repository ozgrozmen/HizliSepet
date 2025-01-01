import { Card, Image, Text, Group, Button, Badge, Rating } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';

export function ProductCard({ product }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={product.image_url}
          height={200}
          alt={product.name}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} lineClamp={2} style={{ height: '50px' }}>
          {product.name}
        </Text>
        {product.discount_rate > 0 && (
          <Badge color="red" variant="light">
            %{product.discount_rate} İndirim
          </Badge>
        )}
      </Group>

      <Text size="sm" c="dimmed" mb="sm">
        {product.brand}
      </Text>

      <Rating value={product.rating} readOnly fractions={2} mb="sm" />

      <Group justify="space-between" align="center">
        <div>
          {product.discount_rate > 0 ? (
            <>
              <Text size="xl" fw={700} style={{ color: '#FF4D4D' }}>
                {product.discount_price.toFixed(2)} TL
              </Text>
              <Text size="sm" td="line-through" c="dimmed">
                {product.price.toFixed(2)} TL
              </Text>
            </>
          ) : (
            <Text size="xl" fw={700}>
              {product.price.toFixed(2)} TL
            </Text>
          )}
        </div>
        <Button 
          variant="light" 
          color="blue" 
          style={{ flex: 1 }}
          leftSection={<IconShoppingCart size={20} />}
        >
          Sepete Ekle
        </Button>
      </Group>
    </Card>
  );
} 