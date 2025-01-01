import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Loader, Center, Text } from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';

export function CategoryPage() {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      
      // Debug için önce tüm ürünleri ve kategorileri görelim
      const { data: allProducts } = await supabase.from('products').select('*');
      console.log('Tüm ürünler:', allProducts);
      
      // Veritabanındaki benzersiz kategori ve alt kategorileri görelim
      const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
      const uniqueSubcategories = [...new Set(allProducts.map(p => p.subcategory))];
      console.log('Veritabanındaki kategoriler:', uniqueCategories);
      console.log('Veritabanındaki alt kategoriler:', uniqueSubcategories);
      
      // URL'den gelen parametreler
      console.log('URL category:', category);
      console.log('URL subcategory:', subcategory);

      let query = supabase.from('products').select('*');

      // Ana kategori için format
      const decodedCategory = decodeURIComponent(category)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (subcategory) {
        // Alt kategori için format
        const decodedSubcategory = decodeURIComponent(subcategory)
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        console.log('Aranacak kategori:', decodedCategory);
        console.log('Aranacak alt kategori:', decodedSubcategory);

        // Veritabanındaki eşleşen alt kategoriyi bulalım
        const matchingSubcategory = uniqueSubcategories.find(
          sub => sub && sub.toLowerCase() === decodedSubcategory.toLowerCase()
        );

        if (matchingSubcategory) {
          console.log('Veritabanında bulunan eşleşen alt kategori:', matchingSubcategory);
          
          // Alt kategori araması - case sensitive olmayan arama
          const { data, error } = await query
            .ilike('category', decodedCategory)
            .ilike('subcategory', matchingSubcategory);

          if (error) {
            console.error('Alt kategori aramasında hata:', error);
          } else {
            console.log('Alt kategori sonuçları:', data);
            setProducts(data || []);
          }
        } else {
          console.log('Veritabanında eşleşen alt kategori bulunamadı');
          setProducts([]);
        }
      } else {
        // Ana kategori araması - case sensitive olmayan arama
        const { data, error } = await query
          .ilike('category', decodedCategory);

        if (error) {
          console.error('Ana kategori aramasında hata:', error);
        } else {
          console.log('Ana kategori sonuçları:', data);
          setProducts(data || []);
        }
      }
      
      setLoading(false);
    }

    fetchProducts();
  }, [category, subcategory]);

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size={36} />
      </Center>
    );
  }

  const decodedCategory = decodeURIComponent(category)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const decodedSubcategory = subcategory
    ? decodeURIComponent(subcategory)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : null;

  return (
    <Container size="xl" py="xl">
      <Text size="xl" weight={700} mb="xl">
        {decodedSubcategory || decodedCategory}
      </Text>
      
      {products.length === 0 ? (
        <Center style={{ height: '200px' }}>
          <Text size="lg" color="dimmed">
            Bu kategoride henüz ürün bulunmuyor.
          </Text>
        </Center>
      ) : (
        <Grid>
          {products.map((product) => (
            <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
} 