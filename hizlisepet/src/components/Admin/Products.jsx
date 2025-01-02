import { useState, useEffect } from 'react';
import { Table, Button, Text, Group } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  return (
    <div style={{ padding: '20px' }}>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>
          Ürünler
        </Text>
        <Button>Yeni Ürün Ekle</Button>
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