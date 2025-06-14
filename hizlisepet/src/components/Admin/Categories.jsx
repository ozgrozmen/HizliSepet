import { useState, useEffect } from 'react';
import { Table, Button, Text, Group } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>
          Kategoriler
        </Text>
        <Button>Yeni Kategori Ekle</Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Kategori Adı</Table.Th>
            <Table.Th>Alt Kategori Sayısı</Table.Th>
            <Table.Th>Ürün Sayısı</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((category) => (
            <Table.Tr key={category.id}>
              <Table.Td>{category.name}</Table.Td>
              <Table.Td>{category.subcategories?.length || 0}</Table.Td>
              <Table.Td>{category.product_count || 0}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button variant="light" size="xs" leftSection={<IconEdit size={16} />}>
                    Düzenle
                  </Button>
                  <Button color="red" size="xs" leftSection={<IconTrash size={16} />}>
                    Sil
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
} 