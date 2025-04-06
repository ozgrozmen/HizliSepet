import { Carousel as MantineCarousel } from '@mantine/carousel';
import { Paper, Text, Title, Button, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
    title: 'Yeni Sezon İndirimleri',
    description: 'Seçili ürünlerde %50\'ye varan indirimler',
    buttonText: 'Alışverişe Başla',
    color: '#FF4D4D',
    link: '/category/giyim'
  },
  {
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece',
    title: 'Elektronik Fırsatları',
    description: 'En yeni teknoloji ürünleri uygun fiyatlarla',
    buttonText: 'Fırsatları Keşfet',
    color: '#4D79FF',
    link: '/category/elektronik'
  },
  {
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    title: 'Ev & Yaşam',
    description: 'Eviniz için ihtiyacınız olan her şey',
    buttonText: 'Ürünleri İncele',
    color: '#4CAF50',
    link: '/category/ev-mobilya'
  },
  {
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a',
    title: 'Spor & Outdoor',
    description: 'Aktif yaşam için gerekli tüm ekipmanlar',
    buttonText: 'Hemen İncele',
    color: '#FF9800',
    link: '/category/spor'
  },
  {
    image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea',
    title: 'Kozmetik Dünyası',
    description: 'Güzellik ve bakım ürünlerinde büyük fırsatlar',
    buttonText: 'Fırsatları Gör',
    color: '#E91E63',
    link: '/category/kozmetik'
  }
];

export function Carousel() {
  const navigate = useNavigate();

  return (
    <Container size="xl" py="xl" px="md" style={{ margin: '0 auto' }}>
      <MantineCarousel
        withIndicators
        height={500}
        width={800}
        slideSize="100%"
        slideGap="md"
        loop
        align="center"
        controlsOffset="xs"
        controlSize={48}
        withControls
        styles={{
          root: { width: '800px', margin: '0 auto' },
          viewport: {
            borderRadius: '8px',
            overflow: 'hidden'
          },
          control: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            color: '#333',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&:disabled': {
              opacity: 0,
              cursor: 'default'
            }
          },
          indicators: {
            bottom: 15,
            gap: '8px',
            button: {
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              width: '8px',
              height: '8px',
              transition: 'width 250ms ease',
              '&[data-active="true"]': {
                width: '24px',
                backgroundColor: 'white'
              }
            }
          }
        }}
      >
        {slides.map((slide, index) => (
          <MantineCarousel.Slide key={index}>
            <Paper
              shadow="md"
              style={{
                height: '500px',
                width: '800px',
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '8px'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 1
                }}
              />
              <div
                style={{
                  zIndex: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem',
                  width: '100%'
                }}
              >
                <Title order={2} mb="xs" style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                  {slide.title}
                </Title>
                <Text size="md" mb="xl" style={{ color: 'white', fontSize: '1.1rem', maxWidth: '100%' }}>
                  {slide.description}
                </Text>
                <Button
                  size="md"
                  onClick={() => navigate(slide.link)}
                  style={{
                    backgroundColor: slide.color,
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    padding: '10px 20px'
                  }}
                >
                  {slide.buttonText}
                </Button>
              </div>
            </Paper>
          </MantineCarousel.Slide>
        ))}
      </MantineCarousel>
    </Container>
  );
} 