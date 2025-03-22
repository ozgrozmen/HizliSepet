import React, { useState } from 'react';
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
import { useForm } from '@mantine/form';
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

  const quantityForms = cartItems.reduce((forms, item) => {
    forms[item.id] = useForm({
      initialValues: {
        quantity: item.quantity
      },
      validate: {
        quantity: (value) => 
          (value < 1 || value > 99) ? 'Miktar 1-99 arası olmalıdır' : null
      }
    });
    return forms;
  }, {});

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
        <LoadingOverlay visible={true} overlayBlur={2} />
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
      <LoadingOverlay visible={updating} overlayBlur={2} />
      
      <Group position="apart" mb="lg">
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
              const form = quantityForms[item.id];
              
              if (form && form.values.quantity !== item.quantity) {
                form.setValues({ quantity: item.quantity });
              }
              
              return (
                <Box key={item.id} mb="md">
                  <Group position="apart" noWrap align="flex-start">
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
                      <Group mt="xs">
                        <Text fw={700} c="blue">
                          {((item.price || product.price) * item.quantity).toFixed(2)} TL
                        </Text>
                        <Text size="sm" c="dimmed">
                          Birim: {(item.price || product.price).toFixed(2)} TL
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
                            const newQuantity = item.quantity - 1;
                            if (newQuantity >= 1) {
                              handleQuantityChange(item.id, newQuantity);
                              if (form) form.setFieldValue('quantity', newQuantity);
                            }
                          }}
                        >
                          -
                        </ActionIcon>
                        <NumberInput
                          {...form.getInputProps('quantity')}
                          min={1}
                          max={99}
                          size="xs"
                          w={50}
                          hideControls
                          disabled={updating}
                          styles={{ input: { textAlign: 'center' } }}
                          onChange={(val) => {
                            form.setFieldValue('quantity', val);
                          }}
                          onBlur={() => {
                            if (!form.validate().hasErrors) {
                              if (form.values.quantity !== item.quantity) {
                                handleQuantityChange(item.id, form.values.quantity);
                              }
                            } else {
                              form.setFieldValue('quantity', item.quantity);
                            }
                          }}
                        />
                        <ActionIcon
                          size="sm"
                          variant="light"
                          disabled={item.quantity >= 99 || updating}
                          onClick={() => {
                            const newQuantity = item.quantity + 1;
                            if (newQuantity <= 99) {
                              handleQuantityChange(item.id, newQuantity);
                              if (form) form.setFieldValue('quantity', newQuantity);
                            }
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
            
            <Group position="apart" mb="xs">
              <Text>Ürünler Toplamı:</Text>
              <Text>{cartTotal.toFixed(2)} TL</Text>
            </Group>
            
            <Group position="apart" mb="xs">
              <Text>İndirim:</Text>
              <Text c="green">-{(cartTotal - discountedTotal).toFixed(2)} TL</Text>
            </Group>
            
            <Group position="apart" mb="xs">
              <Text>Kargo:</Text>
              <Text>Ücretsiz</Text>
            </Group>
            
            <Divider my="md" />
            
            <Group position="apart" mb="md">
              <Text fw={700} size="lg">Toplam:</Text>
              <Text fw={700} size="lg" c="blue">{discountedTotal.toFixed(2)} TL</Text>
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
        <Group position="right">
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
        <Group position="right">
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