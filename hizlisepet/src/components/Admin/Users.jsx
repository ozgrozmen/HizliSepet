import { useState, useEffect } from 'react';
import { Table, Button, Text, Group, Badge } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>
          Kullanıcılar
        </Text>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>E-posta</Table.Th>
            <Table.Th>Rol</Table.Th>
            <Table.Th>Kayıt Tarihi</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{user.email}</Table.Td>
              <Table.Td>
                <Badge color={user.role === 'admin' ? 'blue' : 'gray'}>
                  {user.role || 'user'}
                </Badge>
              </Table.Td>
              <Table.Td>
                {new Date(user.created_at).toLocaleDateString('tr-TR')}
              </Table.Td>
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