import { useState, useEffect } from 'react';
import { 
  Table, Button, Text, Group, Modal, TextInput, NumberInput, 
  Select, Textarea, Stack, Alert, Badge, ActionIcon,
  Paper, Title, Divider, Container, Loader, Center
} from '@mantine/core';
import { 
  IconEdit, IconTrash, IconPlus, IconPhoto, IconCheck
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

// Kategori verileri
const CATEGORIES = [
    { value: 'Anne & Çocuk', label: 'Anne & Çocuk' },
    { value: 'Ayakkabı & Çanta', label: 'Ayakkabı & Çanta' },
    { value: 'Elektronik', label: 'Elektronik' },
    { value: 'Ev & Yaşam', label: 'Ev & Yaşam' },
    { value: 'Giyim', label: 'Giyim' },
    { value: 'Kozmetik', label: 'Kozmetik' },
    { value: 'Spor & Outdoor', label: 'Spor & Outdoor' },
    { value: 'Süpermarket', label: 'Süpermarket' }
];

// Alt kategori verileri
const SUBCATEGORIES = {
  'Elektronik': ['Telefon', 'Bilgisayar', 'Tablet', 'TV & Ses Sistemleri'],
  'Giyim': ['Kadın Giyim', 'Erkek Giyim', 'Elbise', 'T-shirt & Sweatshirt'],
  'Ev & Yaşam': ['Mobilya', 'Ev Tekstili', 'Mutfak Gereçleri', 'Banyo'],
  'Kozmetik': ['Makyaj', 'Parfüm', 'Cilt Bakımı', 'Saç Bakımı'],
  'Anne & Çocuk': ['Bebek Giyim', 'Çocuk Giyim', 'Bebek Bakım', 'Oyuncak'],
  'Süpermarket': ['Temel Gıda', 'Atıştırmalık', 'İçecek', 'Temizlik'],
  'Ayakkabı & Çanta': ['Kadın Ayakkabı', 'Erkek Ayakkabı', 'Çanta', 'Cüzdan'],
  'Spor & Outdoor': ['Spor Giyim', 'Spor Ayakkabı', 'Fitness & Kondisyon']
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastFetch, setLastFetch] = useState(null); // Son fetch zamanını takip et
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount_price: '',
    image_url: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    stock: ''
  });

  // Form sıfırlama
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      discount_price: '',
      image_url: '',
      brand: '',
      category: '',
      subcategory: '',
      description: '',
      stock: ''
    });
  };

  // Ürünleri yükle - Cache ile
  const fetchProducts = async (force = false) => {
    // 30 saniyeden daha kısa sürede tekrar fetch etme (cache)
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < 30000) {
      console.log('🕐 Cache aktif, fetch atlanıyor');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
      setLastFetch(now);
      // console.log('Ürünler yüklendi:', data?.length, new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürünler yüklenirken hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Ürün ekleme
  const handleAddProduct = async () => {
    try {
      setLoading(true);

      // Form validasyonu
      if (!formData.name || !formData.price || !formData.category) {
        notifications.show({
          title: 'Eksik Bilgi',
          message: 'Ürün adı, fiyat ve kategori zorunludur',
          color: 'yellow'
        });
        return;
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        image_url: formData.image_url || 'https://via.placeholder.com/300x200',
        brand: formData.brand || null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description || null,
        stock: formData.stock ? parseInt(formData.stock) : 0
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla eklendi',
        color: 'green'
      });

      setModalOpen(false);
      resetForm();
      fetchProducts(true); // Force refresh after add
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün eklenirken hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Ürün güncelleme
  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      
      if (!selectedProduct) return;

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        image_url: formData.image_url || 'https://via.placeholder.com/300x200',
        brand: formData.brand || null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description || null,
        stock: formData.stock ? parseInt(formData.stock) : 0
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', selectedProduct.id);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla güncellendi',
        color: 'green'
      });

      setModalOpen(false);
      setEditMode(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts(true); // Force refresh after update
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün güncellenirken hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Ürün silme
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla silindi',
        color: 'green'
      });

      fetchProducts(true); // Force refresh after delete
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün silinirken hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme modalını aç
  const openEditModal = (product) => {
    setSelectedProduct(product);
      setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      discount_price: product.discount_price?.toString() || '',
      image_url: product.image_url || '',
      brand: product.brand || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description || '',
      stock: product.stock?.toString() || ''
    });
    setEditMode(true);
    setModalOpen(true);
  };

  // Ekleme modalını aç
  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setSelectedProduct(null);
    setModalOpen(true);
  };

  // Modalı kapat
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedProduct(null);
    resetForm();
  };

  // Sayfa yüklendiğinde ürünleri getir
  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };
    
    loadProducts();
    
    return () => {
      isMounted = false;
    };
  }, []); // Boş dependency array - sadece component mount'ta çalışır

  // Alt kategorileri hesapla
  const availableSubcategories = formData.category 
    ? SUBCATEGORIES[formData.category]?.map(name => ({ value: name, label: name })) || []
    : [];

  // Fiyat formatı
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(price);
  };

  if (loading && products.length === 0) {
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
            <Title order={2}>Ürün Yönetimi</Title>
            <Text c="dimmed">Toplam {products.length} ürün</Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={openAddModal}
            loading={loading}
          >
            Yeni Ürün Ekle
          </Button>
        </Group>

        <Divider mb="md" />

        {products.length === 0 ? (
          <Alert title="Henüz ürün yok" color="blue">
            İlk ürünü eklemek için "Yeni Ürün Ekle" butonuna tıklayın.
            </Alert>
        ) : (
          <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
                <Table.Th>Görsel</Table.Th>
            <Table.Th>Ürün Adı</Table.Th>
            <Table.Th>Kategori</Table.Th>
            <Table.Th>Fiyat</Table.Th>
            <Table.Th>Stok</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((product) => (
            <Table.Tr key={product.id}>
                  <Table.Td>
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50x50';
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{product.name}</Text>
                      {product.brand && <Text size="sm" c="dimmed">{product.brand}</Text>}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="light">
                      {product.category}
                    </Badge>
                    {product.subcategory && (
                      <Badge color="gray" variant="outline" size="sm" ml="xs">
                        {product.subcategory}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <div>
                      <Text fw={500}>{formatPrice(product.price)}</Text>
                      {product.discount_price && (
                        <Text size="sm" c="red">
                          İndirimli: {formatPrice(product.discount_price)}
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={product.stock > 0 ? 'green' : 'red'} 
                      variant="light"
                    >
                      {product.stock || 0} adet
                    </Badge>
                  </Table.Td>
              <Table.Td>
                <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => openEditModal(product)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
        )}
      </Paper>

      {/* Ürün Ekleme/Düzenleme Modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={editMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        size="lg"
      >
        <Stack>
          <TextInput
            label="Ürün Adı"
            placeholder="Ürün adını girin"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Group grow>
          <NumberInput
              label="Fiyat (TL)"
              placeholder="0.00"
            value={formData.price}
              onChange={(value) => setFormData(prev => ({ ...prev, price: value?.toString() || '' }))}
              min={0}
              decimalScale={2}
            required
          />
          <NumberInput
              label="İndirimli Fiyat (TL)"
              placeholder="0.00"
            value={formData.discount_price}
              onChange={(value) => setFormData(prev => ({ ...prev, discount_price: value?.toString() || '' }))}
              min={0}
              decimalScale={2}
            />
          </Group>

          <Group grow>
          <Select
            label="Kategori"
            placeholder="Kategori seçin"
              data={CATEGORIES}
            value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value || '', subcategory: '' }))}
            required
          />
          <Select
            label="Alt Kategori"
            placeholder="Alt kategori seçin"
              data={availableSubcategories}
            value={formData.subcategory}
              onChange={(value) => setFormData(prev => ({ ...prev, subcategory: value || '' }))}
            disabled={!formData.category}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Marka"
              placeholder="Marka adı"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            />
          <NumberInput
              label="Stok Adedi"
              placeholder="0"
            value={formData.stock}
              onChange={(value) => setFormData(prev => ({ ...prev, stock: value?.toString() || '' }))}
              min={0}
            />
          </Group>

          <TextInput
            label="Görsel URL"
            placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            leftSection={<IconPhoto size={16} />}
          />

          <Textarea
            label="Açıklama"
            placeholder="Ürün açıklaması"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            minRows={3}
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={closeModal}>
              İptal
            </Button>
            <Button 
              leftSection={<IconCheck size={16} />}
              onClick={editMode ? handleUpdateProduct : handleAddProduct}
              loading={loading}
            >
              {editMode ? 'Güncelle' : 'Ekle'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 