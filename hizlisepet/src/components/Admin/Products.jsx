import { useState, useEffect } from 'react';
import { Table, Button, Text, Group, Modal, TextInput, NumberInput, Select, Textarea, Stack, FileInput } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories] = useState([
    { value: 'Anne & Çocuk', label: 'Anne & Çocuk' },
    { value: 'Ayakkabı & Çanta', label: 'Ayakkabı & Çanta' },
    { value: 'Elektronik', label: 'Elektronik' },
    { value: 'Ev & Yaşam', label: 'Ev & Yaşam' },
    { value: 'Giyim', label: 'Giyim' },
    { value: 'Kozmetik', label: 'Kozmetik' },
    { value: 'Spor & Outdoor', label: 'Spor & Outdoor' },
    { value: 'Süpermarket', label: 'Süpermarket' }
  ]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: 0,
    discount_price: 0,
    discount_rate: 0,
    image_url: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    stock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.category) {
      // Seçilen kategoriye göre alt kategorileri ayarla
      const selectedCategory = formData.category;
      const subcats = {
        'Elektronik': ['Telefon', 'Bilgisayar', 'Tablet', 'TV & Ses Sistemleri', 'Beyaz Eşya', 'Küçük Ev Aletleri', 'Oyun & Oyun Konsolları', 'Foto & Kamera'],
        'Giyim': ['Kadın Giyim', 'Erkek Giyim', 'Elbise', 'Gömlek & Bluz', 'T-shirt & Sweatshirt', 'Pantolon & Şort', 'Etek & Tulum', 'Ceket & Mont', 'Takım Elbise', 'İç Giyim & Pijama', 'Spor Giyim', 'Hamile Giyim', 'Plaj Giyim', 'Büyük Beden', 'Tesettür Giyim', 'Aksesuar'],
        'Ev & Yaşam': ['Mobilya', 'Ev Tekstili', 'Aydınlatma', 'Dekorasyon', 'Mutfak Gereçleri', 'Banyo', 'Ev Düzenleme', 'Bahçe'],
        'Kozmetik': ['Makyaj', 'Parfüm', 'Cilt Bakımı', 'Saç Bakımı', 'Kişisel Bakım', 'Güneş Ürünleri', 'Erkek Bakım', 'Organik Kozmetik'],
        'Anne & Çocuk': ['Bebek Giyim', 'Çocuk Giyim', 'Bebek Bakım', 'Bebek Bezi & Mendil', 'Bebek Arabaları', 'Oto Koltuğu', 'Mama Sandalyesi', 'Oyuncak'],
        'Süpermarket': ['Temel Gıda', 'Atıştırmalık', 'İçecek', 'Kahvaltılık', 'Temizlik', 'Kağıt Ürünleri', 'Kişisel Bakım', 'Ev Bakım'],
        'Ayakkabı & Çanta': ['Kadın Ayakkabı', 'Erkek Ayakkabı', 'Çocuk Ayakkabı', 'Spor Ayakkabı', 'Çanta', 'Cüzdan', 'Sırt Çantası', 'Valiz'],
        'Spor & Outdoor': ['Spor Giyim', 'Spor Ayakkabı', 'Fitness & Kondisyon', 'Outdoor & Kamp', 'Bisiklet', 'Scooter', 'Spor Ekipmanları', 'Sporcu Besinleri']
      };
      setSubcategories(subcats[selectedCategory]?.map(name => ({ value: name, label: name })) || []);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category]);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      notifications.show({
        title: 'Başarılı',
        message: 'Görsel başarıyla yüklendi',
        color: 'green'
      });
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Görsel yüklenirken bir hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Form verilerini hazırla
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        discount_rate: formData.discount_rate ? Number(formData.discount_rate) : null,
        image_url: formData.image_url || null,
        brand: formData.brand.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description.trim(),
        stock: Number(formData.stock),
        created_at: new Date().toISOString()
      };

      // Zorunlu alanları kontrol et
      if (!productData.name || !productData.price || !productData.brand || 
          !productData.category || !productData.subcategory || !productData.stock) {
        notifications.show({
          title: 'Hata',
          message: 'Lütfen tüm zorunlu alanları doldurun',
          color: 'red'
        });
        return;
      }

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
      setFormData({
        id: null,
        name: '',
        price: 0,
        discount_price: 0,
        discount_rate: 0,
        image_url: '',
        brand: '',
        category: '',
        subcategory: '',
        description: '',
        stock: 0
      });
      await fetchProducts();
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün eklenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      discount_rate: product.discount_rate,
      image_url: product.image_url,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      stock: product.stock
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

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

      fetchProducts();
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün silinirken bir hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);

      // Form verilerini hazırla
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        discount_rate: formData.discount_rate ? Number(formData.discount_rate) : null,
        image_url: formData.image_url || null,
        brand: formData.brand.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description.trim(),
        stock: Number(formData.stock)
      };

      // Zorunlu alanları kontrol et
      if (!productData.name || !productData.price || !productData.brand || 
          !productData.category || !productData.subcategory || !productData.stock) {
        notifications.show({
          title: 'Hata',
          message: 'Lütfen tüm zorunlu alanları doldurun',
          color: 'red'
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', formData.id);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla güncellendi',
        color: 'green'
      });

      setEditModalOpen(false);
      setFormData({
        id: null,
        name: '',
        price: 0,
        discount_price: 0,
        discount_rate: 0,
        image_url: '',
        brand: '',
        category: '',
        subcategory: '',
        description: '',
        stock: 0
      });
      await fetchProducts();
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün güncellenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>
          Ürünler
        </Text>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => setModalOpen(true)}
        >
          Yeni Ürün Ekle
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
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
              <Table.Td>{product.name}</Table.Td>
              <Table.Td>{product.category}</Table.Td>
              <Table.Td>{product.price} TL</Table.Td>
              <Table.Td>{product.stock}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button variant="light" size="xs" leftSection={<IconEdit size={16} />} onClick={() => handleEdit(product)}>
                    Düzenle
                  </Button>
                  <Button color="red" size="xs" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(product.id)}>
                    Sil
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yeni Ürün Ekle"
        size="lg"
      >
        <Stack>
          <TextInput
            label="Ürün Adı"
            placeholder="Ürün adını girin"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <NumberInput
            label="Fiyat"
            placeholder="Ürün fiyatını girin"
            value={formData.price}
            onChange={(value) => handleInputChange('price', value)}
            min={1}
            required
          />

          <NumberInput
            label="İndirim Oranı (%)"
            placeholder="İndirim oranını girin"
            value={formData.discount_rate}
            onChange={(value) => handleInputChange('discount_rate', value)}
            min={1}
            max={100}
            clampBehavior="strict"
          />

          <NumberInput
            label="İndirimli Fiyat"
            placeholder="İndirimli fiyatı girin"
            value={formData.discount_price}
            onChange={(value) => handleInputChange('discount_price', value)}
            min={1}
          />

          <FileInput
            label="Ürün Görseli"
            placeholder="Görsel seçin"
            accept="image/*"
            onChange={handleImageUpload}
            loading={loading}
          />

          <TextInput
            label="Marka"
            placeholder="Marka adını girin"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          />

          <Select
            label="Kategori"
            placeholder="Kategori seçin"
            data={categories}
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            required
            searchable
            comboboxProps={{ nothingFoundMessage: "Kategori bulunamadı" }}
          />

          <Select
            label="Alt Kategori"
            placeholder="Alt kategori seçin"
            data={subcategories}
            value={formData.subcategory}
            onChange={(value) => handleInputChange('subcategory', value)}
            disabled={!formData.category}
            searchable
            comboboxProps={{ nothingFoundMessage: "Alt kategori bulunamadı" }}
          />

          <Textarea
            label="Açıklama"
            placeholder="Ürün açıklamasını girin"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            minRows={3}
          />

          <NumberInput
            label="Stok"
            placeholder="Stok miktarını girin"
            value={formData.stock}
            onChange={(value) => handleInputChange('stock', value)}
            min={1}
            required
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Ürün Düzenle"
        size="lg"
      >
        <Stack>
          <TextInput
            label="Ürün Adı"
            placeholder="Ürün adını girin"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <NumberInput
            label="Fiyat"
            placeholder="Ürün fiyatını girin"
            value={formData.price}
            onChange={(value) => handleInputChange('price', value)}
            min={1}
            required
          />

          <NumberInput
            label="İndirim Oranı (%)"
            placeholder="İndirim oranını girin"
            value={formData.discount_rate}
            onChange={(value) => handleInputChange('discount_rate', value)}
            min={1}
            max={100}
            clampBehavior="strict"
          />

          <NumberInput
            label="İndirimli Fiyat"
            placeholder="İndirimli fiyatı girin"
            value={formData.discount_price}
            onChange={(value) => handleInputChange('discount_price', value)}
            min={1}
          />

          <FileInput
            label="Ürün Görseli"
            placeholder="Görsel seçin"
            accept="image/*"
            onChange={handleImageUpload}
            loading={loading}
          />

          <TextInput
            label="Marka"
            placeholder="Marka adını girin"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          />

          <Select
            label="Kategori"
            placeholder="Kategori seçin"
            data={categories}
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            required
            searchable
            comboboxProps={{ nothingFoundMessage: "Kategori bulunamadı" }}
          />

          <Select
            label="Alt Kategori"
            placeholder="Alt kategori seçin"
            data={subcategories}
            value={formData.subcategory}
            onChange={(value) => handleInputChange('subcategory', value)}
            disabled={!formData.category}
            searchable
            comboboxProps={{ nothingFoundMessage: "Alt kategori bulunamadı" }}
          />

          <Textarea
            label="Açıklama"
            placeholder="Ürün açıklamasını girin"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            minRows={3}
          />

          <NumberInput
            label="Stok"
            placeholder="Stok miktarını girin"
            value={formData.stock}
            onChange={(value) => handleInputChange('stock', value)}
            min={1}
            required
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditSubmit} loading={loading}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
} 