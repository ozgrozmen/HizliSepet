import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Text, Grid, Center, Loader } from '@mantine/core';
import { searchProducts } from '../lib/supabase';
import { ProductCard } from '../components/Product/ProductCard';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    async function performSearch() {
      if (!searchQuery) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await searchProducts(searchQuery);
        setProducts(results);
      } catch (err) {
        console.error('Arama hatası:', err);
        setError('Arama sırasında bir hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [searchQuery]);

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size={36} />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ height: '60vh' }}>
        <Text color="red" size="lg">{error}</Text>
      </Center>
    );
  }

  return (
    <div style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
      <div style={{
        width: '100%',
        backgroundColor: 'white',
        padding: '2rem 0',
        marginBottom: '2rem',
        borderBottom: '1px solid #e9ecef'
      }}>
        <Text size="xl" weight={700} ta="center">
          "{searchQuery}" için arama sonuçları
        </Text>
        <Text size="sm" color="dimmed" ta="center" mt={8}>
          {products.length} ürün bulundu
        </Text>
      </div>

      {products.length === 0 ? (
        <Center style={{ height: '200px' }}>
          <Text size="lg" color="dimmed">
            Aramanızla eşleşen ürün bulunamadı.
          </Text>
        </Center>
      ) : (
        <Container fluid style={{ maxWidth: '100%', padding: '0 40px', marginBottom: '40px' }}>
          <Grid
            gutter={50}
            style={{
              margin: 0,
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            {products.map((product) => (
              <Grid.Col
                key={product.id}
                span={{ base: 12, xs: 6, sm: 4, md: 3 }}
                style={{
                  padding: '10px'
                }}
              >
                <ProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      )}
    </div>
  );
} 