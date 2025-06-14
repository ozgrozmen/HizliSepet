import React, { useState, useEffect } from 'react';
import { Container, Text, Box, Image, Title, Group, Badge, Card, Button, Paper, Overlay, Center, RingProgress } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IconShoppingCart, IconTag, IconShirt, IconDeviceGamepad2, IconApple, IconHome2, IconBabyCarriage, IconShoe, IconBottle } from '@tabler/icons-react';
import { useCart } from '../context/CartContext';

// Banner görselleri import'unu kaldırıyoruz çünkü dosyalar mevcut değil
// import banner1 from '../assets/banner1.jpg';
// import banner2 from '../assets/banner2.jpg';
// import banner3 from '../assets/banner3.jpg';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Ürün yükleme hatası:', error);
        throw error;
      }
      
      // Verileri kontrol et ve boş değerleri varsayılan değerlerle değiştir
      const processedData = (data || []).map(product => ({
        ...product,
        name: product.name || 'İsimsiz Ürün',
        price: product.price || 0,
        image_url: product.image_url || 'https://via.placeholder.com/300x200',
        description: product.description || 'Açıklama bulunmuyor'
      }));
      
      setFeaturedProducts(processedData);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setFeaturedProducts([]); // Hata durumunda boş dizi ata
    } finally {
      setLoading(false);
    }
  };

  // Görsel banner öğeleri
  const bannerItems = [
    {
      image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Yeni Sezon Ürünleri',
      description: 'En yeni ve en trend ürünleri keşfedin',
      buttonText: 'Alışverişe Başla',
      link: '/products'
    },
    {
      image: 'https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'Süper Fırsatlar',
      description: 'Kaçırılmayacak indirimler ve kampanyalar',
      buttonText: 'Fırsatları Gör',
      link: '/products?discount=true'
    },
    {
      image: 'https://images.pexels.com/photos/5632361/pexels-photo-5632361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      title: 'İndirimli Ürünler',
      description: 'Sezon sonu indirimleri başladı',
      buttonText: 'İndirimleri Keşfet',
      link: '/products?sale=true'
    }
  ];

  // Kategoriler için carousel verileri
  const categories = [
    { name: 'Elektronik', icon: <IconDeviceGamepad2 size={40} />, color: '#4263EB', link: '/products?category=Elektronik' },
    { name: 'Giyim', icon: <IconShirt size={40} />, color: '#AE3EC9', link: '/products?category=Giyim' },
    { name: 'Ev & Yaşam', icon: <IconHome2 size={40} />, color: '#12B886', link: '/products?category=Ev+%26+Ya%C5%9Fam' },
    { name: 'Anne & Çocuk', icon: <IconBabyCarriage size={40} />, color: '#FA5252', link: '/products?category=Anne+%26+%C3%87ocuk' },
    { name: 'Ayakkabı & Çanta', icon: <IconShoe size={40} />, color: '#FD7E14', link: '/products?category=Ayakkab%C4%B1+%26+%C3%87anta' },
    { name: 'Kozmetik', icon: <IconBottle size={40} />, color: '#7950F2', link: '/products?category=Kozmetik' },
    { name: 'Süpermarket', icon: <IconApple size={40} />, color: '#20C997', link: '/products?category=S%C3%BCpermarket' },
    { name: 'Tüm Ürünler', icon: <IconTag size={40} />, color: '#4C6EF5', link: '/products' }
  ];

  // Fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  return (
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
                      cursor: 'pointer',
                      ':hover': { transform: 'translateY(-5px)' }
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
          
          {loading ? (
            <Center>
              <Text>Ürünler yükleniyor...</Text>
            </Center>
          ) : featuredProducts.length === 0 ? (
            <Center>
              <Text>Henüz ürün bulunmuyor.</Text>
            </Center>
          ) : (
            <Carousel
              slideSize={{ base: '100%', sm: '50%', md: '33.333%', lg: '25%' }}
              slideGap={{ base: 0, sm: 'md' }}
              align="start"
              slidesToScroll={1}
              withControls
              loop
            >
              {featuredProducts.map((product) => (
                <Carousel.Slide key={product.id}>
                  <Card shadow="sm" p="lg" radius="md" withBorder m={5} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card.Section>
                      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                        <Image
                          src={product.image_url}
                          height={200}
                          alt={product.name}
                          style={{ objectFit: 'cover' }}
                          withPlaceholder
                        />
                      </Link>
                    </Card.Section>

                    <Box p="xs" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Group position="apart" mt="md" mb="xs">
                        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Text weight={500} lineClamp={2} style={{ minHeight: '3em' }}>
                            {product.name}
                          </Text>
                        </Link>
                        <Badge color="blue" variant="light">
                          {formatPrice(product.price)}
                        </Badge>
                      </Group>

                      <Text size="sm" color="dimmed" lineClamp={2} style={{ flex: 1 }}>
                        {product.description}
                      </Text>

                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="md"
                        radius="md"
                        leftSection={<IconShoppingCart size={16} />}
                        onClick={() => addToCart(product)}
                      >
                        Sepete Ekle
                      </Button>
                    </Box>
                  </Card>
                </Carousel.Slide>
              ))}
            </Carousel>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 