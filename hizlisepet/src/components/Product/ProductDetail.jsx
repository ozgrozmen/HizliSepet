import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Image, 
  Text, 
  Group, 
  Button, 
  ActionIcon,
  Paper,
  Stack,
  Badge,
  ColorSwatch,
  Tooltip,
  Modal,
  Table,
  Rating,
  Avatar,
  Textarea,
  Divider,
  Notification
} from '@mantine/core';
import { 
  IconZoomIn,
  IconRuler,
  IconBell,
  IconChevronLeft,
  IconChevronRight,
  IconRulerMeasure,
  IconStar,
  IconStarFilled,
  IconMessageCircle,
  IconCheck,
  IconShoppingCart
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('Siyah');
  const [selectedSize, setSelectedSize] = useState('M');
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Değerlendirmeler ve özellikler için başlangıçta gösterilecek miktar
  const initialReviewsToShow = 2;
  const initialFeaturesToShow = 4;

  const colors = [
    { name: 'Siyah', value: '#000000' },
    { name: 'Beyaz', value: '#FFFFFF', border: true },
    { name: 'Kırmızı', value: '#FF0000' },
    { name: 'Lacivert', value: '#000080' },
    { name: 'Gri', value: '#808080' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const sizeGuideData = [
    { size: 'XS', chest: '82-85', waist: '63-66', hip: '89-92' },
    { size: 'S', chest: '86-89', waist: '67-70', hip: '93-96' },
    { size: 'M', chest: '90-93', waist: '71-74', hip: '97-100' },
    { size: 'L', chest: '94-97', waist: '75-78', hip: '101-104' },
    { size: 'XL', chest: '98-101', waist: '79-82', hip: '105-108' },
    { size: 'XXL', chest: '102-105', waist: '83-86', hip: '109-112' }
  ];

  const reviews = [
    {
      id: 1,
      user: 'Ahmet Y.',
      rating: 5,
      comment: 'Ürün kalitesi çok iyi, tam beklediğim gibi.',
      date: '2024-01-15'
    },
    {
      id: 2,
      user: 'Ayşe K.',
      rating: 4,
      comment: 'Güzel ürün, kargo hızlıydı.',
      date: '2024-01-14'
    }
  ];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Ürün yüklenirken hata:', error);
      return;
    }

    setProduct(data);
    setLoading(false);

    // Benzer ürünleri getir
    const { data: similarProducts, error: similarError } = await supabase
      .from('products')
      .select('*')
      .eq('category', data.category)
      .neq('id', productId)
      .limit(6);

    if (!similarError) {
      setSuggestedProducts(similarProducts);
    }
  };

  if (loading || !product) {
    return <div>Yükleniyor...</div>;
  }

  const discountedPrice = product.price * 0.8; // %20 indirim örneği

  const handleReviewSubmit = () => {
    // Burada yorum gönderme işlemi yapılacak
    setShowReviewModal(false);
    setRating(0);
    setComment('');
  };

  const handleAddToCart = async () => {
    console.log('Sepete eklenecek ürün:', product);
    console.log('Miktar:', quantity);
    console.log('Renk:', selectedColor);
    console.log('Beden:', selectedSize);

    // Ürünü sepete ekle
    try {
      const success = await addToCart(
        product, 
        quantity, 
        selectedColor, 
        selectedSize
      );

      console.log('Sepete ekleme sonucu:', success);

      if (success) {
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      } else {
        alert('Ürün sepete eklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Sepete ekleme işleminde hata:', error);
      alert('Ürün sepete eklenirken bir hata oluştu: ' + error.message);
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  // Örnek ürün özellikleri
  const productFeatures = {
    "Kumaş": "%100 Pamuk",
    "Kalıp": "Regular Fit",
    "Yaka": "Bisiklet Yaka",
    "Kol Boyu": "Uzun Kol",
    "Desen": "Düz",
    "Ürün Kodu": "ABC123",
    "Bakım": "Maksimum 30°C'de yıkanabilir",
    "Menşei": "Türkiye"
  };

  return (
    <div style={{ 
      width: '100vw',
      margin: '0 -20px',
      backgroundColor: 'white',
      paddingTop: '20px'
    }}>
      <Grid gutter={0} style={{ margin: 0 }}>
        {/* Sol Taraf - Ürün Görseli */}
        <Grid.Col span={{ base: 12, md: 7 }} p={0}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'white',
            padding: '15px',
            marginTop: '30px',
            height: 'auto'
          }}>
            <Paper p={0} radius={8} shadow="md" style={{ 
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              border: '1px solid #e9ecef',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <div style={{ 
                position: 'relative',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '8px'
              }}>
                <Image
                  src={product.image_url || 'https://placehold.co/800x1000?text=Ürün+Görseli'}
                  alt={product.name}
                  height={450}
                  fit="contain"
                  style={{ 
                    width: '100%', 
                    objectFit: 'contain', 
                    maxHeight: '450px',
                    borderRadius: '4px'
                  }}
                  onClick={() => setZoomModalOpen(true)}
                />
                <Group spacing={0} style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  width: '100%', 
                  transform: 'translateY(-50%)', 
                  justifyContent: 'space-between', 
                  padding: '0 15px',
                  zIndex: 2
                }}>
                  <ActionIcon 
                    variant="filled" 
                    color="dark" 
                    size="lg"
                    radius="xl"
                    opacity={0.7}
                  >
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="filled" 
                    color="dark" 
                    size="lg"
                    radius="xl"
                    opacity={0.7}
                  >
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </Group>
                <ActionIcon
                  variant="filled"
                  color="dark"
                  size="md"
                  radius="xl"
                  style={{ position: 'absolute', top: 15, right: 15, zIndex: 2 }}
                  opacity={0.7}
                  onClick={() => setZoomModalOpen(true)}
                >
                  <IconZoomIn size={20} />
                </ActionIcon>
              </div>
            </Paper>
          </div>
        </Grid.Col>

        {/* Sağ Taraf - Ürün Bilgileri */}
        <Grid.Col span={{ base: 12, md: 5 }} p={0}>
          <Stack spacing="xl" p="xl" style={{ backgroundColor: 'white', marginTop: '30px' }}>
            <div>
              <Text size="xl" fw={700}>{product.name}</Text>
              <Text size="lg" c="dimmed" mt="xs">{product.brand}</Text>
            </div>

            {/* Fiyat Bilgileri */}
            <Paper p="lg" radius="md" withBorder>
              <Stack spacing="md">
                <Group position="apart">
                  <div>
                    <Text size="xl" fw={700} c="blue">{discountedPrice.toFixed(2)} TL</Text>
                    <Group spacing="xs">
                      <Text size="lg" td="line-through" c="dimmed">{product.price.toFixed(2)} TL</Text>
                      <Badge color="red" size="lg">%20 İndirim</Badge>
                    </Group>
                  </div>
                  {product.stock <= 10 && (
                    <Badge color="red" size="lg" variant="dot">
                      Son {product.stock} Adet!
                    </Badge>
                  )}
                </Group>

                {product.stock < 5 && (
                  <Button 
                    variant="light" 
                    color="blue" 
                    fullWidth
                  >
                    <Group spacing="xs" position="center">
                      <IconBell size={20} />
                      <span>Stok Bildirimi Al</span>
                    </Group>
                  </Button>
                )}
              </Stack>
            </Paper>

            {/* Renk Seçimi */}
            <Paper p="lg" radius="md" withBorder>
              <Stack spacing="md">
                <Text fw={500}>Renk Seçimi</Text>
                <Group spacing="xs">
                  {colors.map((color) => (
                    <Tooltip key={color.name} label={color.name}>
                      <ColorSwatch
                        color={color.value}
                        style={{ 
                          cursor: 'pointer',
                          border: selectedColor === color.name ? '2px solid blue' : color.border ? '1px solid #ddd' : 'none'
                        }}
                        onClick={() => setSelectedColor(color.name)}
                        size={40}
                      />
                    </Tooltip>
                  ))}
                </Group>
              </Stack>
            </Paper>

            {/* Beden Seçimi */}
            <Paper p="md" radius="md" withBorder>
              <Stack spacing="sm">
                <Group position="apart">
                  <Text fw={500} size="sm">Beden Seçimi</Text>
                  <Button 
                    variant="subtle"
                    onClick={() => setShowSizeGuide(true)}
                    size="xs"
                  >
                    <Group spacing="xs">
                      <span>Beden Rehberi</span>
                      <IconRulerMeasure size={16} />
                    </Group>
                  </Button>
                </Group>
                <Group spacing="xs">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'filled' : 'outline'}
                      onClick={() => setSelectedSize(size)}
                      size="sm"
                      style={{ flex: 1, minWidth: '40px', padding: '0 8px' }}
                    >
                      {size}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Paper>

            {/* Miktar Seçimi */}
            <Paper p="md" radius="md" withBorder>
              <Stack spacing="sm">
                <Text fw={500} size="sm">Miktar</Text>
                <Group spacing="xs">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Text size="lg" fw={500} style={{ minWidth: '40px', textAlign: 'center' }}>
                    {quantity}
                  </Text>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </Group>
              </Stack>
            </Paper>

            {/* Sepete Ekle */}
            <Group grow>
              <Button 
                color="blue" 
                size="xl" 
                onClick={handleAddToCart}
                style={{
                  height: '56px',
                  fontSize: '18px',
                  fontWeight: 600
                }}
                leftSection={<IconShoppingCart size={20} />}
              >
                Sepete Ekle
              </Button>
              
              <Button 
                color="green" 
                size="xl" 
                onClick={goToCart}
                style={{
                  height: '56px',
                  fontSize: '18px',
                  fontWeight: 600
                }}
              >
                Sepete Git
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Değerlendirmeler ve Ürün Özellikleri */}
      <Container size="xl" my="xl" style={{ backgroundColor: 'white' }}>
        <Grid>
          {/* Değerlendirmeler */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack spacing="md" style={{ flex: 1 }}>
                <Group position="apart">
                  <div>
                    <Text fw={500} size="lg">Değerlendirmeler</Text>
                    <Group spacing="xs" mt="xs">
                      <Rating value={4.5} fractions={2} readOnly />
                      <Text size="sm" c="dimmed">(12 değerlendirme)</Text>
                    </Group>
                  </div>
                  <Button 
                    variant="light"
                    leftSection={<IconMessageCircle size={16} />}
                    onClick={() => setShowReviewModal(true)}
                    size="sm"
                  >
                    Yorum Yap
                  </Button>
                </Group>

                <Divider />

                <Stack spacing="lg" style={{ minHeight: '150px' }}>
                  {(showAllReviews ? reviews : reviews.slice(0, initialReviewsToShow)).map((review) => (
                    <div key={review.id}>
                      <Group position="apart">
                        <Group>
                          <Avatar color="blue" radius="xl">{review.user.charAt(0)}</Avatar>
                          <div>
                            <Text size="sm" fw={500}>{review.user}</Text>
                            <Rating value={review.rating} readOnly size="xs" />
                          </div>
                        </Group>
                        <Text size="xs" c="dimmed">{new Date(review.date).toLocaleDateString('tr-TR')}</Text>
                      </Group>
                      <Text size="sm" mt="xs">{review.comment}</Text>
                    </div>
                  ))}
                </Stack>

                {reviews.length > initialReviewsToShow && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    size="sm"
                    mt="md"
                    fullWidth
                    color="blue"
                  >
                    {showAllReviews ? 'Daha az göster' : 'Tüm değerlendirmeleri göster'}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Ürün Özellikleri */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack spacing="md" style={{ flex: 1 }}>
                <Text fw={500} size="lg">Ürün Özellikleri</Text>
                
                <Divider />
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr',
                  gap: '12px',
                  fontSize: '14px',
                  minHeight: '150px'
                }}>
                  {(showAllFeatures ? Object.entries(productFeatures) : Object.entries(productFeatures).slice(0, initialFeaturesToShow)).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Text fw={500} c="dimmed">{key}</Text>
                      <Text>{value}</Text>
                    </React.Fragment>
                  ))}
                </div>

                {Object.entries(productFeatures).length > initialFeaturesToShow && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    size="sm"
                    mt="md"
                    fullWidth
                    color="blue"
                  >
                    {showAllFeatures ? 'Daha az göster' : 'Tüm özellikleri göster'}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Önerilen Ürünler */}
      {suggestedProducts.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px 0',
          marginTop: '20px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Container size="xl" p={0}>
            <Text size="xl" fw={600} mb="xl" pl="md">
              Benzer Ürünler
            </Text>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              padding: '0 20px'
            }}>
              {suggestedProducts.map((suggestedProduct) => (
                <Paper
                  key={suggestedProduct.id}
                  p="xs"
                  radius="md"
                  withBorder
                  shadow="sm"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    overflow: 'hidden'
                  }}
                  onClick={() => navigate(`/product/${suggestedProduct.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{
                    padding: '5px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <Image
                      src={suggestedProduct.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                      height={180}
                      fit="contain"
                      style={{
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <Stack spacing={5} mt="sm">
                    <Text size="sm" fw={500} lineClamp={2}>
                      {suggestedProduct.name}
                    </Text>
                    <Group position="apart" align="center">
                      <Text size="sm" fw={700} c="blue">
                        {(suggestedProduct.price * 0.8).toFixed(2)} TL
                      </Text>
                      <Badge color="red" size="sm">%20</Badge>
                    </Group>
                    <Text size="xs" td="line-through" c="dimmed">
                      {suggestedProduct.price.toFixed(2)} TL
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Sepete Eklendi Bildirimi */}
      {addedToCart && (
        <Notification
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999
          }}
          title="Ürün sepete eklendi"
          color="green"
          icon={<IconCheck size={18} />}
          onClose={() => setAddedToCart(false)}
        >
          {product.name} sepete eklendi. 
          <Button 
            variant="white" 
            size="xs" 
            compact 
            ml="md"
            onClick={goToCart}
          >
            Sepete Git
          </Button>
        </Notification>
      )}

      {/* Modaller */}
      <Modal
        opened={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        size="85%"
        title=""
        centered
        withCloseButton={false}
        padding={0}
        radius="md"
        styles={{
          body: { backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' },
          content: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
          root: { margin: '90px 30px 5px 30px' }
        }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <ActionIcon
            variant="filled"
            color="dark"
            radius="xl"
            style={{ 
              position: 'absolute', 
              top: 15, 
              right: 15, 
              zIndex: 100,
              opacity: 0.7
            }}
            onClick={() => setZoomModalOpen(false)}
            size="lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </ActionIcon>
          <Image
            src={product.image_url || 'https://placehold.co/800x1000?text=Ürün+Görseli'}
            fit="contain"
            height={800}
            width="auto"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        </div>
      </Modal>

      <Modal
        opened={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        title="Beden Rehberi"
        size="lg"
      >
        <Table>
          <thead>
            <tr>
              <th>Beden</th>
              <th>Göğüs (cm)</th>
              <th>Bel (cm)</th>
              <th>Kalça (cm)</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuideData.map((row) => (
              <tr key={row.size}>
                <td>{row.size}</td>
                <td>{row.chest}</td>
                <td>{row.waist}</td>
                <td>{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal>

      {/* Yorum Yapma Modalı */}
      <Modal
        opened={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Ürünü Değerlendir"
        size="md"
      >
        <Stack spacing="md">
          <div>
            <Text size="sm" fw={500} mb="xs">Puanınız</Text>
            <Rating 
              value={rating} 
              onChange={setRating}
              size="lg"
              emptySymbol={<IconStar size={24} />}
              fullSymbol={<IconStarFilled size={24} />}
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb="xs">Yorumunuz</Text>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
              minRows={4}
            />
          </div>

          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setShowReviewModal(false)}>İptal</Button>
            <Button onClick={handleReviewSubmit} disabled={!rating || !comment.trim()}>
              Gönder
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
} 