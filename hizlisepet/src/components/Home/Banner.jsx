import { Carousel } from '@mantine/carousel';
import { Paper, Text, Title, Button, Stack, Container, Center } from '@mantine/core';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    title: 'Yeni Sezon İndirimleri',
    description: 'Seçili ürünlerde %50\'ye varan indirimler',
    buttonText: 'Alışverişe Başla',
    color: '#FF4D4D'
  },
  {
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
    title: 'Elektronik Fırsatları',
    description: 'En yeni teknoloji ürünleri uygun fiyatlarla',
    buttonText: 'Fırsatları Keşfet',
    color: '#4D79FF'
  },
  {
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
    title: 'Ev & Yaşam',
    description: 'Eviniz için ihtiyacınız olan her şey',
    buttonText: 'Ürünleri İncele',
    color: '#4CAF50'
  }
];

export function Banner() {
  return (
    <div style={{ 
      width: '100vw', 
      backgroundColor: 'white', 
      padding: '20px 0', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      maxWidth: '100%',
      margin: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <Container size="xl" style={{ 
        width: '60%', 
        maxWidth: '1200px',
        padding: '0 40px',
        margin: '0 auto'
      }}>
        <Carousel
          withIndicators
          height={400}
          slideSize="100%"
          loop
          align="center"
          styles={{
            root: { width: '100%' },
            viewport: {
              borderRadius: '8px',
              overflow: 'hidden'
            },
            control: {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: 'none',
              color: '#000',
              '&:disabled': {
                opacity: 0,
                cursor: 'default'
              }
            },
            indicators: {
              bottom: 20,
              gap: '8px',
              button: {
                backgroundColor: 'white',
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
            <Carousel.Slide key={index}>
              <Paper
                style={{
                  height: '100%',
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '60px'
                }}
              >
                <Stack align="center" spacing="xl" style={{ maxWidth: '800px' }}>
                  <Title order={1} ta="center" style={{ fontSize: '2.5rem', color: 'white' }}>
                    {slide.title}
                  </Title>
                  <Text size="xl" ta="center" c="white">
                    {slide.description}
                  </Text>
                  <Button 
                    size="lg"
                    style={{ 
                      backgroundColor: slide.color,
                      width: 'fit-content'
                    }}
                  >
                    {slide.buttonText}
                  </Button>
                </Stack>
              </Paper>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Container>
    </div>
  );
} 