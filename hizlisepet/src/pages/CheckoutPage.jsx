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
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      <Box mb="xl">
        <Title order={2} mb="md">Ödeme İşlemi</Title>
        <Text color="dimmed">Siparişinizi güvenle tamamlayın</Text>
      </Box>

      <Grid>
        <Grid.Col span={8}>
          <Paper shadow="xs" p="md" radius="md">
            <Stepper active={activeStep} breakpoint="sm" allowNextStepsSelect={false}>
              <Stepper.Step
                label="Teslimat Bilgileri"
                icon={<IconMapPin size={18} />}
                description="Adres bilgileriniz"
              >
                <Box mt="xl">
                  <Title order={4} mb="md">Teslimat Adresi</Title>
                  
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        label="Ad Soyad"
                        placeholder="Ad Soyad giriniz"
                        value={shippingForm.fullName}
                        onChange={(e) => handleShippingFormChange('fullName', e.target.value)}
                        icon={<IconUser size={16} />}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <TextInput
                        label="Telefon"
                        placeholder="Telefon numarası giriniz"
                        value={shippingForm.phone}
                        onChange={(e) => handleShippingFormChange('phone', e.target.value)}
                        icon={<IconPhone size={16} />}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={12}>
                      <Textarea
                        label="Adres"
                        placeholder="Açık adres giriniz"
                        value={shippingForm.address}
                        onChange={(e) => handleShippingFormChange('address', e.target.value)}
                        icon={<IconHome size={16} />}
                        minRows={3}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={4}>
                      <TextInput
                        label="Şehir"
                        placeholder="Şehir giriniz"
                        value={shippingForm.city}
                        onChange={(e) => handleShippingFormChange('city', e.target.value)}
                        icon={<IconMapPin size={16} />}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={4}>
                      <TextInput
                        label="İlçe"
                        placeholder="İlçe giriniz"
                        value={shippingForm.district}
                        onChange={(e) => handleShippingFormChange('district', e.target.value)}
                        icon={<IconMapPin size={16} />}
                        required
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={4}>
                      <TextInput
                        label="Posta Kodu"
                        placeholder="Posta kodu giriniz"
                        value={shippingForm.postalCode}
                        onChange={(e) => handleShippingFormChange('postalCode', e.target.value)}
                        icon={<IconMailbox size={16} />}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Ödeme Bilgileri"
                icon={<IconCreditCard size={18} />}
                description="Ödeme yöntemi seçin"
              >
                <Box mt="xl">
                  <Title order={4} mb="md">Ödeme Yöntemi</Title>
                  
                  <RadioGroup
                    value={paymentForm.paymentMethod}
                    onChange={handlePaymentMethodChange}
                    mb="md"
                  >
                    <Stack>
                      <Radio value="credit_card" label="Kredi Kartı" />
                      <Radio value="cash_on_delivery" label="Kapıda Ödeme" />
                    </Stack>
                  </RadioGroup>

                  {showCardForm && (
                    <Grid>
                      <Grid.Col span={12}>
                        <TextInput
                          label="Kart Sahibi"
                          placeholder="Kart üzerindeki ismi giriniz"
                          value={paymentForm.cardHolder}
                          onChange={(e) => handlePaymentFormChange('cardHolder', e.target.value)}
                          icon={<IconUser size={16} />}
                          required
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={12}>
                        <TextInput
                          label="Kart Numarası"
                          placeholder="1234 5678 9012 3456"
                          value={paymentForm.cardNumber}
                          onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value)}
                          icon={<IconCreditCard size={16} />}
                          required
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={4}>
                        <TextInput
                          label="Son Kullanma Ayı"
                          placeholder="MM"
                          value={paymentForm.expireMonth}
                          onChange={(e) => handlePaymentFormChange('expireMonth', e.target.value)}
                          required
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={4}>
                        <TextInput
                          label="Son Kullanma Yılı"
                          placeholder="YY"
                          value={paymentForm.expireYear}
                          onChange={(e) => handlePaymentFormChange('expireYear', e.target.value)}
                          required
                        />
                      </Grid.Col>
                      
                      <Grid.Col span={4}>
                        <TextInput
                          label="CVV"
                          placeholder="123"
                          value={paymentForm.cvv}
                          onChange={(e) => handlePaymentFormChange('cvv', e.target.value)}
                          icon={<IconLock size={16} />}
                          required
                        />
                      </Grid.Col>
                    </Grid>
                  )}
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Onay"
                icon={<IconCheck size={18} />}
                description="Siparişi tamamlayın"
              >
                <Box mt="xl">
                  <Title order={4} mb="md">Sipariş Özeti</Title>
                  
                  <Stack spacing="md">
                    <Box>
                      <Text weight={500} mb="xs">Teslimat Bilgileri</Text>
                      <Text>{shippingForm.fullName}</Text>
                      <Text>{shippingForm.phone}</Text>
                      <Text>{shippingForm.address}</Text>
                      <Text>{shippingForm.district}, {shippingForm.city}</Text>
                      <Text>{shippingForm.postalCode}</Text>
                    </Box>

                    <Box>
                      <Text weight={500} mb="xs">Ödeme Bilgileri</Text>
                      <Text>
                        {paymentForm.paymentMethod === 'credit_card' 
                          ? 'Kredi Kartı ile Ödeme'
                          : 'Kapıda Ödeme'
                        }
                      </Text>
                      {paymentForm.paymentMethod === 'credit_card' && (
                        <Text>
                          {paymentForm.cardNumber.slice(-4).padStart(16, '*')}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text weight={500} mb="xs">Ürünler</Text>
                      {cartItems.map((item) => (
                        <Box key={item.id} mb="xs">
                          <Group position="apart">
                            <Text>{item.name}</Text>
                            <Text>{formatPrice(item.price * item.quantity)} TL</Text>
                          </Group>
                          <Text size="sm" color="dimmed">Adet: {item.quantity}</Text>
                        </Box>
                      ))}
                    </Box>

                    <Divider />

                    <Group position="apart">
                      <Text weight={500}>Toplam Tutar:</Text>
                      <Text weight={700} size="lg">{formatPrice(getCartTotal())} TL</Text>
                    </Group>
                  </Stack>
                </Box>
              </Stepper.Step>
            </Stepper>

            <Group position="apart" mt="xl">
              {activeStep > 0 && (
                <Button
                  variant="default"
                  onClick={handlePreviousStep}
                  leftIcon={<IconArrowLeft size={16} />}
                >
                  Geri
                </Button>
              )}
              
              {activeStep < 2 ? (
                <Button
                  onClick={handleNextStep}
                  rightIcon={<IconArrowRight size={16} />}
                >
                  Devam Et
                </Button>
              ) : (
                <Button
                  color="green"
                  onClick={handleCompleteOrder}
                  rightIcon={<IconCheck size={16} />}
                >
                  Siparişi Tamamla
                </Button>
              )}
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper shadow="xs" p="md" radius="md">
            <Title order={4} mb="md">Sepet Özeti</Title>
            
            <Stack spacing="md">
              {cartItems.map((item) => (
                <Card key={item.id} p="xs" radius="sm" withBorder>
                  <Group noWrap spacing="sm">
                    <Image
                      src={item.image}
                      width={60}
                      height={60}
                      radius="sm"
                      alt={item.name}
                    />
                    <Box style={{ flex: 1 }}>
                      <Text lineClamp={2}>{item.name}</Text>
                      <Group position="apart" mt="xs">
                        <Text size="sm" color="dimmed">Adet: {item.quantity}</Text>
                        <Text weight={500}>{formatPrice(item.price * item.quantity)} TL</Text>
                      </Group>
                    </Box>
                  </Group>
                </Card>
              ))}

              <Divider />

              <Group position="apart">
                <Text>Ara Toplam:</Text>
                <Text>{formatPrice(getCartTotal())} TL</Text>
              </Group>

              <Group position="apart">
                <Text>Kargo:</Text>
                <Badge color="green">Ücretsiz</Badge>
              </Group>

              <Divider />

              <Group position="apart">
                <Text weight={500}>Toplam:</Text>
                <Text weight={700} size="lg">{formatPrice(getCartTotal())} TL</Text>
              </Group>
            </Stack>
          </Paper>

          <Alert
            icon={<IconTruck size={16} />}
            title="Kargo Bilgisi"
            color="blue"
            radius="md"
            mt="md"
          >
            <Text size="sm">
              Siparişiniz 3-5 iş günü içerisinde kargoya verilecektir.
            </Text>
          </Alert>
        </Grid.Col>
      </Grid>

      <Modal
        opened={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Sipariş Başarılı!"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack align="center" spacing="md">
          <ThemeIcon
            color="green"
            size={60}
            radius="xl"
          >
            <IconCheck size={30} />
          </ThemeIcon>
          
          <Text align="center" size="lg">
            Siparişiniz başarıyla oluşturuldu!
          </Text>
          
          <Text align="center" color="dimmed">
            Sipariş numaranız: #{newOrderId}
          </Text>
          
          <Button
            fullWidth
            onClick={() => navigate('/orders')}
            leftIcon={<IconPackage size={16} />}
          >
            Siparişlerimi Görüntüle
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
} 