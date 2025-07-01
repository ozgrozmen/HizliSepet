import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Text,
  Divider,
  Button,
  TextInput,
  Textarea,
  Select,
  Grid,
  LoadingOverlay,
  Alert,
  Box,
  Card,
  Image,
  NumberInput,
  Stepper,
  Radio,
  RadioGroup,
  Stack,
  Center,
  Modal,
  Badge,
  ThemeIcon
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { notifications } from '@mantine/notifications';
import { 
  IconShoppingCart, 
  IconMapPin, 
  IconCreditCard, 
  IconCheck,
  IconAlertCircle, 
  IconTruck,
  IconHome2,
  IconUser,
  IconPhone,
  IconHome,
  IconMailbox,
  IconArrowRight,
  IconArrowLeft,
  IconCash,
  IconLock,
  IconPackage
} from '@tabler/icons-react';

export function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);
  
  // Form değerleri
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvv: '',
    paymentMethod: 'credit_card'
  });
  
  // Kart bilgileri görüntüleme seçeneği
  const [showCardForm, setShowCardForm] = useState(true);
  
  useEffect(() => {
    // Oturum kontrolü yap
    if (!user) {
      notifications.show({
        title: 'Giriş Yapmalısınız',
        message: 'Ödeme yapmak için lütfen giriş yapın',
        color: 'red'
      });
      navigate('/login');
      return;
    }
    
    // Sepet boşsa ana sayfaya yönlendir
    if (cartItems.length === 0) {
      notifications.show({
        title: 'Sepetiniz Boş',
        message: 'Ödeme yapmak için sepetinizde ürün bulunmalıdır',
        color: 'orange'
      });
      navigate('/');
      return;
    }
    
    // Kullanıcı bilgilerini getir ve formu doldur
    fetchUserProfile();
  }, [user, cartItems]);
  
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Profil bilgileri yüklenirken hata:', error);
        return;
      }
      
      if (data) {
        // Mevcut adres bilgilerini doldur
        setShippingForm(prev => ({
          ...prev,
          fullName: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          postalCode: data.postal_code || ''
        }));
      }
    } catch (error) {
      console.error('Profil bilgileri yüklenirken beklenmeyen hata:', error);
    }
  };
  
  const handleShippingFormChange = (field, value) => {
    setShippingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handlePaymentMethodChange = (value) => {
    setPaymentForm(prev => ({
      ...prev,
      paymentMethod: value
    }));
    
    // Kredi kartı seçilirse kart formunu göster, değilse gizle
    setShowCardForm(value === 'credit_card');
  };
  
  const validateShippingForm = () => {
    if (!shippingForm.fullName) return 'Ad Soyad bilgisi gereklidir';
    if (!shippingForm.phone) return 'Telefon numarası gereklidir';
    if (!shippingForm.address) return 'Adres bilgisi gereklidir';
    if (!shippingForm.city) return 'Şehir bilgisi gereklidir';
    if (!shippingForm.district) return 'İlçe bilgisi gereklidir';
    return null;
  };
  
  const validatePaymentForm = () => {
    if (paymentForm.paymentMethod === 'credit_card') {
      if (!paymentForm.cardHolder) return 'Kart sahibi bilgisi gereklidir';
      if (!paymentForm.cardNumber || paymentForm.cardNumber.length < 16) return 'Geçerli bir kart numarası giriniz';
      if (!paymentForm.expireMonth) return 'Son kullanma ayı gereklidir';
      if (!paymentForm.expireYear) return 'Son kullanma yılı gereklidir';
      if (!paymentForm.cvv || paymentForm.cvv.length < 3) return 'Geçerli bir CVV giriniz';
    }
    return null;
  };
  
  const handleNextStep = () => {
    if (activeStep === 0) {
      const error = validateShippingForm();
      if (error) {
        notifications.show({
          title: 'Form Hatası',
          message: error,
          color: 'red'
        });
        return;
      }
    }
    
    if (activeStep === 1) {
      const error = validatePaymentForm();
      if (error) {
        notifications.show({
          title: 'Form Hatası',
          message: error,
          color: 'red'
        });
        return;
      }
    }
    
    setActiveStep(prev => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleCompleteOrder = async () => {
    try {
      setLoading(true);
      
      // Sipariş özeti
      const totalAmount = getCartTotal();
      const discountedTotal = totalAmount * 0.9; // %10 indirim (örnek)
      const paymentMethod = paymentForm.paymentMethod === 'credit_card' 
        ? `Kredi Kartı (${paymentForm.cardNumber.slice(-4)})` 
        : 'Kapıda Ödeme';
      
      // Shipping address JSON formatında
      const shippingAddressJson = {
        fullName: shippingForm.fullName,
        address: shippingForm.address,
        city: shippingForm.city,
        district: shippingForm.district,
        postalCode: shippingForm.postalCode,
        phone: shippingForm.phone
      };

      // Siparişi oluştur
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: discountedTotal,
            status: 'pending',
            shipping_address: shippingAddressJson,
            payment_method: paymentMethod,
            phone: shippingForm.phone
          }
        ])
        .select();
      
      if (orderError) {
        console.error('Sipariş oluşturulurken hata:', orderError);
        throw orderError;
      }
      
      const orderId = orderData[0].id;
      setNewOrderId(orderId);
      
      // Sipariş öğelerini oluştur
      const orderItems = cartItems.map(item => {
        const itemPrice = item.product?.price || item.price || 0;
        const itemTotal = itemPrice * item.quantity;
        
        return {
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: itemPrice,
          total: itemTotal
        };
      });
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Sipariş öğeleri oluşturulurken hata:', itemsError);
        throw itemsError;
      }
      
      // Sepeti temizle
      await clearCart();
      
      // Başarı mesajı göster
      setSuccessModalOpen(true);
      
    } catch (error) {
      console.error('Sipariş tamamlanırken hata:', error);
      notifications.show({
        title: 'Sipariş Hatası',
        message: 'Siparişiniz oluşturulurken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };
  
  // Kullanıcı giriş yapmadıysa veya sepet boşsa içerik gösterme
  if (!user || cartItems.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Center style={{ height: '60vh' }}>
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ödeme Yapılamıyor" 
            color="red"
            variant="filled"
          >
            Sepetiniz boş veya giriş yapmadınız. Ödeme yapmak için lütfen giriş yapın ve sepetinize ürün ekleyin.
          </Alert>
        </Center>
      </Container>
    );
  }
  
  const totalAmount = getCartTotal();
  const discountedTotal = totalAmount * 0.9; // %10 indirim (örnek)
  
  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />
      
      <Stepper active={activeStep} onStepClick={setActiveStep} mb="xl">
        <Stepper.Step
          label="Teslimat Bilgileri"
          description="Adres ve İletişim"
          icon={<IconMapPin size="1.1rem" />}
          completedIcon={<IconCheck size="1.1rem" />}
        />
        <Stepper.Step
          label="Ödeme Bilgileri"
          description="Kart ve Ödeme Yöntemi"
          icon={<IconCreditCard size="1.1rem" />}
          completedIcon={<IconCheck size="1.1rem" />}
        />
        <Stepper.Step
          label="Onay"
          description="Sipariş Özeti"
          icon={<IconShoppingCart size="1.1rem" />}
          completedIcon={<IconCheck size="1.1rem" />}
        />
      </Stepper>
      
      <Paper shadow="sm" p="xl" radius="md" bg="gray.0">
        {/* Teslimat Bilgileri Adımı */}
        {activeStep === 0 && (
          <>
            <Title order={3} mb="xl" c="blue.7">
              <Group>
                <ThemeIcon size={40} radius="md" color="blue" variant="light">
                  <IconTruck size={22} />
                </ThemeIcon>
                <Text>Teslimat Bilgileri</Text>
              </Group>
            </Title>
            
            <Paper p="xl" radius="md" bg="white" mb="xl">
              <Grid gutter="xl">
                <Grid.Col span={12}>
                  <Card withBorder p="md" radius="md" mb="xl">
                    <Card.Section bg="blue.0" p="sm">
                      <Group>
                        <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                          <IconUser size={18} />
                        </ThemeIcon>
                        <Text fw={500}>Kişisel Bilgiler</Text>
                      </Group>
                    </Card.Section>
                    <Box pt="md">
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <TextInput
                            label="Ad Soyad"
                            placeholder="Ad Soyad giriniz"
                            value={shippingForm.fullName}
                            onChange={(e) => handleShippingFormChange('fullName', e.target.value)}
                            required
                            size="md"
                            leftSection={<IconUser size={16} />}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <TextInput
                            label="Telefon"
                            placeholder="05XX XXX XX XX"
                            value={shippingForm.phone}
                            onChange={(e) => handleShippingFormChange('phone', e.target.value)}
                            required
                            size="md"
                            leftSection={<IconPhone size={16} />}
                          />
                        </Grid.Col>
                      </Grid>
                    </Box>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <Card withBorder p="md" radius="md">
                    <Card.Section bg="blue.0" p="sm">
                      <Group>
                        <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                          <IconHome2 size={18} />
                        </ThemeIcon>
                        <Text fw={500}>Adres Bilgileri</Text>
                      </Group>
                    </Card.Section>
                    <Box pt="md">
                      <Grid gutter="md">
                        <Grid.Col span={12}>
                          <Textarea
                            label="Adres"
                            placeholder="Detaylı adres bilgisi giriniz"
                            value={shippingForm.address}
                            onChange={(e) => handleShippingFormChange('address', e.target.value)}
                            required
                            minRows={3}
                            size="md"
                            leftSection={<IconHome size={16} />}
                            mb="md"
                          />
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Select
                            label="İl"
                            placeholder="İl seçiniz"
                            value={shippingForm.city}
                            onChange={(value) => handleShippingFormChange('city', value)}
                            data={['İstanbul', 'Ankara', 'İzmir']} // Örnek veri
                            required
                            size="md"
                            leftSection={<IconMapPin size={16} />}
                            searchable
                          />
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Select
                            label="İlçe"
                            placeholder="İlçe seçiniz"
                            value={shippingForm.district}
                            onChange={(value) => handleShippingFormChange('district', value)}
                            data={['Kadıköy', 'Beşiktaş', 'Üsküdar']} // Örnek veri
                            required
                            size="md"
                            leftSection={<IconMapPin size={16} />}
                            searchable
                          />
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <TextInput
                            label="Posta Kodu"
                            placeholder="34XXX"
                            value={shippingForm.postalCode}
                            onChange={(e) => handleShippingFormChange('postalCode', e.target.value)}
                            required
                            size="md"
                            leftSection={<IconMailbox size={16} />}
                          />
                        </Grid.Col>
                      </Grid>
                    </Box>
                  </Card>
                </Grid.Col>
              </Grid>
            </Paper>
            
            <Group justify="flex-end" mt="xl">
              <Button 
                color="blue" 
                onClick={handleNextStep}
                rightSection={<IconArrowRight size={16} />}
                size="md"
                radius="xl"
              >
                Devam Et
              </Button>
            </Group>
          </>
        )}

        {/* Ödeme Bilgileri Adımı */}
        {activeStep === 1 && (
          <>
            <Title order={3} mb="xl" c="blue.7">
              <Group>
                <ThemeIcon size={40} radius="md" color="blue" variant="light">
                  <IconCreditCard size={22} />
                </ThemeIcon>
                <Text>Ödeme Bilgileri</Text>
              </Group>
            </Title>
            
            <Paper p="xl" radius="md" bg="white" mb="xl">
              <Card withBorder p="md" radius="md" mb="xl">
                <Card.Section bg="blue.0" p="sm">
                  <Group>
                    <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                      <IconCreditCard size={18} />
                    </ThemeIcon>
                    <Text fw={500}>Ödeme Yöntemi</Text>
                  </Group>
                </Card.Section>
                <Box pt="md">
                  <RadioGroup
                    value={paymentForm.paymentMethod}
                    onChange={(value) => {
                      handlePaymentFormChange('paymentMethod', value);
                      setShowCardForm(value === 'credit_card');
                    }}
                  >
                    <Stack>
                      <Paper withBorder p="md" radius="md">
                        <Radio
                          value="credit_card"
                          label={
                            <Group>
                              <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                                <IconCreditCard size={18} />
                              </ThemeIcon>
                              <Box>
                                <Text fw={500}>Kredi/Banka Kartı</Text>
                                <Text size="sm" c="dimmed">Güvenli ödeme ile anında işlem</Text>
                              </Box>
                            </Group>
                          }
                        />
                      </Paper>
                      <Paper withBorder p="md" radius="md">
                        <Radio
                          value="cash_on_delivery"
                          label={
                            <Group>
                              <ThemeIcon size={32} radius="xl" color="green" variant="light">
                                <IconCash size={18} />
                              </ThemeIcon>
                              <Box>
                                <Text fw={500}>Kapıda Ödeme</Text>
                                <Text size="sm" c="dimmed">Teslimat sırasında ödeme (+15,00 TL)</Text>
                              </Box>
                            </Group>
                          }
                        />
                      </Paper>
                    </Stack>
                  </RadioGroup>
                </Box>
              </Card>

              {showCardForm && (
                <Card withBorder p="md" radius="md">
                  <Card.Section bg="blue.0" p="sm">
                    <Group>
                      <ThemeIcon size={32} radius="xl" color="blue" variant="light">
                        <IconCreditCard size={18} />
                      </ThemeIcon>
                      <Text fw={500}>Kart Bilgileri</Text>
                    </Group>
                  </Card.Section>
                  <Box pt="md">
                    <Grid>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Kart Üzerindeki İsim"
                          placeholder="Kart üzerindeki ismi giriniz"
                          value={paymentForm.cardHolder}
                          onChange={(e) => handlePaymentFormChange('cardHolder', e.target.value)}
                          required
                          mb="md"
                          leftSection={<IconUser size={16} />}
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={12}>
                        <TextInput
                          label="Kart Numarası"
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={paymentForm.cardNumber}
                          onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value)}
                          required
                          mb="md"
                          leftSection={<IconCreditCard size={16} />}
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={6}>
                        <Group grow>
                          <Select
                            label="Son Kullanma Ay"
                            placeholder="Ay"
                            value={paymentForm.expireMonth}
                            onChange={(value) => handlePaymentFormChange('expireMonth', value)}
                            data={Array.from({length: 12}, (_, i) => ({
                              value: String(i + 1).padStart(2, '0'),
                              label: String(i + 1).padStart(2, '0')
                            }))}
                            required
                            mb="md"
                          />
                          <Select
                            label="Son Kullanma Yıl"
                            placeholder="Yıl"
                            value={paymentForm.expireYear}
                            onChange={(value) => handlePaymentFormChange('expireYear', value)}
                            data={Array.from({length: 10}, (_, i) => String(new Date().getFullYear() + i))}
                            required
                            mb="md"
                          />
                        </Group>
                      </Grid.Col>
                      
                      <Grid.Col span={6}>
                        <TextInput
                          label="CVV"
                          placeholder="XXX"
                          value={paymentForm.cvv}
                          onChange={(e) => handlePaymentFormChange('cvv', e.target.value)}
                          required
                          mb="md"
                          leftSection={<IconLock size={16} />}
                        />
                      </Grid.Col>
                    </Grid>
                  </Box>
                </Card>
              )}
            </Paper>

            <Group justify="space-between" mt="xl">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                leftSection={<IconArrowLeft size={16} />}
                size="md"
                radius="xl"
              >
                Geri
              </Button>
              <Button 
                color="blue" 
                onClick={handleNextStep}
                rightSection={<IconArrowRight size={16} />}
                size="md"
                radius="xl"
              >
                Devam Et
              </Button>
            </Group>
          </>
        )}

        {/* Onay Adımı */}
        {activeStep === 2 && (
          <>
            <Title order={3} mb="xl" c="blue.7">Sipariş Özeti</Title>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder shadow="sm" radius="md" mb="lg">
                  <Title order={5} mb="md" c="blue.7">
                    <Group>
                      <IconHome2 size={20} />
                      <Text>Teslimat Adresi</Text>
                    </Group>
                  </Title>
                  <Box p="md" bg="gray.0" radius="md">
                    <Text fw={500} mb="xs">{shippingForm.fullName}</Text>
                    <Text size="sm" mb="xs">{shippingForm.address}</Text>
                    <Text size="sm" mb="xs">{shippingForm.district}/{shippingForm.city} {shippingForm.postalCode}</Text>
                    <Text size="sm" c="dimmed">Tel: {shippingForm.phone}</Text>
                  </Box>
                </Card>

                <Card withBorder shadow="sm" radius="md" mb="lg">
                  <Title order={5} mb="md" c="blue.7">
                    <Group>
                      <IconCreditCard size={20} />
                      <Text>Ödeme Bilgileri</Text>
                    </Group>
                  </Title>
                  <Box p="md" bg="gray.0" radius="md">
                    <Text>
                      {paymentForm.paymentMethod === 'credit_card' 
                        ? (
                          <Group>
                            <IconCreditCard size={18} />
                            <Text>Kredi Kartı (**** **** **** {paymentForm.cardNumber.slice(-4)})</Text>
                          </Group>
                        ) 
                        : (
                          <Group>
                            <IconCash size={18} />
                            <Text>Kapıda Ödeme</Text>
                          </Group>
                        )
                      }
                    </Text>
                  </Box>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder shadow="sm" radius="md" p="xl">
                  <Title order={5} mb="lg" c="blue.7">Sipariş Detayı</Title>
                  
                  {cartItems.map((item, index) => (
                    <Box key={index} mb="md">
                      <Group>
                        <Image
                          src={item.product?.image_url}
                          width={60}
                          height={60}
                          radius="md"
                        />
                        <Box>
                          <Text fw={500}>{item.product?.name}</Text>
                          <Text size="sm" c="dimmed">Adet: {item.quantity}</Text>
                          <Text size="sm">{formatPrice(item.product?.price * item.quantity)}</Text>
                        </Box>
                      </Group>
                      {index !== cartItems.length - 1 && <Divider my="md" />}
                    </Box>
                  ))}

                  <Divider my="lg" />
                  
                  <Stack spacing="xs">
                    <Group justify="space-between">
                      <Text c="dimmed">Ürünler Toplamı:</Text>
                      <Text>{formatPrice(totalAmount)}</Text>
                    </Group>
                    
                    <Group justify="space-between">
                      <Text c="green">İndirim:</Text>
                      <Text c="green">-{formatPrice(totalAmount - discountedTotal)}</Text>
                    </Group>
                    
                    <Group justify="space-between">
                      <Text c="dimmed">Kargo:</Text>
                      <Badge color="green" variant="light">Ücretsiz</Badge>
                    </Group>
                    
                    {paymentForm.paymentMethod === 'cash_on_delivery' && (
                      <Group justify="space-between">
                        <Text c="dimmed">Kapıda Ödeme Ücreti:</Text>
                        <Text>+15,00 TL</Text>
                      </Group>
                    )}
                    
                    <Divider my="sm" />
                    
                    <Group justify="space-between">
                      <Text fw={700} size="lg">Toplam:</Text>
                      <Text fw={700} size="xl" c="blue.7">
                        {formatPrice(discountedTotal + (paymentForm.paymentMethod === 'cash_on_delivery' ? 15 : 0))}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            <Group justify="space-between" mt="xl">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                leftSection={<IconArrowLeft size={16} />}
                size="md"
              >
                Geri
              </Button>
              <Button 
                color="green" 
                onClick={handleCompleteOrder}
                leftSection={<IconShoppingCart size={16} />}
                size="md"
              >
                Siparişi Tamamla
              </Button>
            </Group>
          </>
        )}
      </Paper>
      
      {/* Başarılı Sipariş Modalı */}
      <Modal
        opened={successModalOpen}
        onClose={() => navigate('/orders')}
        title={<Text size="xl" fw={700} c="green.7">Siparişiniz Alındı</Text>}
        centered
        size="md"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <Box ta="center" py="xl">
          <ThemeIcon size={80} radius={40} color="green">
            <IconCheck size={40} />
          </ThemeIcon>
          
          <Title order={3} mt="xl" c="green.7">Siparişiniz Başarıyla Alındı!</Title>
          
          <Text mt="md" size="lg">
            Sipariş numaranız: <Badge size="lg" variant="dot">{newOrderId?.substring(0, 8)}</Badge>
          </Text>
          
          <Text mt="md" mb="xl" c="dimmed">
            Siparişinizin durumunu &quot;Siparişlerim&quot; sayfasından takip edebilirsiniz.
          </Text>
          
          <Button 
            onClick={() => navigate('/orders')}
            fullWidth
            size="lg"
            leftSection={<IconPackage size={20} />}
          >
            Siparişlerime Git
          </Button>
        </Box>
      </Modal>
    </Container>
  );
} 