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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
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
        <Loader size={36} />
      </Center>
    );
  }

  return (
    <Container 
      fluid 
      p={0} 
      style={{ 
        minHeight: 'calc(100vh - 180px)',
        backgroundColor: '#f8f9fa'
      }}
    >
      <Container fluid px={{ base: 'md', sm: 'lg', lg: 'xl' }}>
        <Grid 
          gutter={{ base: 'md', sm: 'lg', lg: 'xl' }}
          py={{ base: 'xl', sm: '2xl', lg: '3xl' }}
        >
          {products.map((product) => (
            <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }} style={{ height: '350px' }}>
              <ProductCard product={product} />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </Container>
  );
} 