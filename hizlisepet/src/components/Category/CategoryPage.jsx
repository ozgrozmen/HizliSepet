import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Loader, Center, Text } from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';

// Kategori adını veritabanındaki formata dönüştüren yardımcı fonksiyon
function formatCategoryName(category) {
  const specialCategories = {
    'ayakkabı-çanta': 'Ayakkabı & Çanta',
    'spor-outdoor': 'Spor & Outdoor',
    'anne-çocuk': 'Anne & Çocuk',
    'ev-mobilya': 'Ev & Mobilya',
    'anne-ve-çocuk': 'Anne & Çocuk'  // URL'deki alternatif format
  };

  // Özel kategori adı varsa onu kullan
  if (specialCategories[category]) {
    return specialCategories[category];
  }

  // Yoksa normal formatlama yap
  return decodeURIComponent(category)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function CategoryPage() {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      
      // Önce tüm ürünleri çekelim ve bakalım
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('*');
      
      console.log('URL category:', category);
      console.log('URL subcategory:', subcategory);
      console.log('Tüm ürünler:', allProducts);
      console.log('Veritabanındaki kategoriler:', [...new Set(allProducts?.map(p => p.category))]);
      console.log('Veritabanındaki alt kategoriler:', [...new Set(allProducts?.map(p => p.subcategory))]);

      // URL'den gelen kategori adını düzenleme
      const formattedCategory = formatCategoryName(category);
      console.log('Aranacak kategori:', formattedCategory);

      let query = supabase.from('products').select('*');

      if (subcategory) {
        // Alt kategori için format
        const formattedSubcategory = formatCategoryName(subcategory);
        console.log('Aranacak alt kategori:', formattedSubcategory);

        // Alt kategori araması - case insensitive
        const { data, error } = await query
          .ilike('category', formattedCategory)
          .ilike('subcategory', formattedSubcategory);

        if (error) {
          console.error('Alt kategori aramasında hata:', error);
          setProducts([]);
        } else {
          console.log('Alt kategori sonuçları:', data);
          setProducts(data || []);
        }
      } else {
        // Ana kategori araması - case insensitive
        const { data, error } = await query
          .ilike('category', formattedCategory);

        if (error) {
          console.error('Ana kategori aramasında hata:', error);
          setProducts([]);
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

  const formattedCategory = formatCategoryName(category);
  const formattedSubcategory = subcategory ? formatCategoryName(subcategory) : null;

  return (
    <Container 
      fluid 
      p={0} 
      style={{ 
        minHeight: 'calc(100vh - 180px)',
        backgroundColor: '#f8f9fa'
      }}
    >
      <div style={{ 
        width: '100%', 
        backgroundColor: 'white', 
        padding: '2rem 0',
        marginBottom: '2rem',
        borderBottom: '1px solid #e9ecef'
      }}>
        <Text size="xl" weight={700} ta="center">
          {formattedSubcategory || formattedCategory}
        </Text>
      </div>
      
      {products.length === 0 ? (
        <Center style={{ height: '200px' }}>
          <Text size="lg" color="dimmed">
            Bu kategoride henüz ürün bulunmuyor.
          </Text>
        </Center>
      ) : (
        <Container fluid px={{ base: 'md', sm: 'lg', lg: 'xl' }}>
          <Grid 
            gutter={{ base: 'md', sm: 'lg', lg: 'xl' }}
          >
            {products.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }} style={{ height: '350px' }}>
                <ProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      )}
    </Container>
  );
} 