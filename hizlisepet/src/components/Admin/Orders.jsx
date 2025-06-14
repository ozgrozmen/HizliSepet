import { useState, useEffect } from 'react';
import { 
  Table, Button, Text, Group, Badge, Modal, Select, 
  Alert, ActionIcon, Paper, Title, Divider, Container, 
  Stack, Loader, Center
} from '@mantine/core';
import { IconEye, IconEdit, IconClock, IconCheck, IconTruck, IconX } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Siparişleri al
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Her sipariş için profile bilgisini al
      const ordersWithProfiles = await Promise.all(
        (ordersData || []).map(async (order) => {
          if (!order.user_id) {
            return {
              ...order,
              profiles: { email: 'Misafir Kullanıcı' }
            };
          }

          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', order.user_id)
            .single();
          
          return {
            ...order,
            profiles: profile || { email: 'Bilinmeyen Kullanıcı' }
          };
        })
      );
      
      setOrders(ordersWithProfiles);
      console.log('Siparişler yüklendi:', ordersWithProfiles?.length);
    } catch (error) {
      console.error('Sipariş yükleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Siparişler yüklenirken hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, image_url, category)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      
      setOrderItems(data || []);
    } catch (error) {
      console.error('Sipariş kalemleri yükleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Sipariş detayları yüklenirken hata oluştu',
        color: 'red'
      });
    }
  };

  const openDetailModal = async (order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setDetailModalOpen(true);
  };

  const openEditModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setEditModalOpen(true);
  };

  const closeModals = () => {
    setDetailModalOpen(false);
    setEditModalOpen(false);
    setSelectedOrder(null);
    setOrderItems([]);
    setNewStatus('');
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: `Sipariş durumu ${newStatus} olarak güncellendi`,
        color: 'green'
      });

      closeModals();
      fetchOrders();
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Durum güncellenirken hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <IconClock size={16} />;
      case 'confirmed':
        return <IconCheck size={16} />;
      case 'shipped':
        return <IconTruck size={16} />;
      case 'delivered':
        return <IconCheck size={16} />;
      case 'cancelled':
        return <IconX size={16} />;
      default:
        return <IconClock size={16} />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'shipped':
        return 'cyan';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Sipariş Yönetimi</Title>
            <Text c="dimmed">
              Toplam {orders.length} sipariş | 
              Bekleyen: {orders.filter(o => o.status === 'pending').length} | 
              Teslim Edildi: {orders.filter(o => o.status === 'delivered').length}
            </Text>
          </div>
        </Group>

        <Divider mb="md" />

        {orders.length === 0 ? (
          <Alert title="Henüz sipariş yok" color="blue">
            Henüz hiç sipariş oluşturulmamış.
          </Alert>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Sipariş #</Table.Th>
                <Table.Th>Müşteri</Table.Th>
                <Table.Th>Tutar</Table.Th>
                <Table.Th>Durum</Table.Th>
                <Table.Th>Ödeme</Table.Th>
                <Table.Th>Tarih</Table.Th>
                <Table.Th>İşlemler</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">
                      #{order.id.slice(-8).toUpperCase()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{order.profiles?.email}</Text>
                      <Text size="sm" c="dimmed">{order.phone}</Text>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={600} c="blue">
                      {formatPrice(order.total_amount)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={getStatusBadgeColor(order.status)} 
                      variant="light"
                      leftSection={getStatusIcon(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.payment_method}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(order.created_at)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => openDetailModal(order)}
                        title="Detayları Görüntüle"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="orange"
                        onClick={() => openEditModal(order)}
                        title="Durumu Güncelle"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* Sipariş Detay Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={closeModals}
        title="Sipariş Detayları"
        size="lg"
      >
        {selectedOrder && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600}>Sipariş #{selectedOrder.id.slice(-8).toUpperCase()}</Text>
              <Badge color={getStatusBadgeColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Badge>
            </Group>

            <Divider />

            <div>
              <Text fw={500} mb="xs">Müşteri Bilgileri</Text>
              <Text size="sm">Email: {selectedOrder.profiles?.email}</Text>
              <Text size="sm">Telefon: {selectedOrder.phone}</Text>
            </div>

            <div>
              <Text fw={500} mb="xs">Teslimat Adresi</Text>
              {selectedOrder.shipping_address && (
                <div>
                  <Text size="sm">{selectedOrder.shipping_address.fullName}</Text>
                  <Text size="sm">{selectedOrder.shipping_address.address}</Text>
                  <Text size="sm">
                    {selectedOrder.shipping_address.district}/{selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.postalCode}
                  </Text>
                </div>
              )}
            </div>

            <div>
              <Text fw={500} mb="xs">Sipariş Kalemleri</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ürün</Table.Th>
                    <Table.Th>Adet</Table.Th>
                    <Table.Th>Fiyat</Table.Th>
                    <Table.Th>Toplam</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {orderItems.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Group>
                          <img 
                            src={item.products?.image_url} 
                            alt={item.products?.name}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                          <div>
                            <Text size="sm" fw={500}>{item.products?.name}</Text>
                            <Text size="xs" c="dimmed">{item.products?.category}</Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>{formatPrice(item.price)}</Table.Td>
                      <Table.Td>{formatPrice(item.total)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>

            <Divider />

            <Group justify="space-between">
              <Text fw={600}>Toplam Tutar</Text>
              <Text fw={700} size="lg" c="blue">
                {formatPrice(selectedOrder.total_amount)}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Durum Güncelleme Modal */}
      <Modal
        opened={editModalOpen}
        onClose={closeModals}
        title="Sipariş Durumunu Güncelle"
        size="sm"
      >
        {selectedOrder && (
          <Stack>
            <Text mb="md">
              <strong>#{selectedOrder.id.slice(-8).toUpperCase()}</strong> nolu siparişin durumunu değiştirin:
            </Text>
            
            <Select
              label="Yeni Durum"
              placeholder="Durum seçin"
              value={newStatus}
              onChange={setNewStatus}
              data={[
                { value: 'pending', label: 'Beklemede' },
                { value: 'confirmed', label: 'Onaylandı' },
                { value: 'shipped', label: 'Kargoya Verildi' },
                { value: 'delivered', label: 'Teslim Edildi' },
                { value: 'cancelled', label: 'İptal Edildi' }
              ]}
              mb="md"
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={closeModals}>
                İptal
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                loading={loading}
                disabled={newStatus === selectedOrder.status}
              >
                Güncelle
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
} 