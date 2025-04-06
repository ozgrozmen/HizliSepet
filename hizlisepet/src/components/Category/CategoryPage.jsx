import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Loader, Center, Text } from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';

// Kategori adını veritabanındaki formata dönüştüren yardımcı fonksiyon
function formatCategoryName(category) {
  const specialCategories = {
    'Ayakkabı & Çanta': 'Ayakkabı & Çanta',
    'Ev & Yaşam': 'Ev & Yaşam',
    'Anne & Çocuk': 'Anne & Çocuk',
    'Süpermarket': 'Süpermarket',
    'İndirimli Ürünler': 'İndirimli Ürünler',
    'Elektronik': 'Elektronik',
    'Giyim': 'Giyim',
    'Kozmetik': 'Kozmetik'
  };

  // URL'den gelen kategori adını decode et
  const decodedCategory = decodeURIComponent(category);
  
  // Özel kategori adı varsa onu kullan
  if (specialCategories[decodedCategory]) {
    return specialCategories[decodedCategory];
  }

  // Yoksa normal formatlama yap
  return decodedCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function CategoryPage() {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        console.log('URL category:', category);
        console.log('URL subcategory:', subcategory);

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
            setError(error.message);
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
            setError(error.message);
            setProducts([]);
          } else {
            console.log('Ana kategori sonuçları:', data);
            setProducts(data || []);
          }
        }
      } catch (err) {
        console.error('Beklenmeyen bir hata oluştu:', err);
        setError('Ürünler yüklenirken bir hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
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

  if (error) {
    return (
      <Center style={{ height: '60vh' }}>
        <Text color="red" size="lg">{error}</Text>
      </Center>
    );
  }

  const formattedCategory = formatCategoryName(category);
  const formattedSubcategory = subcategory ? formatCategoryName(subcategory) : null;

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