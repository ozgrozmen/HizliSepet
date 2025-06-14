import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Table, 
  Button, 
  Group, 
  Text, 
  ActionIcon,
  Badge,
  Stack,
  Card,
  Grid,
  Modal,
  TextInput,
  Select,
  Loader
} from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

// Önceden tanımlanmış kategoriler
const predefinedCategories = [
  { name: 'Giyim', description: 'Tüm giyim ürünleri' },
  { name: 'Anne ve Çocuk', description: 'Anne ve çocuk ürünleri' },
  { name: 'Ev ve Mobilya', description: 'Ev dekorasyon ve mobilya ürünleri' },
  { name: 'Süpermarket', description: 'Market ürünleri' },
  { name: 'Kozmetik', description: 'Güzellik ve bakım ürünleri' },
  { name: 'Elektronik', description: 'Elektronik cihazlar ve aksesuarlar' },
  { name: 'Kitap', description: 'Kitaplar ve kırtasiye ürünleri' },
  { name: 'Spor', description: 'Spor ekipmanları ve giyim' },
  { name: 'Ayakkabı ve Çanta', description: 'Ayakkabı ve çanta ürünleri' }
];

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAndCreateDefaultCategories();
  }, []);

  const checkAndCreateDefaultCategories = async () => {
    try {
      setLoading(true);
      
      // Mevcut kategorileri kontrol et
      const { data: existingCategories, error: fetchError } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (fetchError) {
        console.error('Mevcut kategorileri kontrol ederken hata:', fetchError);
        throw fetchError;
      }

      // Mevcut kategori isimlerini bir diziye çıkar
      const existingNames = existingCategories ? existingCategories.map(c => c.name.toLowerCase()) : [];

      // Eksik kategorileri ekle
      for (const category of predefinedCategories) {
        if (!existingNames.includes(category.name.toLowerCase())) {
          const { error: insertError } = await supabase
            .from('categories')
            .insert([category]);

          if (insertError) {
            console.error(`Kategori ${category.name} eklenirken hata:`, insertError);
          } else {
            console.log(`Kategori eklendi: ${category.name}`);
          }
        }
      }

      // Tüm kategorileri yeniden yükle
      fetchCategories();
    } catch (error) {
      console.error('Varsayılan kategoriler oluşturulurken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategoriler oluşturulurken bir sorun oluştu.',
        color: 'red'
      });
      setLoading(false);
    }
  };

  const checkTableStructure = async () => {
    try {
      // Tablo yapısını kontrol et
      const { data: tableInfo, error: tableError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

      if (tableError) {
        console.error('Tablo yapısı kontrolünde hata:', tableError);
        return;
      }

      console.log('Tablo yapısı:', tableInfo);
    } catch (error) {
      console.error('Tablo yapısı kontrolünde hata:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Tüm kategorileri getir
      const { data: allCategories, error: mainError } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name', { ascending: true });

      if (mainError) {
        console.error('Supabase hatası:', mainError);
        throw mainError;
      }

      if (!allCategories || allCategories.length === 0) {
        setCategories([]);
        return;
      }

      // Her kategori için ürün sayısını hesapla
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          try {
            const { data: products, error: productError } = await supabase
              .from('products')
              .select('id')
              .eq('category', category.id);

            if (productError) {
              console.error(`Kategori ${category.name} için ürün sayısı hesaplanırken hata:`, productError);
              return {
                ...category,
                product_count: 0
              };
            }

            return {
              ...category,
              product_count: products ? products.length : 0
            };
          } catch (error) {
            console.error(`Kategori ${category.name} için sayı hesaplanırken hata:`, error);
            return {
              ...category,
              product_count: 0
            };
          }
        })
      );

      // Ürün sayısına göre sırala (en çok ürün olan üstte)
      const sortedCategories = categoriesWithCounts.sort((a, b) => b.product_count - a.product_count);
      
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategoriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      // Önce ürün sayısını kontrol et
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('category', id);

      if (productError) {
        console.error('Ürün sayısı kontrolünde hata:', productError);
        throw productError;
      }

      if (products && products.length > 0) {
        notifications.show({
          title: 'Hata',
          message: 'Bu kategoride ürünler var. Önce ürünleri silmelisiniz.',
          color: 'red'
        });
        return;
      }

      // Kategoriyi sil
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Silme hatası:', deleteError);
        throw deleteError;
      }

      notifications.show({
        title: 'Başarılı',
        message: 'Kategori başarıyla silindi',
        color: 'green'
      });

      // Kategorileri yeniden yükle
      fetchCategories();
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategori silinirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        color: 'red'
      });
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedCategory) return;

      // Kategori adının benzersiz olduğunu kontrol et
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', editForm.name)
        .neq('id', selectedCategory.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Kategori kontrolünde hata:', checkError);
        throw checkError;
      }

      if (existingCategory) {
        notifications.show({
          title: 'Hata',
          message: 'Bu isimde bir kategori zaten mevcut.',
          color: 'red'
        });
        return;
      }

      // Kategoriyi güncelle
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: editForm.name,
          description: editForm.description
        })
        .eq('id', selectedCategory.id);

      if (updateError) {
        console.error('Kategori güncellenirken hata:', updateError);
        throw updateError;
      }

      // Kategorileri yeniden yükle
      await fetchCategories();

      // Modal'ı kapat ve formu sıfırla
      setSelectedCategory(null);
      setEditForm({ name: '', description: '' });
      setEditModalOpen(false);

      notifications.show({
        title: 'Başarılı',
        message: 'Kategori başarıyla güncellendi.',
        color: 'green'
      });
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategori güncellenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        color: 'red'
      });
    }
  };

  const categoryCards = categories.map((category) => (
    <Grid.Col key={category.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
        <Card.Section p="md" bg="blue.0">
          <Text size="xl" fw={700} ta="center">{category.name}</Text>
        </Card.Section>
        
        <Stack gap="xs" mt="md" style={{ height: 'calc(100% - 80px)' }} justify="space-between">
          <Text size="sm" c="dimmed" lineClamp={2}>
            {category.description || 'Bu kategori için bir açıklama bulunmuyor.'}
          </Text>
          
          <Group position="apart" align="center">
            <Badge 
              color={category.product_count > 0 ? "blue" : "gray"} 
              variant="filled" 
              size="lg"
              style={{ minWidth: '100px' }}
            >
              {category.product_count} Ürün
            </Badge>

            <Group ml="auto" gap="xs">
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => handleEdit(category)}
                title="Düzenle"
                radius="xl"
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="red"
                onClick={() => handleDelete(category.id)}
                title="Sil"
                radius="xl"
                disabled={category.product_count > 0}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </Card>
    </Grid.Col>
  ));

  return (
    <Container size="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Kategori Yönetimi</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate('new')}
          variant="filled"
          color="blue"
          radius="md"
        >
          Yeni Kategori
        </Button>
      </Group>

      {loading ? (
        <Group position="center" style={{ minHeight: '200px' }} align="center">
          <Stack align="center">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Kategoriler yükleniyor...</Text>
          </Stack>
        </Group>
      ) : categories.length === 0 ? (
        <Card p="xl" withBorder shadow="sm" radius="md">
          <Stack align="center" spacing="md">
            <Text size="lg" fw={500} ta="center">Henüz kategori bulunmuyor</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('new')}
              variant="light"
            >
              Kategori Ekle
            </Button>
          </Stack>
        </Card>
      ) : (
        <Grid gutter="md">
          {categoryCards}
        </Grid>
      )}

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Kategori Düzenle"
        size="md"
      >
        <Stack>
          <TextInput
            label="Kategori Adı"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <TextInput
            label="Açıklama"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdate}>
              Güncelle
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 