import { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Grid, Loader, Center, Box, Title, Text, Button, Paper } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';
import { Link } from 'react-router-dom';
import { IconTag, IconShirt, IconDeviceGamepad2, IconApple, IconHome2, IconBabyCarriage, IconShoe, IconBottle } from '@tabler/icons-react';
import { useCart } from '../../context/CartContext';
import '@mantine/carousel/styles.css';
import React from 'react';

// ProductCard'ı memo ile optimize et
const MemoizedProductCard = React.memo(ProductCard);

// Kategori kartı bileşeni
const CategoryCard = React.memo(({ category }) => (
  <Link to={category.link} style={{ textDecoration: 'none' }}>
    <Paper
      p="lg"
      radius="md"
      withBorder
      style={{
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white',
      }}
      sx={(theme) => ({
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows.md,
          backgroundColor: category.color + '10',
        }
      })}
    >
      <Box style={{ color: category.color, marginBottom: '8px' }}>
        {category.icon}
      </Box>
      <Text size="sm" fw={500} ta="center" c="dark">
        {category.name}
      </Text>
    </Paper>
  </Link>
));

CategoryCard.displayName = 'CategoryCard';

// Banner slide bileşeni
const BannerSlide = React.memo(({ banner }) => (
  <Carousel.Slide>
    <Paper
      radius="md"
      style={{
        height: '300px',
        background: `linear-gradient(135deg, ${banner.gradient[0]}, ${banner.gradient[1]})`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white',
          zIndex: 2,
        }}
      >
        <Title order={2} mb="md" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          {banner.title}
        </Title>
        <Text size="lg" mb="xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          {banner.description}
        </Text>
        <Box>
          <Button size="lg" color="white" variant="white" c="dark">
            {banner.buttonText}
          </Button>
        </Box>
      </Box>
    </Paper>
  </Carousel.Slide>
));

BannerSlide.displayName = 'BannerSlide';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Ürünleri sadece ilk yüklemede getir ve cache'le
  const fetchProducts = useCallback(async () => {
      try {
        setLoading(true);
        console.log('Ürünler yükleniyor...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase hatası:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn('Ürün verisi bulunamadı veya boş!');
          setProducts([]);
          return;
        }

        const processedData = data.map(product => ({
          ...product,
          id: product.id,
          name: product.name || 'İsimsiz Ürün',
          price: typeof product.price === 'number' ? product.price : 0,
          image_url: product.image_url || 'https://via.placeholder.com/300x200',
          description: product.description || 'Açıklama bulunmuyor',
          category: product.category || 'Genel'
        }));
        
        console.log('Yüklenen ürünler:', processedData.length);
        setProducts(processedData);
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      setProducts([]);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fiyat formatı - memoize et
  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }, []);

  // Banner verileri
  const banners = useMemo(() => [
    {
      title: 'Yeni Sezon İndirimleri',
      description: 'Tüm kategorilerde %50\'ye varan indirimler',
      buttonText: 'Hemen Keşfet',
      gradient: ['#667eea', '#764ba2']
    },
    {
      title: 'Ücretsiz Kargo',
      description: '150 TL ve üzeri alışverişlerde ücretsiz kargo',
      buttonText: 'Alışverişe Başla',
      gradient: ['#f093fb', '#f5576c']
    },
    {
      title: 'Hızlı Teslimat',
      description: 'Aynı gün kargo imkanı ile hızlı teslimat',
      buttonText: 'Detayları Gör',
      gradient: ['#4facfe', '#00f2fe']
    }
  ], []);

  // Kategoriler - static olduğu için memoize et
  const categories = useMemo(() => [
    { name: 'Elektronik', icon: <IconDeviceGamepad2 size={32} />, color: '#4263EB', link: '/category/elektronik' },
    { name: 'Giyim', icon: <IconShirt size={32} />, color: '#AE3EC9', link: '/category/giyim' },
    { name: 'Ev & Yaşam', icon: <IconHome2 size={32} />, color: '#12B886', link: '/category/ev-yasam' },
    { name: 'Anne & Çocuk', icon: <IconBabyCarriage size={32} />, color: '#FA5252', link: '/category/anne-cocuk' },
    { name: 'Ayakkabı & Çanta', icon: <IconShoe size={32} />, color: '#FD7E14', link: '/category/ayakkabi-canta' },
    { name: 'Kozmetik', icon: <IconBottle size={32} />, color: '#7950F2', link: '/category/kozmetik' },
    { name: 'Süpermarket', icon: <IconApple size={32} />, color: '#20C997', link: '/category/supermarket' },
    { name: 'Tüm Ürünler', icon: <IconTag size={32} />, color: '#4C6EF5', link: '/products' }
  ], []);

  // Öne çıkan ürünler - sadece ilk 12 ürün için memoize et
  const featuredProducts = useMemo(() => products.slice(0, 12), [products]);

  // En çok satan ürünler - randomize edilmiş 8 ürün
  const bestSellingProducts = useMemo(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  }, [products]);

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size={36} />
      </Center>
    );
  }

  return (
    <Box style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container size="xl" py="md">
        {/* Banner Carousel */}
        <Box mb="xl">
          <Carousel
            withIndicators
            loop
            height={300}
            slidesToScroll={1}
            slideGap="md"
            withControls
            controlsOffset="xs"
            controlSize={28}
          >
            {banners.map((banner, index) => (
              <BannerSlide key={index} banner={banner} />
            ))}
          </Carousel>
        </Box>

        {/* Kategoriler */}
        <Box mb="xl">
          <Title order={2} mb="lg" ta="center" c="dark">
            Kategoriler
          </Title>
          <Grid gutter="md">
              {categories.map((category, index) => (
              <Grid.Col key={index} span={{ base: 6, xs: 4, sm: 3, md: 3, lg: 3 }}>
                <CategoryCard category={category} />
              </Grid.Col>
            ))}
          </Grid>
          </Box>

        {/* Öne Çıkan Ürünler */}
        <Box mb="xl">
          <Title order={2} mb="lg" ta="center" c="dark">
            Öne Çıkan Ürünler
          </Title>
          <Grid gutter="md">
            {featuredProducts.map((product) => (
              <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <MemoizedProductCard product={product} />
              </Grid.Col>
            ))}
          </Grid>
          </Box>
          
        {/* En Çok Satanlar */}
        <Box mb="xl">
          <Title order={2} mb="lg" ta="center" c="dark">
            En Çok Satanlar
          </Title>
          <Grid gutter="md">
            {bestSellingProducts.map((product) => (
              <Grid.Col key={`bestseller-${product.id}`} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                <MemoizedProductCard product={product} />
                </Grid.Col>
              ))}
            </Grid>
        </Box>

        {/* Tüm Ürünleri Görüntüle */}
        <Box ta="center" py="xl">
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <Button size="lg" variant="filled">
              Tüm Ürünleri Görüntüle
            </Button>
          </Link>
        </Box>
        </Container>
      </Box>
  );
} 