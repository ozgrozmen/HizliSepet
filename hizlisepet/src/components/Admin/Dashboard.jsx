import { useState, useEffect } from 'react';
import { Box, Title, Grid, Card, Text, Loader, Alert, Stack } from '@mantine/core';
import { IconPackage, IconCategory, IconUsers, IconShoppingCart } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Bu sayfaya erişim yetkiniz yok.');
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, usersRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('categories').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' })
        ]);

        setStats({
          products: productsRes.count || 0,
          categories: categoriesRes.count || 0,
          users: usersRes.count || 0,
          orders: 0 // Sipariş tablosu henüz yok
        });
      } catch (err) {
        console.error('İstatistik yükleme hatası:', err);
        setError('İstatistikler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Dashboard yükleniyor...</Text>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Hata">
        {error}
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.products,
      icon: IconPackage,
      color: 'blue'
    },
    {
      title: 'Kategoriler',
      value: stats.categories,
      icon: IconCategory,
      color: 'green'
    },
    {
      title: 'Kullanıcılar',
      value: stats.users,
      icon: IconUsers,
      color: 'orange'
    },
    {
      title: 'Siparişler',
      value: stats.orders,
      icon: IconShoppingCart,
      color: 'red'
    }
  ];

  return (
    <Box>
      <Title order={1} mb="xl">Admin Dashboard</Title>
      
      <Grid>
        {statCards.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Text size="sm" c="dimmed">{stat.title}</Text>
                  <Text size="xl" fw={700}>{stat.value}</Text>
                </Box>
                <stat.icon size={40} color={`var(--mantine-color-${stat.color}-6)`} />
              </Box>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Box>
  );
} 