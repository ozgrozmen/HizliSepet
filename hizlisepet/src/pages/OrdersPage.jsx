import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Group,
  Text,
  Divider,
  Badge,
  Card,
  Image,
  Accordion,
  Box,
  LoadingOverlay,
  Center,
  Loader
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { IconShoppingBag, IconCalendar, IconCreditCard, IconTruckDelivery } from '@tabler/icons-react';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının siparişlerini getir
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Siparişler yüklenirken hata:', error);
        setLoading(false);
        return;
      }

      console.log('Siparişler:', data);
      setOrders(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Siparişler yüklenirken beklenmeyen hata:', err);
      setLoading(false);
    }
  };

  // Fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Tarih formatı fonksiyonu
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Durum gösterimi için renkler
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'confirmed':
        return 'blue';
      case 'shipped':
        return 'teal';
      case 'cancelled':
        return 'red';
      case 'pending':
      default:
        return 'yellow';
    }
  };

  // Durumun Türkçe karşılığı
  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'confirmed':
        return 'Onaylandı';
      case 'shipped':
        return 'Kargoya Verildi';
      case 'cancelled':
        return 'İptal Edildi';
      case 'pending':
      default:
        return 'Beklemede';
    }
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '60vh' }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <Card withBorder p="xl" radius="md" shadow="sm">
          <Center p="xl">
            <Box>
              <Center>
                <IconShoppingBag size={80} stroke={1.5} color="gray" />
              </Center>
              <Text ta="center" fz="xl" fw={500} mt="md">
                Siparişlerinizi görmek için giriş yapmalısınız
              </Text>
              <Text ta="center" c="dimmed" mt="sm">
                Siparişlerinizi görüntülemek için lütfen hesabınıza giriş yapın.
              </Text>
            </Box>
          </Center>
        </Card>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Card withBorder p="xl" radius="md" shadow="sm">
          <Center p="xl">
            <Box>
              <Center>
                <IconShoppingBag size={80} stroke={1.5} color="gray" />
              </Center>
              <Text ta="center" fz="xl" fw={500} mt="md">
                Henüz Siparişiniz Bulunmuyor
              </Text>
              <Text ta="center" c="dimmed" mt="sm">
                Henüz sipariş vermemişsiniz. Alışverişe başlamak için ürünlerimize göz atabilirsiniz.
              </Text>
            </Box>
          </Center>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl" pos="relative">
      <LoadingOverlay visible={loading} />
      
      <Title order={1} mb="xl">Siparişlerim</Title>

      <Accordion>
        {orders.map((order) => (
          <Accordion.Item key={order.id} value={order.id}>
            <Accordion.Control>
              <Group justify="space-between" wrap="nowrap">
                <Group>
                  <IconShoppingBag size={20} />
                  <div>
                    <Text fw={500}>Sipariş #{order.id.substring(0, 8)}</Text>
                    <Text size="sm" c="dimmed">
                      <IconCalendar size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {formatDate(order.created_at)}
                    </Text>
                  </div>
                </Group>
                <Group gap="md">
                  <Badge color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <Text fw={600}>{formatPrice(order.total_amount)}</Text>
                </Group>
              </Group>
            </Accordion.Control>
            
            <Accordion.Panel>
              <Card withBorder radius="md" p="md" mb="md">
                <Text fw={600} mb="xs">Teslimat Bilgileri</Text>
                {(() => {
                  try {
                    const address = typeof order.shipping_address === 'string' 
                      ? JSON.parse(order.shipping_address) 
                      : order.shipping_address;
                    
                    return (
                      <Box>
                        <Text size="sm"><strong>Ad Soyad:</strong> {address.fullName || 'Belirtilmemiş'}</Text>
                        <Text size="sm"><strong>Telefon:</strong> {address.phone || order.phone || 'Belirtilmemiş'}</Text>
                        <Text size="sm"><strong>Adres:</strong> {address.address || 'Belirtilmemiş'}</Text>
                        <Text size="sm"><strong>İlçe:</strong> {address.district || 'Belirtilmemiş'}</Text>
                        <Text size="sm"><strong>Şehir:</strong> {address.city || 'Belirtilmemiş'}</Text>
                        <Text size="sm"><strong>Posta Kodu:</strong> {address.postalCode || 'Belirtilmemiş'}</Text>
                      </Box>
                    );
                  } catch (error) {
                    console.error('Shipping address parse hatası:', error);
                    return <Text size="sm" c="red">Adres bilgisi görüntülenemiyor</Text>;
                  }
                })()}
                
                <Divider my="md" />
                
                <Text fw={600} mb="xs">Ödeme Bilgileri</Text>
                <Group>
                  <IconCreditCard size={16} />
                  <Text size="sm">{order.payment_method}</Text>
                </Group>
                
                <Divider my="md" />
                
                <Text fw={600} mb="xs">Sipariş Durumu</Text>
                <Group gap="xs">
                  <IconTruckDelivery size={16} />
                  <Text size="sm">{getStatusText(order.status)}</Text>
                </Group>
                
                <Divider my="md" />
                
                <Text fw={600} mb="md">Sipariş Detayları</Text>
                {order.order_items && order.order_items.map((item) => (
                  <Box key={item.id} mb="md">
                    <Group align="flex-start" wrap="nowrap">
                      <Image
                        src={item.product.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                        width={60}
                        height={60}
                        fit="contain"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      />
                      <Box style={{ flex: 1 }}>
                        <Text 
                          fw={500} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${item.product_id}`)}
                        >
                          {item.product.name}
                        </Text>
                        
                        <Group justify="space-between" mb="xs">
                          <Text size="sm">Miktar: {item.quantity} adet</Text>
                          <Text size="sm" fw={600}>{formatPrice(item.price * item.quantity)}</Text>
                        </Group>
                      </Box>
                    </Group>
                  </Box>
                ))}
                
                <Divider my="md" />
                
                <Group justify="space-between">
                  <Text fw={500}>Toplam:</Text>
                  <Text fw={700} size="lg">{formatPrice(order.total_amount)}</Text>
                </Group>
              </Card>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
} 