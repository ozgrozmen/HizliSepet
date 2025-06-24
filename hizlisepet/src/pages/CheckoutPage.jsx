import React, { useState, useEffect, useRef } from 'react';
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

// Telefon numarasını (5XX) XXX XX XX formatına çeviren fonksiyon
function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  let formatted = '';
  if (digits.length <= 3) {
    formatted = `(${digits}`;
    if (digits.length === 3) formatted += ')';
    return formatted;
  }
  formatted = `(${digits.slice(0, 3)})`;
  if (digits.length <= 6) {
    formatted += ` ${digits.slice(3)}`;
    return formatted;
  }
  if (digits.length <= 8) {
    formatted += ` ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return formatted;
  }
  formatted += ` ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  return formatted.trim();
}

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
  
  // Telefon inputu için ref
  const phoneInputRef = useRef(null);
  
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
    if (!shippingForm.fullName?.trim()) return 'Ad Soyad bilgisi gereklidir';
    if (shippingForm.fullName.trim().length < 3) return 'Ad Soyad en az 3 karakter olmalıdır';
    
    if (!shippingForm.phone?.trim()) return 'Telefon numarası gereklidir';
    const phoneDigits = shippingForm.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) return 'Geçerli bir telefon numarası giriniz';
    if (phoneDigits[0] !== '5') return 'Telefon numarası 5 ile başlamalıdır';
    
    if (!shippingForm.address?.trim()) return 'Adres bilgisi gereklidir';
    if (shippingForm.address.trim().length < 10) return 'Lütfen daha detaylı bir adres giriniz';
    
    if (!shippingForm.city?.trim()) return 'Şehir bilgisi gereklidir';
    if (!shippingForm.district?.trim()) return 'İlçe bilgisi gereklidir';
    
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
      
      // Form validasyonu
      const shippingError = validateShippingForm();
      if (shippingError) {
        throw new Error(shippingError);
      }

      // Telefon numarası kontrolü
      const phoneDigits = shippingForm.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        throw new Error('Lütfen geçerli bir telefon numarası girin');
      }

      // Sipariş özeti
      const totalAmount = getCartTotal();
      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Geçersiz sipariş tutarı');
      }

      const discountedTotal = totalAmount * 0.9; // %10 indirim
      const paymentMethod = paymentForm.paymentMethod === 'credit_card' 
        ? `Kredi Kartı (${paymentForm.cardNumber.slice(-4)})` 
        : 'Kapıda Ödeme';

      // Shipping address JSON formatında
      const shippingAddressJson = {
        fullName: shippingForm.fullName.trim(),
        address: shippingForm.address.trim(),
        city: shippingForm.city.trim(),
        district: shippingForm.district.trim(),
        postalCode: shippingForm.postalCode.trim(),
        phone: phoneDigits
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
            phone: phoneDigits
          }
        ])
        .select();
      
      if (orderError) {
        console.error('Sipariş oluşturulurken hata:', orderError);
        throw new Error('Sipariş oluşturulamadı: ' + orderError.message);
      }

      if (!orderData || orderData.length === 0) {
        throw new Error('Sipariş oluşturulamadı: Veri döndürülemedi');
      }
      
      const orderId = orderData[0].id;
      setNewOrderId(orderId);
      
      // Sipariş öğelerini hazırla ve kontrol et
      const orderItems = cartItems.map(item => {
        if (!item.product_id || !item.quantity || !item.price) {
          throw new Error('Geçersiz ürün bilgisi');
        }

        const itemPrice = Number(item.price);
        const itemQuantity = Number(item.quantity);
        
        if (isNaN(itemPrice) || isNaN(itemQuantity) || itemPrice <= 0 || itemQuantity <= 0) {
          throw new Error('Geçersiz ürün fiyatı veya miktarı');
        }

        const itemTotal = itemPrice * itemQuantity;
        
        return {
          order_id: orderId,
          product_id: item.product_id,
          quantity: itemQuantity,
          price: itemPrice,
          total: itemTotal
        };
      });
      
      // Sipariş öğelerini kaydet
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        // Sipariş öğeleri eklenemezse siparişi iptal et
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);
        
        console.error('Sipariş öğeleri oluşturulurken hata:', itemsError);
        throw new Error('Sipariş öğeleri eklenemedi: ' + itemsError.message);
      }
      
      // Sepeti temizle
      await clearCart();
      
      // Başarı mesajı göster
      setSuccessModalOpen(true);
      
    } catch (error) {
      console.error('Sipariş tamamlanırken hata:', error);
      notifications.show({
        title: 'Sipariş Hatası',
        message: error.message || 'Siparişiniz oluşturulurken bir hata oluştu',
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
      
      {/* Sadece onay adımında Paper ile çerçeve göster */}
      {activeStep === 2 ? (
      <Paper p="md" withBorder radius="md" mb="xl">
          {activeStep === 2 && (
            <>
              <Title order={2} mb="lg" ta="center" c="blue.7" style={{ letterSpacing: 1 }}>Sipariş Özeti</Title>
              <Group align="flex-start" grow wrap="wrap" mb="lg" spacing="xl">
                <Box style={{ minWidth: 320, flex: 1 }}>
                  <Card withBorder shadow="md" radius="lg" p="lg" mb="md" style={{ background: '#f8fafc' }}>
                    <Group align="center" mb="sm">
                      <IconHome2 size={22} color="#228be6" />
                      <Title order={5} c="blue.7" style={{ letterSpacing: 0.5 }}>Teslimat Adresi</Title>
                    </Group>
                    <Divider mb="sm" />
                    <Text fw={600}>{shippingForm.fullName}</Text>
                    <Text size="sm" c="dimmed">{shippingForm.address}</Text>
                    <Text size="sm" c="dimmed">{shippingForm.district}/{shippingForm.city} {shippingForm.postalCode}</Text>
                    <Text size="sm" c="blue.7">Tel: {shippingForm.phone}</Text>
                  </Card>
                  <Card withBorder shadow="md" radius="lg" p="lg" mb="md" style={{ background: '#f8fafc' }}>
                    <Group align="center" mb="sm">
                      <IconCreditCard size={20} color="#228be6" />
                      <Title order={5} c="blue.7">Ödeme Bilgileri</Title>
                    </Group>
                    <Divider mb="sm" />
                    <Text fw={500} size="md">
                      {paymentForm.paymentMethod === 'credit_card' 
                        ? `Kredi Kartı (${paymentForm.cardNumber.slice(-4)})` 
                        : 'Kapıda Ödeme'}
                    </Text>
                  </Card>
                </Box>
                <Box style={{ minWidth: 320, flex: 2 }}>
                  <Card withBorder shadow="md" radius="lg" p="lg" mb="md" style={{ background: '#f8fafc' }}>
                    <Group align="center" mb="sm">
                      <IconShoppingCart size={20} color="#228be6" />
                      <Title order={5} c="blue.7">Sipariş Öğeleri</Title>
                    </Group>
                    <Divider mb="sm" />
                    <Group gap="md" style={{ flexWrap: 'wrap' }}>
                      {cartItems.map((item) => (
                        <Card key={item.id} withBorder radius="md" shadow="sm" p="xs" style={{ minWidth: 220, maxWidth: 260, background: '#fff' }}>
                          <Group>
                            <Image
                              src={item.product.image_url || 'https://placehold.co/300x300?text=Ürün+Görseli'}
                              width={60}
                              height={60}
                              fit="contain"
                              radius="md"
                              style={{ background: '#f1f3f5' }}
                            />
                            <Box style={{ flex: 1 }}>
                              <Text fw={600}>{item.product.name}</Text>
                              <Text size="sm" c="dimmed">Miktar: {item.quantity}</Text>
                              <Text fw={600} c="blue.7">{formatPrice((item.price || item.product.price) * item.quantity)}</Text>
                            </Box>
                          </Group>
                        </Card>
                      ))}
                    </Group>
                  </Card>
                  <Card withBorder shadow="md" radius="lg" p="lg" style={{ background: '#e7f5ff' }}>
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
                      <Text fw={700} size="xl" c="blue.7">
                        {formatPrice(discountedTotal + (paymentForm.paymentMethod === 'cash_on_delivery' ? 15 : 0))}
                      </Text>
                    </Group>
                  </Card>
                </Box>
              </Group>
              <Group justify="space-between" mt="xl">
                <Button variant="outline" size="lg" onClick={handlePreviousStep} radius="md">
                  Geri
                </Button>
                <Button 
                  color="green" 
                  size="lg"
                  radius="md"
                  onClick={handleCompleteOrder}
                  leftSection={<IconShoppingCart size={18} />}
                  style={{ minWidth: 200 }}
                >
                  Siparişi Tamamla
                </Button>
              </Group>
            </>
          )}
        </Paper>
      ) : (
        // Teslimat ve ödeme adımlarında Paper olmadan sadece Card göster
        <>
        {activeStep === 0 && (
          <>
              <Title order={2} mb="lg" ta="center" c="blue.7" style={{ letterSpacing: 1 }}>
                <Group justify="center" gap={8}><IconMapPin size={28} color="#228be6" />Teslimat Bilgileri</Group>
              </Title>
              <Card withBorder shadow="md" radius="lg" p="xl" style={{ background: '#f8fafc', maxWidth: 700, margin: '0 auto' }}>
                <Grid gutter="md">
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
                      placeholder="(5XX) XXX XX XX"
                      value={formatPhoneNumber(shippingForm.phone)}
                      maxLength={15}
                      inputMode="numeric"
                      ref={phoneInputRef}
                      onChange={(e) => {
                        let digits = e.target.value.replace(/\D/g, '');
                        if (digits.length > 0 && digits[0] !== '5') digits = '5' + digits.slice(1);
                        digits = digits.slice(0, 10);
                        handleShippingFormChange('phone', digits);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          const input = phoneInputRef.current;
                          const pos = input.selectionStart;
                          const raw = shippingForm.phone;
                          const formatted = formatPhoneNumber(raw);
                          if (pos > 0 && (formatted[pos - 1] === '(' || formatted[pos - 1] === ')' || formatted[pos - 1] === ' ')) {
                            e.preventDefault();
                            let digits = raw.slice(0, raw.length - 1);
                            handleShippingFormChange('phone', digits);
                            setTimeout(() => {
                              input.setSelectionRange(pos - 1, pos - 1);
                            }, 0);
                          }
                        }
                      }}
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
                    rightSection={<IconTruck size={18} />}
                    size="lg"
                    radius="md"
                    style={{ minWidth: 180 }}
              >
                Devam Et
              </Button>
            </Group>
              </Card>
          </>
        )}
        
        {activeStep === 1 && (
          <>
              <Title order={2} mb="lg" ta="center" c="blue.7" style={{ letterSpacing: 1 }}>
                <Group justify="center" gap={8}><IconCreditCard size={26} color="#228be6" />Ödeme Bilgileri</Group>
              </Title>
              <Card withBorder shadow="md" radius="lg" p="xl" style={{ background: '#f8fafc', maxWidth: 700, margin: '0 auto' }}>
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
                  <Grid gutter="md">
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
                    Siparişiniz, belirttiğiniz adrese teslim edildiğinde kapıda ödeme yapabilirsiniz.<br />Kapıda ödeme ek ücreti: 15 TL
              </Alert>
            )}
            <Group justify="space-between" mt="xl">
                  <Button variant="outline" size="lg" onClick={handlePreviousStep} radius="md">
                Geri
              </Button>
                  <Button onClick={handleNextStep} size="lg" color="blue" radius="md" style={{ minWidth: 180 }}>
                Devam Et
              </Button>
                </Group>
              </Card>
            </>
          )}
          </>
        )}
      
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