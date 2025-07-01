import { useState, useRef, useEffect } from 'react';
import { Drawer, Button, ActionIcon, Group, Text, ScrollArea, Loader, Box, Badge, Paper, Stack } from '@mantine/core';
import { IconChevronLeft, IconMessageCircle2, IconRobot, IconUser } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function ChatShortcut() {
  const [opened, setOpened] = useState(false);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Hazır soru şablonları
  const quickQuestions = [
    { id: 1, text: "Siparişlerimi göster", type: "orders" },
    { id: 2, text: "Favori ürünlerimi listele", type: "favorites" },
    { id: 3, text: "Sepetimde neler var?", type: "cart" },
    { id: 4, text: "Hesabım hakkında bilgi", type: "profile" },
    { id: 5, text: "Son sipariş durumum nedir?", type: "latest_order" },
    { id: 6, text: "Hangi kategorilerde ürün var?", type: "categories" },
    { id: 7, text: "En popüler ürünler", type: "popular_products" },
    { id: 8, text: "İndirimli ürünler", type: "discounted_products" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setOpened((prev) => !prev);
    if (!opened && messages.length === 0) {
      // İlk açılışta hoş geldin mesajı
      addBotMessage("👋 Merhaba! Size nasıl yardımcı olabilirim? Lütfen aşağıdaki seçeneklerden birini seçin.");
    }
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const getUserOrders = async () => {
    if (!user) return null;
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            price,
            products (name, brand)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return orders;
    } catch (ercd ror) {
      console.error('Siparişler alınırken hata:', error);
      return null;
    }
  };

  const getUserFavorites = async () => {
    if (!user) return null;
    try {
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          products (
            id,
            name,
            brand,
            price,
            discount_price,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .limit(10);

      if (error) throw error;
      return favorites;
    } catch (error) {
      console.error('Favoriler alınırken hata:', error);
      return null;
    }
  };

  const getUserCart = async () => {
    if (!user) return null;
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          price,
          products (
            name,
            brand,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return cartItems;
    } catch (error) {
      console.error('Sepet alınırken hata:', error);
      return null;
    }
  };

  const getCategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('name, description')
        .order('name');

      if (error) throw error;
      return categories;
    } catch (error) {
      console.error('Kategoriler alınırken hata:', error);
      return null;
    }
  };

  const getPopularProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('name, brand, price, rating')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(5);

      if (error) throw error;
      return products;
    } catch (error) {
      console.error('Popüler ürünler alınırken hata:', error);
      return null;
    }
  };

  const getDiscountedProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('name, brand, price, discount_price, discount_rate')
        .not('discount_price', 'is', null)
        .order('discount_rate', { ascending: false })
        .limit(5);

      if (error) throw error;
      return products;
    } catch (error) {
      console.error('İndirimli ürünler alınırken hata:', error);
      return null;
    }
  };

  const processQuestion = async (questionType, questionText) => {
    setIsLoading(true);
    addUserMessage(questionText);

    try {
      switch (questionType) {
        case 'orders': {
          if (!user) {
            addBotMessage("❌ Siparişlerinizi görmek için giriş yapmanız gerekiyor.");
            break;
          }
          const orders = await getUserOrders();
          if (orders && orders.length > 0) {
            let response = `📦 Son ${orders.length} siparişiniz:\n\n`;
            orders.forEach((order, index) => {
              const date = new Date(order.created_at).toLocaleDateString('tr-TR');
              const statusEmoji = order.status === 'delivered' ? '✅' : order.status === 'shipped' ? '🚚' : order.status === 'confirmed' ? '✔️' : '⏳';
              response += `${index + 1}. ${statusEmoji} Sipariş #${order.id.slice(-8)} - ${order.total_amount}₺ (${date})\n`;
              response += `   Durum: ${order.status === 'pending' ? 'Beklemede' : order.status === 'confirmed' ? 'Onaylandı' : order.status === 'shipped' ? 'Kargoda' : order.status === 'delivered' ? 'Teslim Edildi' : order.status}\n`;
              if (order.order_items && order.order_items.length > 0) {
                response += `   Ürünler: ${order.order_items.map(item => `${item.products.name} (${item.quantity}x)`).join(', ')}\n`;
              }
              response += '\n';
            });
            addBotMessage(response);
          } else {
            addBotMessage("📦 Henüz hiç siparişiniz bulunmuyor. Alışverişe başlamak için ana sayfayı ziyaret edebilirsiniz!");
          }
          break;
        }

        case 'favorites': {
          if (!user) {
            addBotMessage("❌ Favori ürünlerinizi görmek için giriş yapmanız gerekiyor.");
            break;
          }
          const favorites = await getUserFavorites();
          if (favorites && favorites.length > 0) {
            let response = `❤️ Favori ürünleriniz (${favorites.length} adet):\n\n`;
            favorites.forEach((fav, index) => {
              const product = fav.products;
              const price = product.discount_price || product.price;
              response += `${index + 1}. ${product.name} - ${product.brand}\n`;
              response += `   💰 ${price}₺\n\n`;
            });
            addBotMessage(response);
          } else {
            addBotMessage("❤️ Henüz favori ürününüz bulunmuyor. Beğendiğiniz ürünleri kalp simgesine tıklayarak favorilerinize ekleyebilirsiniz!");
          }
          break;
        }

        case 'cart': {
          if (!user) {
            addBotMessage("❌ Sepetinizi görmek için giriş yapmanız gerekiyor.");
            break;
          }
          const cartItems = await getUserCart();
          if (cartItems && cartItems.length > 0) {
            let response = `🛒 Sepetinizde ${cartItems.length} farklı ürün var:\n\n`;
            let totalAmount = 0;
            cartItems.forEach((item, index) => {
              const itemTotal = item.quantity * item.price;
              totalAmount += itemTotal;
              response += `${index + 1}. ${item.products.name} - ${item.products.brand}\n`;
              response += `   Adet: ${item.quantity} x ${item.price}₺ = ${itemTotal}₺\n\n`;
            });
            response += `💰 Toplam: ${totalAmount.toFixed(2)}₺`;
            addBotMessage(response);
          } else {
            addBotMessage("🛒 Sepetiniz şu anda boş. Alışverişe başlamak için ana sayfayı ziyaret edebilirsiniz!");
          }
          break;
        }

        case 'profile': {
          if (!user) {
            addBotMessage("❌ Hesap bilgilerinizi görmek için giriş yapmanız gerekiyor.");
            break;
          }
          let profileResponse = `👤 Hesap Bilgileriniz:\n\n`;
          profileResponse += `📧 E-posta: ${user.email}\n`;
          profileResponse += `🏷️ Rol: ${profile?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}\n`;
          if (profile?.created_at) {
            const joinDate = new Date(profile.created_at).toLocaleDateString('tr-TR');
            profileResponse += `📅 Kayıt Tarihi: ${joinDate}\n`;
          }
          addBotMessage(profileResponse);
          break;
        }

        case 'latest_order': {
          if (!user) {
            addBotMessage("❌ Sipariş durumunuzu görmek için giriş yapmanız gerekiyor.");
            break;
          }
          const latestOrders = await getUserOrders();
          if (latestOrders && latestOrders.length > 0) {
            const latestOrder = latestOrders[0];
            const date = new Date(latestOrder.created_at).toLocaleDateString('tr-TR');
            const statusEmoji = latestOrder.status === 'delivered' ? '✅' : latestOrder.status === 'shipped' ? '🚚' : latestOrder.status === 'confirmed' ? '✔️' : '⏳';
            let response = `📦 Son siparişiniz:\n\n`;
            response += `${statusEmoji} Sipariş #${latestOrder.id.slice(-8)}\n`;
            response += `💰 Tutar: ${latestOrder.total_amount}₺\n`;
            response += `📅 Tarih: ${date}\n`;
            response += `📊 Durum: ${latestOrder.status === 'pending' ? 'Beklemede' : latestOrder.status === 'confirmed' ? 'Onaylandı' : latestOrder.status === 'shipped' ? 'Kargoda' : latestOrder.status === 'delivered' ? 'Teslim Edildi' : latestOrder.status}\n`;
            addBotMessage(response);
          } else {
            addBotMessage("📦 Henüz hiç siparişiniz bulunmuyor.");
          }
          break;
        }

        case 'categories': {
          const categories = await getCategories();
          if (categories && categories.length > 0) {
            let response = `📂 Mevcut kategorilerimiz:\n\n`;
            categories.forEach((cat, index) => {
              response += `${index + 1}. ${cat.name}\n`;
              if (cat.description) {
                response += `   ${cat.description}\n`;
              }
              response += '\n';
            });
            addBotMessage(response);
          } else {
            addBotMessage("📂 Şu anda kategori bilgisi alınamıyor.");
          }
          break;
        }

        case 'popular_products': {
          const popularProducts = await getPopularProducts();
          if (popularProducts && popularProducts.length > 0) {
            let response = `⭐ En popüler ürünlerimiz:\n\n`;
            popularProducts.forEach((product, index) => {
              response += `${index + 1}. ${product.name} - ${product.brand}\n`;
              response += `   💰 ${product.price}₺ | ⭐ ${product.rating}/5\n\n`;
            });
            addBotMessage(response);
          } else {
            addBotMessage("⭐ Şu anda popüler ürün bilgisi alınamıyor.");
          }
          break;
        }

        case 'discounted_products': {
          const discountedProducts = await getDiscountedProducts();
          if (discountedProducts && discountedProducts.length > 0) {
            let response = `🏷️ İndirimli ürünlerimiz:\n\n`;
            discountedProducts.forEach((product, index) => {
              response += `${index + 1}. ${product.name} - ${product.brand}\n`;
              response += `   💰 ${product.discount_price}₺ (eski fiyat: ${product.price}₺)\n`;
              response += `   🏷️ %${product.discount_rate} indirim\n\n`;
            });
            addBotMessage(response);
          } else {
            addBotMessage("🏷️ Şu anda indirimli ürün bulunmuyor.");
          }
          break;
        }

        default:
          // Genel soru yanıtlama
          addBotMessage("🤔 Üzgünüm, bu konuda size yardımcı olamam. Lütfen yukarıdaki seçeneklerden birini seçin.");
      }
    } catch (error) {
      console.error('Soru işlenirken hata:', error);
      addBotMessage("❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    processQuestion(question.type, question.text);
  };



  // Mobilde tam ekran, masaüstünde telefon gibi ortalanmış panel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size={isMobile ? '100%' : 400}
        padding={0}
        withCloseButton={false}
        overlayProps={{ opacity: 0.3, blur: 2 }}
        styles={{
          content: {
            background: '#f8fafc',
            borderTopLeftRadius: isMobile ? 0 : 32,
            borderBottomLeftRadius: isMobile ? 0 : 32,
            borderTopRightRadius: isMobile ? 0 : 32,
            borderBottomRightRadius: isMobile ? 0 : 32,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            margin: isMobile ? 0 : '32px 0',
            height: isMobile ? '100vh' : '90vh',
            maxWidth: isMobile ? '100vw' : 400,
            right: isMobile ? 0 : 32,
            top: isMobile ? 0 : '5vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 0,
          },
          body: { padding: 0, width: '100%', height: '100%' },
        }}
      >
        {/* Hoparlör çentiği efekti */}
        <div style={{ width: 60, height: 8, background: '#e0e3e7', borderRadius: 8, margin: '18px auto 18px auto' }} />
        
        {/* Başlık barı */}
        <Group justify="space-between" align="center" px={16} py={6} style={{ borderBottom: '1px solid #e9ecef', width: '100%', minHeight: 38 }}>
          <Group>
            <IconRobot size={20} />
            <Text fw={700} size="md">AI Asistan</Text>
          </Group>
          <ActionIcon variant="light" color="blue" size={32} onClick={() => setOpened(false)}>
            <IconChevronLeft size={16} />
          </ActionIcon>
        </Group>

        {/* Mesajlar alanı */}
        <ScrollArea 
          ref={scrollAreaRef}
          style={{ flex: 1, width: '100%' }} 
          px={16} 
          py={8}
        >
          <Stack gap="md">
            {/* Hazır sorular - her zaman görünür */}
            <Box>
              <Text size="sm" c="dimmed" mb="xs">💡 Nasıl yardımcı olabilirim?</Text>
              <Stack gap="xs">
                {quickQuestions.map((question) => (
                  <Button
                    key={question.id}
                    variant="light"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    style={{ justifyContent: 'flex-start' }}
                    disabled={isLoading}
                  >
                    {question.text}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Mesajlar */}
            {messages.map((message) => (
              <Paper
                key={message.id}
                p="sm"
                style={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: message.sender === 'user' ? '#228be6' : '#fff',
                  color: message.sender === 'user' ? '#fff' : '#000',
                  maxWidth: '85%',
                  borderRadius: 12,
                  border: message.sender === 'bot' ? '1px solid #e9ecef' : 'none'
                }}
              >
                <Group gap="xs" mb={message.text.length > 50 ? 4 : 0}>
                  {message.sender === 'bot' ? <IconRobot size={16} /> : <IconUser size={16} />}
                  <Badge size="xs" variant="light" color={message.sender === 'user' ? 'blue' : 'gray'}>
                    {message.sender === 'user' ? 'Siz' : 'Asistan'}
                  </Badge>
                </Group>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                  {message.text}
                </Text>
              </Paper>
            ))}

            {isLoading && (
              <Paper p="sm" style={{ alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 12 }}>
                <Group>
                  <Loader size="xs" />
                  <Text size="sm" c="dimmed">Düşünüyor...</Text>
                </Group>
              </Paper>
            )}
          </Stack>
          <div ref={messagesEndRef} />
        </ScrollArea>


      </Drawer>

      <Button
        onClick={handleToggle}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 32,
          zIndex: 9999,
          borderRadius: '50%',
          width: 60,
          height: 60,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          padding: 0,
          background: '#228be6',
          color: '#fff',
          fontSize: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        variant="filled"
        size="xl"
        aria-label="AI Asistan"
      >
        <IconMessageCircle2 size={32} />
      </Button>
    </>
  );
}
