import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Paper, 
  Group, 
  Button, 
  Loader, 
  Center,
  Stack,
  Alert
} from '@mantine/core';
import { ProductCard } from '../Product/ProductCard';
import { useFavorite } from '../../context/FavoriteContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { IconMoodSad, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';

export function FavoritesPage() {
  const { favorites } = useFavorite();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) {
      console.log('Oturum yükleniyor, bekliyor...');
      return;
    }

    if (!user) {
      console.log('Kullanıcı giriş yapmamış, yönlendiriliyor...');
      navigate('/login', { state: { returnUrl: '/favorites' } });
      return;
    }

    console.log('Kullanıcı giriş yapmış:', user.email);
    console.log('Favoriler:', favorites);
    
    fetchFavoriteProducts();
  }, [user, favorites, authLoading, navigate]);

  const fetchFavoriteProducts = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      if (!favorites || favorites.length === 0) {
        console.log('Favori ürün bulunmuyor');
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Favori ürünler getiriliyor:', favorites);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites);

      if (error) {
        console.error('Favori ürünler çekilirken hata:', error.message);
        setError(`Favoriler yüklenirken hata oluştu: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log('Favori ürünler yüklendi:', data?.length || 0);
      setFavoriteProducts(data || []);
      setLoading(false);
    } catch (err) {
      console.error('Beklenmeyen bir hata oluştu:', err.message);
      setError(`Beklenmeyen bir hata oluştu: ${err.message}`);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '60vh' }}>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text>Oturum kontrol ediliyor...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Giriş gerekli" 
          color="blue"
        >
          Bu sayfayı görüntülemek için giriş yapmanız gerekiyor. Giriş sayfasına yönlendiriliyorsunuz...
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '60vh' }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Bir hata oluştu" 
          color="red"
        >
          {error}
        </Alert>
        <Button 
          onClick={() => {
            setError(null);
            fetchFavoriteProducts();
          }}
          mt="md"
        >
          Tekrar Dene
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">Favorilerim</Title>
      
      {favoriteProducts.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" spacing="md" py="xl">
            <IconMoodSad size={60} stroke={1.5} color="#868e96" />
            <Text size="xl" fw={500} ta="center">Favori ürününüz bulunmuyor</Text>
            <Text c="dimmed" ta="center">
              Favori ürünlerinizi burada görüntüleyebilirsiniz. Ürün sayfalarındaki kalp ikonuna tıklayarak ürünleri favorilerinize ekleyebilirsiniz.
            </Text>
            <Button 
              variant="filled" 
              size="md" 
              mt="md"
              onClick={() => navigate('/')}
            >
              Alışverişe Başla
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Grid>
          {favoriteProducts.map((product) => (
            <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
} 