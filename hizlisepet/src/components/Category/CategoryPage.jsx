import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Loader, Center, Text, Title, Breadcrumbs, Anchor, Group, Badge, Select } from '@mantine/core';
import { IconHome, IconChevronRight } from '@tabler/icons-react';
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

  const decodedCategory = decodeURIComponent(category);
  return specialCategories[decodedCategory] || decodedCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function CategoryPage() {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const formattedCategory = formatCategoryName(category);
        let query = supabase.from('products').select('*');

        if (subcategory) {
          const formattedSubcategory = formatCategoryName(subcategory);
          const { data, error } = await query
            .ilike('category', formattedCategory)
            .ilike('subcategory', formattedSubcategory);

          if (error) {
            setError(error.message);
            setProducts([]);
          } else {
            setProducts(data || []);
          }
        } else {
          const { data, error } = await query
            .ilike('category', formattedCategory);

          if (error) {
            setError(error.message);
            setProducts([]);
          } else {
            setProducts(data || []);
          }
        }
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, subcategory]);

  const sortProducts = (products) => {
    const sortedProducts = [...products];
    switch (sortBy) {
      case 'price-asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'name-asc':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sortedProducts;
    }
  };

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

  const breadcrumbItems = [
    { title: 'Ana Sayfa', href: '/', icon: <IconHome size={16} /> },
    { title: formattedCategory, href: `/category/${category}` },
    ...(subcategory ? [{ title: formattedSubcategory, href: `/category/${category}/${subcategory}` }] : [])
  ];

  const sortOptions = [
    { value: 'newest', label: 'En Yeniler' },
    { value: 'price-asc', label: 'Fiyat (Düşükten Yükseğe)' },
    { value: 'price-desc', label: 'Fiyat (Yüksekten Düşüğe)' },
    { value: 'name-asc', label: 'İsme Göre (A-Z)' }
  ];

  return (
    <div style={{ width: '100%', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{
        width: '100%',
        backgroundColor: 'white',
        padding: '2rem 0',
        marginBottom: '2rem',
        borderBottom: '1px solid #e9ecef'
      }}>
        <Container size="xl">
          <Breadcrumbs
            separator={<IconChevronRight size={16} />}
            mb="xl"
          >
            {breadcrumbItems.map((item, index) => (
              <Anchor
                key={index}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {item.icon}
                {item.title}
              </Anchor>
            ))}
          </Breadcrumbs>

          <Title order={1} size="h2" weight={700}>
            {formattedSubcategory || formattedCategory}
          </Title>
          
          <Group position="apart" mt="md">
            <Badge size="lg" variant="light">
              {products.length} Ürün
            </Badge>
            <Select
              value={sortBy}
              onChange={setSortBy}
              data={sortOptions}
              style={{ width: '250px' }}
              placeholder="Sıralama"
            />
          </Group>
        </Container>
      </div>

      {products.length === 0 ? (
        <Center style={{ height: '200px' }}>
          <Text size="lg" color="dimmed">
            Bu kategoride henüz ürün bulunmuyor.
          </Text>
        </Center>
      ) : (
        <Container size="xl" pb="xl">
          <Grid gutter="xl">
            {sortProducts(products).map((product) => (
              <Grid.Col
                key={product.id}
                span={{ base: 12, xs: 6, sm: 4, md: 3 }}
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