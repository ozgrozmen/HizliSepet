import { useState, useEffect } from 'react';
import { 
  Table, Button, Text, Group, Badge, Modal, Select, 
  Alert, ActionIcon, Paper, Title, Divider, Container 
} from '@mantine/core';
import { IconShield, IconUser, IconCrown } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      console.log('Kullanıcılar yüklendi:', data?.length);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kullanıcılar yüklenirken hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: `${selectedUser.email} kullanıcısının rolü ${newRole} olarak güncellendi`,
        color: 'green'
      });

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Rol güncellenirken hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <IconCrown size={16} />;
      case 'user':
        return <IconUser size={16} />;
      default:
        return <IconUser size={16} />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'user':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2}>Kullanıcı Yönetimi</Title>
            <Text c="dimmed">
              Toplam {users.length} kullanıcı | 
              Admin: {users.filter(u => u.role === 'admin').length} | 
              User: {users.filter(u => u.role === 'user' || !u.role).length}
            </Text>
          </div>
        </Group>

        <Divider mb="md" />

        <Alert title="Dikkat" color="yellow" mb="md">
          Kullanıcı rollerini değiştirirken dikkatli olun. Admin yetkisi güçlü erişim sağlar.
        </Alert>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>E-posta</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Kayıt Tarihi</Table.Th>
              <Table.Th>Son Giriş</Table.Th>
              <Table.Th>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group gap="xs">
                    {getRoleIcon(user.role)}
                    <Text fw={user.role === 'admin' ? 600 : 400}>
                      {user.email}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge 
                    color={getRoleBadgeColor(user.role)} 
                    variant="light"
                    leftSection={getRoleIcon(user.role)}
                  >
                    {user.role || 'user'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(user.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Table.Td>
                <Table.Td>
                  {user.last_sign_in_at ? (
                    <Text size="sm" c="dimmed">
                      {new Date(user.last_sign_in_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed">Hiç giriş yapmadı</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <ActionIcon 
                    variant="light" 
                    color="blue"
                    onClick={() => openRoleModal(user)}
                    title="Rolü Düzenle"
                  >
                    <IconShield size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Rol Düzenleme Modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title="Kullanıcı Rolü Düzenle"
        size="sm"
      >
        {selectedUser && (
          <div>
            <Text mb="md">
              <strong>{selectedUser.email}</strong> kullanıcısının rolünü değiştirin:
            </Text>
            
            <Select
              label="Yeni Rol"
              placeholder="Rol seçin"
              value={newRole}
              onChange={setNewRole}
              data={[
                { value: 'user', label: 'User (Normal Kullanıcı)' },
                { value: 'admin', label: 'Admin (Yönetici)' }
              ]}
              mb="md"
            />

            {newRole === 'admin' && (
              <Alert color="orange" mb="md">
                <Text size="sm">
                  Bu kullanıcıya admin yetkisi veriyorsunuz. Admin kullanıcılar 
                  tüm sistem özelliklerine erişebilir.
                </Text>
              </Alert>
            )}

            <Group justify="flex-end">
              <Button variant="outline" onClick={closeModal}>
                İptal
              </Button>
              <Button 
                onClick={handleRoleUpdate}
                loading={loading}
                disabled={newRole === selectedUser.role}
              >
                Güncelle
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </Container>
  );
} 