import { useEffect, useState } from 'react';
import { Grid, Card, Text, Group } from '@mantine/core';
import { IconPackage, IconUsers, IconShoppingCart, IconCoin } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

function StatsCard({ title, value, icon: Icon }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="center">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
        </div>
        <Icon size={32} stroke={1.5} />
      </Group>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Ürün sayısı
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact' });

        // Kullanıcı sayısı
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        setStats({
          totalProducts: productsCount || 0,
          totalUsers: usersCount || 0,
          totalOrders: 0, // Şimdilik 0
          totalRevenue: 0 // Şimdilik 0
        });
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Text size="xl" fw={700} mb="xl">
        Dashboard
      </Text>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Toplam Ürün"
            value={stats.totalProducts}
            icon={IconPackage}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            icon={IconUsers}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Toplam Sipariş"
            value={stats.totalOrders}
            icon={IconShoppingCart}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Toplam Gelir"
            value={`${stats.totalRevenue.toFixed(2)} TL`}
            icon={IconCoin}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
} 