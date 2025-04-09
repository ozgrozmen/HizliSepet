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
import { 
  IconShoppingCart, 
  IconTrash, 
  IconAlertCircle, 
  IconShoppingCartOff, 
  IconCheck, 
  IconX 
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export function CartPage() {
  const { cartItems, loading, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  // Sepet öğeleri için form bilgilerini oluştur
  const [formValues, setFormValues] = useState({});
  
  // Form değerlerini güncelle
  useEffect(() => {
    const newFormValues = {};
    cartItems.forEach(item => {
      newFormValues[item.id] = {
        quantity: item.quantity
      };
    });
    setFormValues(newFormValues);
  }, [cartItems]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (isNaN(newQuantity)) {
      notifications.show({
        title: 'Hata',
        message: 'Geçersiz miktar',
        color: 'red'
      });
      return;
    }
    
    if (newQuantity < 1) {
      newQuantity = 1;
    } else if (newQuantity > 99) {
      newQuantity = 99;
    }
    
    newQuantity = parseInt(newQuantity, 10);
    
    setUpdating(true);
    console.log(`Miktar güncellenecek: ID=${itemId}, Yeni Miktar=${newQuantity}`);
    const success = await updateQuantity(itemId, newQuantity);
    setUpdating(false);
    
    if (success) {
      notifications.show({
        title: 'Başarılı',
        message: 'Ürün miktarı güncellendi',
        color: 'green'
      });
    } else {
      notifications.show({
        title: 'Hata',
        message: 'Miktar güncellenirken bir hata oluştu',
        color: 'red'
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  const openRemoveModal = (item) => {
    setItemToRemove(item);
    setRemoveModalOpen(true);
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
        message: `${itemToRemove.product?.name || 'Ürün'} sepetinizden çıkarıldı`,
        color: 'green'
      });
    } else {
      notifications.show({
        title: 'Hata',
        message: 'Ürün sepetten çıkarılırken bir hata oluştu',
        color: 'red'
      });
    }
    
    setItemToRemove(null);
  };

  const openClearModal = () => {
    setClearModalOpen(true);
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

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={true} />
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
  const discountedTotal = cartTotal * 0.9; // %10 indirim (örnek)

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={updating} />
      
      <Group justify="space-between" mb="lg">
        <Title order={1}>Sepetim</Title>
        {cartItems.length > 0 && (
          <Button 
            variant="subtle" 
            color="red" 
            onClick={openClearModal}
            leftSection={<IconTrash size={16} />}
          >
            Sepeti Temizle
          </Button>
        )}
      </Group>

      <Grid>
        {/* Sepet Ürünleri */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="md" withBorder>
            {cartItems.map((item) => {
              const product = item.product || item;
              
              // Miktar değeri doğrulanmış olmalı
              if (formValues[item.id]?.quantity !== item.quantity) {
                setFormValues(prev => ({
                  ...prev,
                  [item.id]: {
                    ...prev[item.id],
                    quantity: item.quantity
                  }
                }));
              }
              
              return (
                <Box key={item.id} mb="md">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    {/* Ürün Resmi */}
                    <Image
                      src={product.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                      width={100}
                      height={100}
                      fit="contain"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/product/${item.product_id}`)}
                    />

                    {/* Ürün Bilgileri */}
                    <Box style={{ flex: 1 }}>
                      <Text 
                        fw={500} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      >
                        {product.name}
                      </Text>
                      <Group spacing={5} mt={3}>
                        {item.color && (
                          <Badge color="blue" variant="light">
                            Renk: {item.color}
                          </Badge>
                        )}
                        {item.size && (
                          <Badge color="teal" variant="light">
                            Beden: {item.size}
                          </Badge>
                        )}
                      </Group>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Fiyat:</Text>
                        <Text>{formatPrice(product.price)}</Text>
                      </Group>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Miktar:</Text>
                        <Text>{item.quantity} adet</Text>
                      </Group>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>Toplam:</Text>
                        <Text fw={600} c="blue">
                          {formatPrice(product.price * item.quantity)}
                        </Text>
                      </Group>
                    </Box>

                    {/* Miktar Ayarı */}
                    <Group>
                      <Group spacing={5}>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          disabled={item.quantity <= 1 || updating}
                          onClick={() => {
                            const newQuantity = Math.max(1, formValues[item.id]?.quantity - 1 || item.quantity - 1);
                            // Form değerini güncelle
                            setFormValues(prev => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                quantity: newQuantity
                              }
                            }));
                            // Sepet miktarını güncelle
                            handleQuantityChange(item.id, newQuantity);
                          }}
                        >
                          -
                        </ActionIcon>
                        <NumberInput
                          min={1}
                          max={99}
                          size="xs"
                          w={50}
                          hideControls
                          disabled={updating}
                          styles={{ input: { textAlign: 'center' } }}
                          onChange={(val) => {
                            // Form değerlerini güncelle
                            setFormValues(prev => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                quantity: val
                              }
                            }));
                          }}
                          onBlur={() => {
                            const newQuantity = formValues[item.id]?.quantity;
                            // Miktarı doğrula ve güncelle
                            if (newQuantity !== undefined && newQuantity !== item.quantity) {
                              if (newQuantity >= 1 && newQuantity <= 99) {
                                handleQuantityChange(item.id, newQuantity);
                              } else {
                                // Miktar geçersizse, önceki miktarı geri yükle
                                setFormValues(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    quantity: item.quantity
                                  }
                                }));
                              }
                            }
                          }}
                          value={formValues[item.id]?.quantity || item.quantity}
                        />
                        <ActionIcon
                          size="sm"
                          variant="light"
                          disabled={item.quantity >= 99 || updating}
                          onClick={() => {
                            const newQuantity = Math.min(99, formValues[item.id]?.quantity + 1 || item.quantity + 1);
                            // Form değerini güncelle
                            setFormValues(prev => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                quantity: newQuantity
                              }
                            }));
                            // Sepet miktarını güncelle
                            handleQuantityChange(item.id, newQuantity);
                          }}
                        >
                          +
                        </ActionIcon>
                      </Group>
                      <ActionIcon 
                        color="red" 
                        variant="light"
                        onClick={() => openRemoveModal(item)}
                        disabled={updating}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Divider my="md" />
                </Box>
              );
            })}
          </Paper>
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