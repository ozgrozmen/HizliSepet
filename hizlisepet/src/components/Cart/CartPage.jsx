import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Image,
  Button,
  NumberInput,
  Divider,
  ActionIcon,
  Box,
  Stack,
  Badge,
  Grid,
  LoadingOverlay,
  Alert,
  Modal,
  Notification,
  Card,
  Center
} from '@mantine/core';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { 
  IconShoppingCart, 
  IconTrash, 
  IconAlertCircle, 
  IconShoppingCartOff, 
  IconCheck, 
  IconX,
  IconMinus,
  IconPlus
} from '@tabler/icons-react';

// Fiyat formatı fonksiyonu
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export function CartPage() {
  const { 
    cartItems, 
    loading: cartLoading, 
    error: cartError,
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart,
    refetch: refetchCart
  } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    const success = await updateQuantity(itemId, newQuantity);
    setUpdating(false);
    
    if (!success) {
      notifications.show({
        title: 'Hata',
        message: 'Ürün miktarı güncellenirken bir hata oluştu',
        color: 'red'
      });
    }
  };

  const openRemoveModal = (item) => {
    setItemToRemove(item);
    setRemoveModalOpen(true);
  };

  const openClearModal = () => {
    setClearModalOpen(true);
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;
    
    setRemoveModalOpen(false);
    setUpdating(true);
    const success = await removeFromCart(itemToRemove.id);
    setUpdating(false);
    
    if (success) {
      notifications.show({
        title: 'Başarılı',
        message: 'Ürün sepetten çıkarıldı',
        color: 'green'
      });
    } else {
      notifications.show({
        title: 'Hata',
        message: 'Ürün sepetten çıkarılırken bir hata oluştu',
        color: 'red'
      });
    }
  };

  const handleClearCart = async () => {
    setClearModalOpen(false);
    setUpdating(true);
    const success = await clearCart();
    setUpdating(false);
    
    if (success) {
      notifications.show({
        title: 'Başarılı',
        message: 'Sepetiniz temizlendi',
        color: 'green'
      });
    } else {
      notifications.show({
        title: 'Hata',
        message: 'Sepet temizlenirken bir hata oluştu',
        color: 'red'
      });
    }
  };

  if (cartLoading) {
    return (
      <Container size="xl" py="xl" style={{ position: 'relative', minHeight: '60vh' }}>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </Container>
    );
  }

  if (cartError) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Bir hata oluştu" 
          color="red"
        >
          {cartError}
        </Alert>
        <Button 
          onClick={refetchCart}
          mt="md"
        >
          Tekrar Dene
        </Button>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Card withBorder p="xl" radius="md" shadow="sm">
          <Center p="xl">
            <Box>
              <Center>
                <IconShoppingCartOff size={80} stroke={1.5} color="gray" />
              </Center>
              <Text ta="center" fz="xl" fw={500} mt="md">
                Sepetiniz Boş
              </Text>
              <Text ta="center" c="dimmed" mt="sm">
                Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünlerimize göz atabilirsiniz.
              </Text>
              <Center mt="lg">
                <Button component={Link} to="/" leftSection={<IconShoppingCart size={16} />}>
                  Alışverişe Başla
                </Button>
              </Center>
            </Box>
          </Center>
        </Card>
      </Container>
    );
  }

  const cartTotal = getCartTotal();
  const discountedTotal = cartTotal * 0.9; // %10 indirim

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={updating} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Group justify="space-between" mb="lg">
        <Title order={1}>Sepetim</Title>
          <Button 
            variant="subtle" 
            color="red" 
            onClick={openClearModal}
            leftSection={<IconTrash size={16} />}
          >
            Sepeti Temizle
          </Button>
      </Group>

      <Grid>
        {/* Sepet Ürünleri */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack spacing="md">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              return (
                <Paper key={item.id} p="md" withBorder>
                  <Group position="apart" align="flex-start">
                    <Group align="flex-start" spacing="lg" style={{ flex: 1 }}>
                    <Image
                        src={product.image_url}
                        width={120}
                        height={120}
                        radius="md"
                        alt={product.name}
                    />
                    <Box style={{ flex: 1 }}>
                        <Text size="lg" fw={500} mb="xs" lineClamp={2}>
                        {product.name}
                      </Text>
                        <Group spacing="xs" mb="sm">
                          <Badge color="blue" variant="light">
                            {product.category}
                          </Badge>
                          <Badge color="gray" variant="outline">
                            {product.brand}
                          </Badge>
                      </Group>
                        <Group spacing="xl">
                          <Group spacing="xs">
                        <ActionIcon
                          variant="light"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                        >
                              <IconMinus size={16} />
                        </ActionIcon>
                            <Text fw={500} w={40} ta="center">
                              {item.quantity}
                            </Text>
                        <ActionIcon
                          variant="light"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                              <IconPlus size={16} />
                        </ActionIcon>
                          </Group>
                          <Text fw={700} size="lg" c="blue">
                            {formatPrice(item.price * item.quantity)}
                          </Text>
                        </Group>
                      </Box>
                      </Group>
                      <ActionIcon 
                        color="red" 
                        variant="light"
                        onClick={() => openRemoveModal(item)}
                      >
                      <IconTrash size={18} />
                      </ActionIcon>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        </Grid.Col>

        {/* Sipariş Özeti */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Sipariş Özeti</Title>
            
            <Group justify="space-between" mb="xs">
              <Text>Ürünler Toplamı:</Text>
              <Text>{formatPrice(cartTotal)}</Text>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text>İndirim:</Text>
              <Text c="green">-{formatPrice(cartTotal - discountedTotal)}</Text>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text>Kargo:</Text>
              <Text>Ücretsiz</Text>
            </Group>
            
            <Divider my="md" />
            
            <Group justify="space-between" mb="md">
              <Text fw={700} size="lg">Toplam:</Text>
              <Text fw={700} size="lg" c="blue">{formatPrice(discountedTotal)}</Text>
            </Group>
            
            <Button 
              fullWidth 
              color="green"
              size="lg"
              onClick={() => navigate('/checkout')}
              leftSection={<IconShoppingCart size={20} />}
            >
              Siparişi Tamamla
            </Button>

            <Alert 
              icon={<IconAlertCircle size={16} />} 
              color="blue" 
              mt="md"
              variant="light"
            >
              Siparişi tamamladığınızda ödeme sayfasına yönlendirileceksiniz.
            </Alert>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Ürün Silme Onay Modalı */}
      <Modal
        opened={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Ürün Sepetten Çıkarılacak"
        centered
        size="sm"
      >
        <Text mb="lg">
          {itemToRemove?.product?.name || 'Bu ürünü'} sepetinizden çıkarmak istediğinize emin misiniz?
        </Text>
        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={() => setRemoveModalOpen(false)}
          >
            İptal
          </Button>
          <Button 
            color="red" 
            onClick={handleRemoveItem}
          >
            Sepetten Çıkar
          </Button>
        </Group>
      </Modal>

      {/* Sepet Temizleme Onay Modalı */}
      <Modal
        opened={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Sepet Temizlenecek"
        centered
        size="sm"
      >
        <Text mb="lg">
          Sepetinizdeki tüm ürünleri çıkarmak istediğinize emin misiniz?
        </Text>
        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={() => setClearModalOpen(false)}
          >
            İptal
          </Button>
          <Button 
            color="red" 
            onClick={handleClearCart}
          >
            Sepeti Temizle
          </Button>
        </Group>
      </Modal>
    </Container>
  );
} 