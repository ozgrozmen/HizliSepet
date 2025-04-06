import { useEffect, useState } from 'react';
import { Container, Grid, Loader, Center, Box, Image, Title, Text, Group, Badge, Card, Button, Overlay, RingProgress } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { supabase } from '../../lib/supabase';
import { ProductCard } from '../Product/ProductCard';
import { Link } from 'react-router-dom';
import { IconShoppingCart, IconTag, IconShirt, IconDeviceGamepad2, IconApple, IconHome2, IconBabyCarriage, IconShoe, IconBottle } from '@tabler/icons-react';
import { useCart } from '../../context/CartContext';
import '@mantine/carousel/styles.css';

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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

  // Görsel banner öğeleri - Birbirinden tamamen farklı görsellerle güncellendi
  const bannerItems = [
    {
      image: 'https://images.pexels.com/photos/6214126/pexels-photo-6214126.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Yeni Sezon Moda',
      description: 'Bu sezonun en trend giyim koleksiyonları burada',
      buttonText: 'Koleksiyonu Keşfet',
      link: '/category/Giyim'
    },
    {
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Teknoloji Dünyası',
      description: 'En son elektronik ürünler ve akıllı cihazlar',
      buttonText: 'Teknolojiye Göz At',
      link: '/category/Elektronik'
    },
    {
      image: 'https://images.pexels.com/photos/2659939/pexels-photo-2659939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Ev Dekorasyon Fırsatları',
      description: 'Eviniz için şık ve modern dekorasyon ürünleri',
      buttonText: 'Fırsatları Yakala',
      link: '/category/Ev & Yaşam'
    },
    {
      image: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Kozmetik & Bakım',
      description: 'Güzellik ve kişisel bakım ürünlerinde büyük indirimler',
      buttonText: 'İndirimleri Keşfet',
      link: '/category/Kozmetik'
    },
    {
      image: 'https://images.pexels.com/photos/5632428/pexels-photo-5632428.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Sezon Sonu Fırsatlar',
      description: '%70\'e varan sezon sonu indirimleri kaçırmayın',
      buttonText: 'Hemen İncele',
      link: '/category/İndirimli Ürünler'
    }
  ];

  // Kategoriler için carousel verileri
  const categories = [
    { name: 'Elektronik', icon: <IconDeviceGamepad2 size={40} />, color: '#4263EB', link: '/category/Elektronik' },
    { name: 'Giyim', icon: <IconShirt size={40} />, color: '#AE3EC9', link: '/category/Giyim' },
    { name: 'Ev & Yaşam', icon: <IconHome2 size={40} />, color: '#12B886', link: '/category/Ev & Yaşam' },
    { name: 'Anne & Çocuk', icon: <IconBabyCarriage size={40} />, color: '#FA5252', link: '/category/Anne & Çocuk' },
    { name: 'Ayakkabı & Çanta', icon: <IconShoe size={40} />, color: '#FD7E14', link: '/category/Ayakkabı & Çanta' },
    { name: 'Kozmetik', icon: <IconBottle size={40} />, color: '#7950F2', link: '/category/Kozmetik' },
    { name: 'Süpermarket', icon: <IconApple size={40} />, color: '#20C997', link: '/category/Süpermarket' },
    { name: 'Tüm Ürünler', icon: <IconTag size={40} />, color: '#4C6EF5', link: '/products' }
  ];

  // Fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  if (loading) {
    return (
      <Center style={{ height: '60vh' }}>
        <Loader size={36} />
      </Center>
    );
  }

  return (
    <Container fluid p={0} style={{ width: '100%', backgroundColor: '#f8f9fa' }}>
      <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Container size="xl" style={{ maxWidth: '1200px', padding: '24px 16px' }}>
          {/* Ana Banner Slider - Görsellerle */}
          <Carousel
            withIndicators
            height={500}
            slideSize="100%"
            slideGap="md"
            loop
            withControls
            controlsOffset="xs"
            controlSize={32}
            mb={40}
            style={{ marginBottom: '40px', overflow: 'hidden', borderRadius: '8px' }}
          >
            {bannerItems.map((item, index) => (
              <Carousel.Slide key={index}>
                <Box
                  style={{
                    height: '500px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                  }}
                >
                  {/* Image bileşenini backgroundImage yerine kullanıyoruz */}
                  <Image 
                    src={item.image}
                    height={500}
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                  <Overlay
                    gradient="linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)"
                    opacity={0.7}
                    zIndex={1}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      padding: '40px',
                      zIndex: 2,
                      color: 'white',
                      textAlign: 'left',
                    }}
                  >
                    <Title order={1} style={{ fontSize: '42px', marginBottom: '16px', textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>{item.title}</Title>
                    <Text size="xl" mb={24} style={{ maxWidth: '600px', textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>{item.description}</Text>
                    <Button 
                      size="lg" 
                      radius="md"
                      component={Link}
                      to={item.link}
                      variant="filled"
                      color="blue"
                    >
                      {item.buttonText}
                    </Button>
                  </Box>
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>

          {/* Kategoriler Carousel */}
          <Box mb={40}>
            <Title order={2} mb={20}>Popüler Kategoriler</Title>
            <Carousel
              slideSize={{ base: '50%', sm: '33.333%', md: '25%', lg: '20%' }}
              slideGap={{ base: 'sm', sm: 'md' }}
              align="start"
              slidesToScroll={1}
              withControls
              loop
            >
              {categories.map((category, index) => (
                <Carousel.Slide key={index}>
                  <Link to={category.link} style={{ textDecoration: 'none' }}>
                    <Card 
                      shadow="sm" 
                      p="lg" 
                      radius="md" 
                      withBorder 
                      style={{ 
                        textAlign: 'center', 
                        height: '160px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      sx={(theme) => ({
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows.md
                        }
                      })}
                    >
                      <Center>
                        <RingProgress
                          size={80}
                          thickness={4}
                          roundCaps
                          sections={[{ value: 100, color: category.color }]}
                          label={
                            <Center>{category.icon}</Center>
                          }
                        />
                      </Center>
                      <Text weight={500} mt={10}>{category.name}</Text>
                    </Card>
                  </Link>
                </Carousel.Slide>
              ))}
            </Carousel>
          </Box>

          {/* Öne Çıkan Ürünler Bölümü */}
          <Box mb={30}>
            <Title order={2} mb={20}>Öne Çıkan Ürünler</Title>
            <Carousel
              slideSize={{ base: '100%', sm: '50%', md: '33.333%', lg: '25%' }}
              slideGap={{ base: 0, sm: 'md' }}
              align="start"
              slidesToScroll={1}
              withControls
              loop
            >
              {products.slice(0, 10).map((product) => (
                <Carousel.Slide key={product.id}>
                  <Card shadow="sm" p="lg" radius="md" withBorder m={5} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card.Section>
                      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                        <Image
                          src={product.image_url || 'https://via.placeholder.com/300x200'}
                          height={200}
                          alt={product.name}
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>
                    </Card.Section>

                    <Box p="xs" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Group position="apart" mt="md" mb="xs">
                        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Text weight={500} lineClamp={1}>{product.name}</Text>
                        </Link>
                        <Badge color="blue" variant="light">
                          {product.category}
                        </Badge>
                      </Group>

                      <Group position="apart" style={{ marginTop: 'auto' }}>
                        <Text weight={600} size="lg" color="blue">
                          {formatPrice(product.price)}
                        </Text>
                        <Button 
                          size="xs" 
                          radius="md" 
                          leftIcon={<IconShoppingCart size={16} />}
                          onClick={() => {
                            addToCart(product);
                          }}
                        >
                          Sepete Ekle
                        </Button>
                      </Group>
                    </Box>
                  </Card>
                </Carousel.Slide>
              ))}
            </Carousel>
          </Box>
          
          {/* Tüm Ürünler Grid */}
          <div style={{ padding: '1rem 0' }}>
            <Title order={2} mb={20}>Tüm Ürünler</Title>
            <Grid gutter={50}>
              {products.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }} pb="xl">
                  <ProductCard product={product} />
                </Grid.Col>
              ))}
            </Grid>
          </div>
        </Container>
      </Box>
    </Container>
  );
} 