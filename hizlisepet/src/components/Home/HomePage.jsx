import { useEffect, useState } from 'react';
import { Container, Grid, Loader, Center } from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('Ürünler yükleniyor...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(12);

        console.log('Supabase yanıtı:', { data, error });

        if (error) {
          console.error('Ürünler yüklenirken hata:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.log('Hiç ürün bulunamadı');
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  console.log('Render edilen ürünler:', products);

  return (
    <Container size="xl" py="xl">
      <Grid>
        {products.map((product) => (
          <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
            <ProductCard product={product} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
} 