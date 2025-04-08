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
  Stack
} from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Tüm kategorileri getir
      const { data: allCategories, error: mainError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (mainError) {
        console.error('Supabase hatası:', mainError);
        throw mainError;
      }

      if (!allCategories) {
        setCategories([]);
        return;
      }

      // Her kategori için ürün sayısını hesapla
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          try {
            // Ürün sayısını hesapla
            const { count: productCount, error: productError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id);

            if (productError) throw productError;

            return {
              ...category,
              product_count: productCount || 0
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

      setCategories(categoriesWithCounts);
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
      // Ürün sayısını kontrol et
      const { count: productCount, error: productError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (productError) throw productError;

      if (productCount > 0) {
        notifications.show({
          title: 'Hata',
          message: 'Bu kategoride ürünler var. Önce ürünleri silmelisiniz.',
          color: 'red'
        });
        return;
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      notifications.show({
        title: 'Başarılı',
        message: 'Kategori silindi',
        color: 'green'
      });
      fetchCategories();
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategori silinirken bir sorun oluştu',
        color: 'red'
      });
    }
  };

  const rows = categories.map((category) => (
    <Table.Tr key={category.id}>
      <Table.Td>{category.name}</Table.Td>
      <Table.Td>
        <Badge color="blue" variant="light">
          {category.product_count} Ürün
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={() => navigate(`edit/${category.id}`)}
            title="Düzenle"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => handleDelete(category.id)}
            title="Sil"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
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
        >
          Yeni Kategori
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Kategori Adı</Table.Th>
            <Table.Th>Ürün Sayısı</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text ta="center">Yükleniyor...</Text>
              </Table.Td>
            </Table.Tr>
          ) : rows.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text ta="center">Henüz kategori bulunmuyor</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            rows
          )}
        </Table.Tbody>
      </Table>
    </Container>
  );
} 