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
  Modal,
  Card,
  Loader,
  Select
} from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('Kullanıcılar getiriliyor...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        throw error;
      }

      console.log('Alınan kullanıcı verileri:', data);

      // Eğer role sütunu yoksa varsayılan değer ata
      const usersWithRole = data.map(user => ({
        ...user,
        role: user.role || 'user'
      }));

      console.log('Role ile güncellenen kullanıcılar:', usersWithRole);
      setUsers(usersWithRole || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kullanıcılar yüklenirken bir sorun oluştu.',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    console.log('Düzenlenecek kullanıcı:', user);
    setSelectedUser(user);
    setEditForm({
      role: user.role || 'user'
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      console.log('Güncelleniyor...', selectedUser.id, editForm.role);
      
      // profiles tablosunu güncelle
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: editForm.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id)
        .select();

      if (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        throw error;
      }

      console.log('Güncelleme sonucu:', data);

      notifications.show({
        title: 'Başarılı',
        message: 'Kullanıcı rolü başarıyla güncellendi.',
        color: 'green'
      });

      setEditModalOpen(false);
      setSelectedUser(null);
      
      // Kullanıcı listesini yenile
      await fetchUsers();
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: `Kullanıcı güncellenirken bir sorun oluştu: ${error.message}`,
        color: 'red'
      });
    }
  };

  const handleDelete = async (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      console.log('Silinecek kullanıcı:', selectedUser.id);
      
      const { error: dbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (dbError) {
        console.error('Kullanıcı veritabanından silinirken hata:', dbError);
        throw dbError;
      }

      notifications.show({
        title: 'Başarılı',
        message: 'Kullanıcı başarıyla silindi.',
        color: 'green'
      });

      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: `Kullanıcı silinirken bir sorun oluştu: ${error.message}`,
        color: 'red'
      });
    }
  };

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>{user.email}</Table.Td>
      <Table.Td>
        <Badge color={user.role === 'admin' ? 'blue' : 'gray'}>
          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
        </Badge>
      </Table.Td>
      <Table.Td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="filled"
            color="blue"
            onClick={() => handleEdit(user)}
            title="Düzenle"
            radius="xl"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="filled"
            color="red"
            onClick={() => handleDelete(user)}
            title="Sil"
            radius="xl"
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
        <Title order={2}>Kullanıcı Yönetimi</Title>
      </Group>

      {loading ? (
        <Group position="center" style={{ minHeight: '200px' }} align="center">
          <Stack align="center">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Kullanıcılar yükleniyor...</Text>
          </Stack>
        </Group>
      ) : users.length === 0 ? (
        <Card p="xl" withBorder shadow="sm" radius="md">
          <Stack align="center" spacing="md">
            <Text size="lg" fw={500} ta="center">Henüz kullanıcı bulunmuyor</Text>
          </Stack>
        </Card>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>E-posta</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Kayıt Tarihi</Table.Th>
              <Table.Th>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}

      {/* Düzenleme Modalı */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Kullanıcı Düzenle"
        size="md"
      >
        <Stack>
          <Text size="sm" fw={500}>E-posta: {selectedUser?.email}</Text>
          
          <Select
            label="Kullanıcı Rolü"
            value={editForm.role}
            onChange={(value) => setEditForm({ role: value })}
            data={[
              { value: 'user', label: 'Kullanıcı' },
              { value: 'admin', label: 'Admin' }
            ]}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              İptal
            </Button>
            <Button color="blue" onClick={handleUpdate}>
              Güncelle
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Silme Modalı */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Kullanıcı Sil"
        size="md"
      >
        <Stack>
          <Text>
            {selectedUser?.email} adlı kullanıcıyı silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setDeleteModalOpen(false)}>
              İptal
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Sil
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 