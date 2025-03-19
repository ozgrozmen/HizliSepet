import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Divider
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
  IconMessageCircle
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const navigate = useNavigate();

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

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Lütfen renk ve beden seçimi yapınız.');
      return;
    }
    // Burada sepete ekleme işlemi yapılacak
    alert('Ürün sepete eklendi!');
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
      backgroundColor: '#f8f9fa'
    }}>
      <Grid gutter={0} style={{ margin: 0 }}>
        {/* Sol Taraf - Ürün Görseli */}
        <Grid.Col span={{ base: 12, md: 7 }} p={0}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start',
            backgroundColor: 'white',
            padding: '20px',
            height: 'auto',
            position: 'sticky',
            top: '20px'
          }}>
            <Paper p={0} radius={0} style={{ 
              width: '100%',
              maxWidth: '500px'
            }}>
              <div style={{ position: 'relative' }}>
                <Image
                  src={product.image_url || 'https://placehold.co/800x1000?text=Ürün+Görseli'}
                  alt={product.name}
                  height={600}
                  fit="contain"
                  style={{ width: '100%', objectFit: 'contain' }}
                  onClick={() => setZoomModalOpen(true)}
                />
                <Group spacing={0} style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  width: '100%', 
                  transform: 'translateY(-50%)', 
                  justifyContent: 'space-between', 
                  padding: '0 10px' 
                }}>
                  <ActionIcon 
                    variant="filled" 
                    color="gray" 
                    size="xl"
                  >
                    <IconChevronLeft size={24} />
                  </ActionIcon>
                  <ActionIcon 
                    variant="filled" 
                    color="gray" 
                    size="xl"
                  >
                    <IconChevronRight size={24} />
                  </ActionIcon>
                </Group>
                <ActionIcon
                  variant="filled"
                  color="gray"
                  size="lg"
                  style={{ position: 'absolute', top: 10, right: 10 }}
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
          <Stack spacing="xl" p="xl" style={{ backgroundColor: 'white' }}>
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
                    compact
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
            <Button 
              color="blue" 
              size="xl" 
              fullWidth
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              style={{
                height: '56px',
                fontSize: '18px',
                fontWeight: 600
              }}
            >
              {!selectedSize || !selectedColor ? 'Renk ve Beden Seçiniz' : 'Sepete Ekle'}
            </Button>

            {/* Değerlendirmeler ve Yorumlar */}
            <Paper p="lg" radius="md" withBorder>
              <Stack spacing="md">
                <Group position="apart">
                  <div>
                    <Text fw={500}>Değerlendirmeler</Text>
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

                <Stack spacing="lg">
                  {reviews.map((review) => (
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
              </Stack>
            </Paper>

            {/* Ürün Özellikleri */}
            <Paper p="lg" radius="md" withBorder>
              <Stack spacing="md">
                <Text fw={500}>Ürün Özellikleri</Text>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  {Object.entries(productFeatures).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <Text fw={500} c="dimmed">{key}</Text>
                      <Text>{value}</Text>
                    </React.Fragment>
                  ))}
                </div>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Önerilen Ürünler */}
      {suggestedProducts.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px 0',
          marginTop: '20px',
          borderTop: '1px solid #eee'
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
                  radius="sm"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${suggestedProduct.id}`)}
                >
                  <Image
                    src={suggestedProduct.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                    height={200}
                    fit="contain"
                  />
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

      {/* Modaller */}
      <Modal
        opened={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        size="90%"
        title="Ürün Görseli"
      >
        <Image
          src={product.image_url || 'https://placehold.co/800x1000?text=Ürün+Görseli'}
          fit="contain"
          height={800}
        />
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