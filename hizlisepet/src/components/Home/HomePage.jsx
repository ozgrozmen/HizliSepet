import { useEffect, useState } from 'react';
import { Container, Grid, Title, Loader, Center, Tabs } from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';

export function HomePage() {
  const [products, setProducts] = useState({
    featured: [],
    newArrivals: [],
    bestSellers: [],
    loading: true
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        // En çok indirimli ürünler
        const { data: featuredData } = await supabase
          .from('products')
          .select('*')
          .order('discount_rate', { ascending: false })
          .limit(8);

        // En yeni ürünler
        const { data: newArrivalsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        // En çok satanlar (rating'e göre sıralı)
        const { data: bestSellersData } = await supabase
          .from('products')
          .select('*')
          .order('rating', { ascending: false })
          .limit(8);

        setProducts({
          featured: featuredData || [],
          newArrivals: newArrivalsData || [],
          bestSellers: bestSellersData || [],
          loading: false
        });
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
        setProducts(prev => ({ ...prev, loading: false }));
      }
    }

    fetchProducts();
  }, []);

  if (products.loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Tabs defaultValue="featured">
        <Tabs.List mb="xl">
          <Tabs.Tab value="featured">Öne Çıkanlar</Tabs.Tab>
          <Tabs.Tab value="newArrivals">Yeni Gelenler</Tabs.Tab>
          <Tabs.Tab value="bestSellers">En Çok Satanlar</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="featured">
          <Grid>
            {products.featured.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <ProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="newArrivals">
          <Grid>
            {products.newArrivals.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <ProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="bestSellers">
          <Grid>
            {products.bestSellers.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <ProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 