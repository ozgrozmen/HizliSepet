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
  Stack
} from '@mantine/core';
import { ProductCard } from '../Product/ProductCard';
import { useFavorite } from '../../context/FavoriteContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { IconMoodSad } from '@tabler/icons-react';

export function FavoritesPage() {
  const { favorites } = useFavorite();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchFavoriteProducts();
  }, [user, favorites]);

  const fetchFavoriteProducts = async () => {
    if (!favorites || favorites.length === 0) {
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', favorites);

    if (error) {
      console.error('Favori ürünler çekilirken hata:', error);
      setLoading(false);
      return;
    }

    setFavoriteProducts(data);
    setLoading(false);
  };

  if (!user) {
    return null; // Kullanıcı girişi yoksa hiçbir şey gösterme (nasılsa navigate çalışacak)
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