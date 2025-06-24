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
  Modal
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
  IconHome2
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
      
      <Paper p="md" withBorder radius="md" mb="xl">
        {activeStep === 0 && (
          <>
            <Title order={3} mb="md">Teslimat Bilgileri</Title>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Ad Soyad"
                  placeholder="Ad Soyad"
                  value={shippingForm.fullName}
                  onChange={(e) => handleShippingFormChange('fullName', e.target.value)}
                  required
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Telefon"
                  placeholder="0(5XX) XXX XX XX"
                  value={shippingForm.phone}
                  onChange={(e) => handleShippingFormChange('phone', e.target.value)}
                  required
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={12}>
                <Textarea
                  label="Adres"
                  placeholder="Adres"
                  value={shippingForm.address}
                  onChange={(e) => handleShippingFormChange('address', e.target.value)}
                  required
                  mb="md"
                  minRows={3}
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Şehir"
                  placeholder="Şehir"
                  value={shippingForm.city}
                  onChange={(e) => handleShippingFormChange('city', e.target.value)}
                  required
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="İlçe"
                  placeholder="İlçe"
                  value={shippingForm.district}
                  onChange={(e) => handleShippingFormChange('district', e.target.value)}
                  required
                  mb="md"
                />
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Posta Kodu"
                  placeholder="Posta Kodu"
                  value={shippingForm.postalCode}
                  onChange={(e) => handleShippingFormChange('postalCode', e.target.value)}
                  mb="md"
                />
              </Grid.Col>
            </Grid>
            
            <Group justify="flex-end" mt="xl">
              <Button
                onClick={handleNextStep}
                rightSection={<IconTruck size={16} />}
              >
                Devam Et
              </Button>
            </Group>
          </>
        )}
        
        {activeStep === 1 && (
          <>
            <Title order={3} mb="md">Ödeme Bilgileri</Title>
            
            <Radio.Group
              label="Ödeme Yöntemi"
              value={paymentForm.paymentMethod}
              onChange={handlePaymentMethodChange}
              mb="lg"
            >
              <Group mt="xs">
                <Radio value="credit_card" label="Kredi Kartı" />
                <Radio value="cash_on_delivery" label="Kapıda Ödeme" />
              </Group>
            </Radio.Group>
            
            {showCardForm && (
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    label="Kart Üzerindeki İsim"
                    placeholder="Kart Üzerindeki İsim"
                    value={paymentForm.cardHolder}
                    onChange={(e) => handlePaymentFormChange('cardHolder', e.target.value)}
                    required
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={12}>
                  <TextInput
                    label="Kart Numarası"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handlePaymentFormChange('cardNumber', e.target.value.replace(/\D/g, '').substring(0, 16))}
                    required
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Son Kullanma Ayı"
                    placeholder="Ay"
                    value={paymentForm.expireMonth}
                    onChange={(value) => handlePaymentFormChange('expireMonth', value)}
                    data={[
                      { value: '01', label: '01' },
                      { value: '02', label: '02' },
                      { value: '03', label: '03' },
                      { value: '04', label: '04' },
                      { value: '05', label: '05' },
                      { value: '06', label: '06' },
                      { value: '07', label: '07' },
                      { value: '08', label: '08' },
                      { value: '09', label: '09' },
                      { value: '10', label: '10' },
                      { value: '11', label: '11' },
                      { value: '12', label: '12' }
                    ]}
                    required
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Son Kullanma Yılı"
                    placeholder="Yıl"
                    value={paymentForm.expireYear}
                    onChange={(value) => handlePaymentFormChange('expireYear', value)}
                    data={Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString();
                      return { value: year, label: year };
                    })}
                    required
                    mb="md"
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    label="CVV"
                    placeholder="XXX"
                    value={paymentForm.cvv}
                    onChange={(e) => handlePaymentFormChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 3))}
                    required
                    mb="md"
                  />
                </Grid.Col>
              </Grid>
            )}
            
            {!showCardForm && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Kapıda Ödeme"
                color="blue"
                variant="light"
                mb="md"
              >
                Siparişiniz, belirttiğiniz adrese teslim edildiğinde kapıda ödeme yapabilirsiniz.
                Kapıda ödeme ek ücreti: 15 TL
              </Alert>
            )}
            
            <Group justify="space-between" mt="xl">
              <Button variant="outline" onClick={handlePreviousStep}>
                Geri
              </Button>
              <Button onClick={handleNextStep}>
                Devam Et
              </Button>
            </Group>
          </>
        )}
        
        {activeStep === 2 && (
          <>
            <Title order={3} mb="md">Sipariş Özeti</Title>
            
            <Box mb="lg">
              <Title order={5} mb="sm">Teslimat Adresi</Title>
              <Card withBorder p="sm">
                <Group align="flex-start" mb="xs">
                  <IconHome2 size={18} />
                  <Box>
                    <Text fw={500}>{shippingForm.fullName}</Text>
                    <Text size="sm">{shippingForm.address}</Text>
                    <Text size="sm">{shippingForm.district}/{shippingForm.city} {shippingForm.postalCode}</Text>
                    <Text size="sm">Tel: {shippingForm.phone}</Text>
                  </Box>
                </Group>
              </Card>
            </Box>
            
            <Box mb="lg">
              <Title order={5} mb="sm">Ödeme Bilgileri</Title>
              <Card withBorder p="sm">
                <Text>
                  {paymentForm.paymentMethod === 'credit_card' 
                    ? `Kredi Kartı (${paymentForm.cardNumber.slice(-4)})` 
                    : 'Kapıda Ödeme'}
                </Text>
              </Card>
            </Box>
            
            <Box mb="lg">
              <Title order={5} mb="sm">Sipariş Öğeleri</Title>
              {cartItems.map((item) => (
                <Card key={item.id} withBorder p="sm" mb="sm">
                  <Group>
                    <Image
                      src={item.product.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                      width={60}
                      height={60}
                      fit="contain"
                    />
                    <Box style={{ flex: 1 }}>
                      <Group position="apart">
                        <Text fw={500}>{item.product.name}</Text>
                        <Text fw={500}>{formatPrice((item.price || item.product.price) * item.quantity)}</Text>
                      </Group>
                      <Text size="sm" c="dimmed">Miktar: {item.quantity}</Text>
                    </Box>
                  </Group>
                </Card>
              ))}
            </Box>
            
            <Box>
              <Card withBorder p="md">
                <Group justify="space-between" mb="xs">
                  <Text>Ürünler Toplamı:</Text>
                  <Text>{formatPrice(totalAmount)}</Text>
                </Group>
                
                <Group justify="space-between" mb="xs">
                  <Text>İndirim:</Text>
                  <Text c="green">-{formatPrice(totalAmount - discountedTotal)}</Text>
                </Group>
                
                <Group justify="space-between" mb="xs">
                  <Text>Kargo:</Text>
                  <Text>Ücretsiz</Text>
                </Group>
                
                {paymentForm.paymentMethod === 'cash_on_delivery' && (
                  <Group justify="space-between" mb="xs">
                    <Text>Kapıda Ödeme Ücreti:</Text>
                    <Text>+15,00 TL</Text>
                  </Group>
                )}
                
                <Divider my="sm" />
                
                <Group justify="space-between">
                  <Text fw={700} size="lg">Toplam:</Text>
                  <Text fw={700} size="lg" c="blue">
                    {formatPrice(discountedTotal + (paymentForm.paymentMethod === 'cash_on_delivery' ? 15 : 0))}
                  </Text>
                </Group>
              </Card>
            </Box>
            
            <Group justify="space-between" mt="xl">
              <Button variant="outline" onClick={handlePreviousStep}>
                Geri
              </Button>
              <Button 
                color="green" 
                onClick={handleCompleteOrder}
                leftSection={<IconShoppingCart size={16} />}
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
        title="Siparişiniz Alındı"
        centered
        size="md"
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
      >
        <Box ta="center" py="md">
          <IconCheck size={50} color="green" />
          <Title order={3} mt="md">Siparişiniz Başarıyla Alındı!</Title>
          <Text mt="sm">
            Sipariş numaranız: <Text span fw={700}>{newOrderId?.substring(0, 8)}</Text>
          </Text>
          <Text mt="sm" mb="lg">
            Siparişinizin durumunu &quot;Siparişlerim&quot; sayfasından takip edebilirsiniz.
          </Text>
          
          <Button 
            onClick={() => navigate('/orders')}
            fullWidth
          >
            Siparişlerime Git
          </Button>
        </Box>
      </Modal>
    </Container>
  );
} 