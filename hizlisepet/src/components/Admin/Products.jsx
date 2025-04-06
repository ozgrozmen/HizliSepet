import { useState, useEffect } from 'react';
import { Table, Button, Text, Group, Modal, TextInput, NumberInput, Select, Textarea, Stack, FileInput, Alert, Box, Badge, Code } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconInfoCircle, IconAlertTriangle, IconShieldOff, IconShield, IconBug, IconApi, IconSearch } from '@tabler/icons-react';
import { supabase, subscribeToTable, updateProduct, testSupabase, updateProductWithFetch, testRLS, updateProductIgnoringRLS, disableRLSTemporarily, debugSupabaseAPI, testRLSWithDirectAPI, analyze400Error } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories] = useState([
    { value: 'Anne & Çocuk', label: 'Anne & Çocuk' },
    { value: 'Ayakkabı & Çanta', label: 'Ayakkabı & Çanta' },
    { value: 'Elektronik', label: 'Elektronik' },
    { value: 'Ev & Yaşam', label: 'Ev & Yaşam' },
    { value: 'Giyim', label: 'Giyim' },
    { value: 'Kozmetik', label: 'Kozmetik' },
    { value: 'Spor & Outdoor', label: 'Spor & Outdoor' },
    { value: 'Süpermarket', label: 'Süpermarket' }
  ]);
  const [subcategories, setSubcategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: 0,
    discount_price: 0,
    discount_rate: 0,
    image_url: '',
    brand: '',
    category: '',
    subcategory: '',
    description: '',
    stock: 0
  });
  const [rlsStatus, setRlsStatus] = useState(null);
  const [isDisablingRLS, setIsDisablingRLS] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isApiTesting, setIsApiTesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Supabase gerçek zamanlı abonelik - WebSocket hatası nedeniyle etkisiz
  useEffect(() => {
    console.log('Gerçek zamanlı abonelik, WebSocket hatası nedeniyle devre dışı bırakıldı.');
    
    // Manuel yenileme için bir zamanlayıcı başlat
    const intervalId = setInterval(() => {
      console.log('Manuel yenileme yapılıyor...');
      fetchProducts();
    }, 30000); // Her 30 saniyede bir yenile
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // refreshTrigger değiştiğinde ürünleri yükle
  useEffect(() => {
    console.log('useEffect tetiklendi, refresh trigger değeri:', refreshTrigger);
    fetchProducts();
  }, [refreshTrigger]);

  useEffect(() => {
    if (formData.category) {
      // Seçilen kategoriye göre alt kategorileri ayarla
      const selectedCategory = formData.category;
      const subcats = {
        'Elektronik': ['Telefon', 'Bilgisayar', 'Tablet', 'TV & Ses Sistemleri', 'Beyaz Eşya', 'Küçük Ev Aletleri', 'Oyun & Oyun Konsolları', 'Foto & Kamera'],
        'Giyim': ['Kadın Giyim', 'Erkek Giyim', 'Elbise', 'Gömlek & Bluz', 'T-shirt & Sweatshirt', 'Pantolon & Şort', 'Etek & Tulum', 'Ceket & Mont', 'Takım Elbise', 'İç Giyim & Pijama', 'Spor Giyim', 'Hamile Giyim', 'Plaj Giyim', 'Büyük Beden', 'Tesettür Giyim', 'Aksesuar'],
        'Ev & Yaşam': ['Mobilya', 'Ev Tekstili', 'Aydınlatma', 'Dekorasyon', 'Mutfak Gereçleri', 'Banyo', 'Ev Düzenleme', 'Bahçe'],
        'Kozmetik': ['Makyaj', 'Parfüm', 'Cilt Bakımı', 'Saç Bakımı', 'Kişisel Bakım', 'Güneş Ürünleri', 'Erkek Bakım', 'Organik Kozmetik'],
        'Anne & Çocuk': ['Bebek Giyim', 'Çocuk Giyim', 'Bebek Bakım', 'Bebek Bezi & Mendil', 'Bebek Arabaları', 'Oto Koltuğu', 'Mama Sandalyesi', 'Oyuncak'],
        'Süpermarket': ['Temel Gıda', 'Atıştırmalık', 'İçecek', 'Kahvaltılık', 'Temizlik', 'Kağıt Ürünleri', 'Kişisel Bakım', 'Ev Bakım'],
        'Ayakkabı & Çanta': ['Kadın Ayakkabı', 'Erkek Ayakkabı', 'Çocuk Ayakkabı', 'Spor Ayakkabı', 'Çanta', 'Cüzdan', 'Sırt Çantası', 'Valiz'],
        'Spor & Outdoor': ['Spor Giyim', 'Spor Ayakkabı', 'Fitness & Kondisyon', 'Outdoor & Kamp', 'Bisiklet', 'Scooter', 'Spor Ekipmanları', 'Sporcu Besinleri']
      };
      setSubcategories(subcats[selectedCategory]?.map(name => ({ value: name, label: name })) || []);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category]);

  // TestSupabase fonksiyonunu çağır
  useEffect(() => {
    async function runTest() {
      const result = await testSupabase();
      console.log('Supabase test sonucu (products.jsx):', result);
    }
    
    runTest();
  }, []);

  // RLS testi yap
  useEffect(() => {
    async function checkRLSPermissions() {
      try {
        console.log('RLS izinleri kontrol ediliyor...');
        const result = await testRLS();
        console.log('RLS test sonucu:', result);
        setRlsStatus(result);
        
        if (!result.success) {
          console.warn('RLS testi başarısız!');
          notifications.show({
            title: 'RLS Politikası Sorunu',
            message: 'Güncelleme izinlerinde sorun olabilir. Detaylar için konsola bakın.',
            color: 'yellow'
          });
        }
      } catch (error) {
        console.error('RLS test hatası:', error);
        setRlsStatus({ success: false, error });
      }
    }
    
    checkRLSPermissions();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      console.log('Basit fetchProducts çağrıldı...');
      
      // Supabase'den ürünleri çek
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ürün yükleme hatası:', error);
        throw error;
      }
      
      console.log(`${data?.length || 0} ürün başarıyla yüklendi`);
      
      // State'i güncelle
      setProducts(data || []);
      
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürünler yüklenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setLoading(true);
      
      // Rastgele dosya adı oluştur
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Görseli yükle
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Görsel yükleme hatası:', uploadError);
        throw uploadError;
      }

      // Yüklenen görselin URL'ini al
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Form verilerini güncelle
      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      notifications.show({
        title: 'Başarılı',
        message: 'Görsel başarıyla yüklendi',
        color: 'green'
      });
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Görsel yüklenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Form verilerini hazırla
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        discount_rate: formData.discount_rate ? Number(formData.discount_rate) : null,
        image_url: formData.image_url || null,
        brand: formData.brand.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description.trim(),
        stock: Number(formData.stock),
        created_at: new Date().toISOString()
      };

      // Zorunlu alanları kontrol et
      if (!productData.name || !productData.price || !productData.brand || 
          !productData.category || !productData.subcategory || !productData.stock) {
        notifications.show({
          title: 'Hata',
          message: 'Lütfen tüm zorunlu alanları doldurun',
          color: 'red'
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla eklendi',
        color: 'green'
      });

      setModalOpen(false);
      setFormData({
        id: null,
        name: '',
        price: 0,
        discount_price: 0,
        discount_rate: 0,
        image_url: '',
        brand: '',
        category: '',
        subcategory: '',
        description: '',
        stock: 0
      });
      
      // Ürün listesini yenilemek için refresh trigger'ı güncelle
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün eklenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    // Önce formu doldur
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price || 0,
      discount_rate: product.discount_rate || 0,
      image_url: product.image_url || '',
      brand: product.brand || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      description: product.description || '',
      stock: product.stock || 0
    });
    
    // Kategori bilgisine göre alt kategorileri yükle
    if (product.category) {
      const selectedCategory = product.category;
      const subcats = {
        'Elektronik': ['Telefon', 'Bilgisayar', 'Tablet', 'TV & Ses Sistemleri', 'Beyaz Eşya', 'Küçük Ev Aletleri', 'Oyun & Oyun Konsolları', 'Foto & Kamera'],
        'Giyim': ['Kadın Giyim', 'Erkek Giyim', 'Elbise', 'Gömlek & Bluz', 'T-shirt & Sweatshirt', 'Pantolon & Şort', 'Etek & Tulum', 'Ceket & Mont', 'Takım Elbise', 'İç Giyim & Pijama', 'Spor Giyim', 'Hamile Giyim', 'Plaj Giyim', 'Büyük Beden', 'Tesettür Giyim', 'Aksesuar'],
        'Ev & Yaşam': ['Mobilya', 'Ev Tekstili', 'Aydınlatma', 'Dekorasyon', 'Mutfak Gereçleri', 'Banyo', 'Ev Düzenleme', 'Bahçe'],
        'Kozmetik': ['Makyaj', 'Parfüm', 'Cilt Bakımı', 'Saç Bakımı', 'Kişisel Bakım', 'Güneş Ürünleri', 'Erkek Bakım', 'Organik Kozmetik'],
        'Anne & Çocuk': ['Bebek Giyim', 'Çocuk Giyim', 'Bebek Bakım', 'Bebek Bezi & Mendil', 'Bebek Arabaları', 'Oto Koltuğu', 'Mama Sandalyesi', 'Oyuncak'],
        'Süpermarket': ['Temel Gıda', 'Atıştırmalık', 'İçecek', 'Kahvaltılık', 'Temizlik', 'Kağıt Ürünleri', 'Kişisel Bakım', 'Ev Bakım'],
        'Ayakkabı & Çanta': ['Kadın Ayakkabı', 'Erkek Ayakkabı', 'Çocuk Ayakkabı', 'Spor Ayakkabı', 'Çanta', 'Cüzdan', 'Sırt Çantası', 'Valiz'],
        'Spor & Outdoor': ['Spor Giyim', 'Spor Ayakkabı', 'Fitness & Kondisyon', 'Outdoor & Kamp', 'Bisiklet', 'Scooter', 'Spor Ekipmanları', 'Sporcu Besinleri']
      };
      setSubcategories(subcats[selectedCategory]?.map(name => ({ value: name, label: name })) || []);
    }
    
    // Modalı aç
    setEditModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla silindi',
        color: 'green'
      });

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün silinirken bir hata oluştu',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      console.log('YENİ düzenleme işlemi başlatılıyor:', formData.id);

      if (!formData.id) {
        throw new Error('Ürün ID bulunamadı');
      }

      // Form verilerini hazırla
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        discount_rate: formData.discount_rate ? Number(formData.discount_rate) : null,
        image_url: formData.image_url || null,
        brand: formData.brand.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description.trim(),
        stock: Number(formData.stock)
      };

      console.log('Güncellenecek veriler:', productData);

      // Zorunlu alanları kontrol et
      if (!productData.name || !productData.price || !productData.brand || 
          !productData.category || !productData.subcategory || !productData.stock) {
        notifications.show({
          title: 'Hata',
          message: 'Lütfen tüm zorunlu alanları doldurun',
          color: 'red'
        });
        return;
      }

      // Eğer RLS sorunu varsa, özel fonksiyonu kullan
      let result;
      if (rlsStatus && !rlsStatus.success && !rlsStatus.update) {
        console.log('RLS sorunu tespit edildi, alternatif güncelleme yöntemi kullanılıyor...');
        result = await updateProductIgnoringRLS(formData.id, productData);
      } else {
        // Normal güncelleme yap
        result = await updateProductWithFetch(formData.id, productData);
      }

      const { data, error } = result;

      if (error) {
        console.error('Güncelleme hatası:', error);
        throw error;
      }
      
      console.log('Güncelleme sonucu:', data);
      
      if (data) {
        // Manuel olarak ürün listesini güncelle
        setProducts(prev => 
          prev.map(product => 
            product.id === formData.id ? data : product
          )
        );
      }

      // Başarı bildirimi göster
      notifications.show({
        title: 'Başarılı',
        message: 'Ürün başarıyla güncellendi',
        color: 'green'
      });

      // Modal'ı kapat ve formu temizle
      setEditModalOpen(false);
      setFormData({
        id: null,
        name: '',
        price: 0,
        discount_price: 0,
        discount_rate: 0,
        image_url: '',
        brand: '',
        category: '',
        subcategory: '',
        description: '',
        stock: 0
      });
      
      // Biraz bekle ve ürün listesini tamamen yenile
      setTimeout(async () => {
        console.log('Tüm ürünler yeniden yükleniyor...');
        await fetchProducts();
      }, 1000);
      
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      notifications.show({
        title: 'Hata',
        message: 'Ürün güncellenirken bir hata oluştu: ' + error.message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // RLS'yi geçici olarak devre dışı bırak
  const handleDisableRLS = async () => {
    try {
      setIsDisablingRLS(true);
      notifications.show({
        title: 'RLS Devre Dışı Bırakılıyor',
        message: 'Lütfen bekleyin...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
        id: 'disable-rls'
      });
      
      const result = await disableRLSTemporarily();
      
      if (result.success) {
        notifications.update({
          id: 'disable-rls',
          title: 'Başarılı',
          message: 'RLS geçici olarak devre dışı bırakıldı. Sayfayı yenileyin.',
          color: 'green',
          loading: false,
          autoClose: 5000
        });
        
        // RLS durumunu güncelle
        setRlsStatus(prev => ({
          ...prev,
          success: true,
          disabled: true,
          message: 'RLS geçici olarak devre dışı bırakıldı'
        }));
        
        // Ürünleri yeniden yükle
        setTimeout(() => {
          fetchProducts();
        }, 1000);
      } else {
        notifications.update({
          id: 'disable-rls',
          title: 'Hata',
          message: `RLS devre dışı bırakılamadı: ${result.error?.message || JSON.stringify(result.error)}`,
          color: 'red',
          loading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('RLS devre dışı bırakma hatası:', error);
      notifications.update({
        id: 'disable-rls',
        title: 'Hata',
        message: `RLS devre dışı bırakma işlemi başarısız: ${error.message}`,
        color: 'red',
        loading: false,
        autoClose: 5000
      });
    } finally {
      setIsDisablingRLS(false);
    }
  };

  // API hata ayıklama
  const handleDebugAPI = async () => {
    try {
      setIsDebugging(true);
      
      notifications.show({
        title: 'API Hata Ayıklama',
        message: 'API isteği test ediliyor...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
        id: 'debug-api'
      });
      
      // Test için products tablosuna istek yap
      const result = await debugSupabaseAPI('products?limit=1');
      
      if (result.success) {
        notifications.update({
          id: 'debug-api',
          title: 'Başarılı',
          message: 'API isteği başarılı. Lütfen konsolu kontrol edin.',
          color: 'green',
          loading: false,
          autoClose: 5000
        });
        
        console.log('API Hata Ayıklama Sonucu:', result);
      } else {
        notifications.update({
          id: 'debug-api',
          title: 'Hata',
          message: `API isteği başarısız: ${result.error?.message || JSON.stringify(result.error)}`,
          color: 'red',
          loading: false,
          autoClose: 5000
        });
        
        console.error('API Hata Ayıklama Hatası:', result);
      }
    } catch (error) {
      console.error('API hata ayıklama genel hatası:', error);
      notifications.update({
        id: 'debug-api',
        title: 'Hata',
        message: `Beklenmeyen hata: ${error.message}`,
        color: 'red',
        loading: false,
        autoClose: 5000
      });
    } finally {
      setIsDebugging(false);
    }
  };

  // API ile RLS testi
  const handleTestAPIRLS = async () => {
    try {
      setIsApiTesting(true);
      
      notifications.show({
        title: 'API RLS Testi',
        message: 'Doğrudan API ile RLS testi yapılıyor...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
        id: 'api-rls-test'
      });
      
      const result = await testRLSWithDirectAPI();
      
      if (result.success) {
        notifications.update({
          id: 'api-rls-test',
          title: 'Başarılı',
          message: 'API RLS testi başarılı. Politikalar düzgün çalışıyor.',
          color: 'green',
          loading: false,
          autoClose: 5000
        });
        
        // RLS durumunu güncelle
        setRlsStatus(prev => ({
          ...prev,
          ...result,
          tested: true
        }));
        
        console.log('API RLS Test Sonucu:', result);
      } else {
        let errorMessage = result.message || 'RLS testi başarısız oldu.';
        
        notifications.update({
          id: 'api-rls-test',
          title: 'RLS Sorunu',
          message: errorMessage.substring(0, 100) + '...',
          color: result.isRLSError ? 'yellow' : 'red',
          loading: false,
          autoClose: false
        });
        
        // RLS durumunu güncelle
        setRlsStatus(prev => ({
          ...prev,
          ...result,
          tested: true
        }));
        
        console.error('API RLS Test Hatası:', result);
      }
    } catch (error) {
      console.error('API RLS test genel hatası:', error);
      notifications.update({
        id: 'api-rls-test',
        title: 'Hata',
        message: `Beklenmeyen hata: ${error.message}`,
        color: 'red',
        loading: false,
        autoClose: 5000
      });
    } finally {
      setIsApiTesting(false);
    }
  };

  // 400 hata analizi
  const handleAnalyze400Error = async () => {
    try {
      if (!apiUrl || apiUrl.trim() === '') {
        notifications.show({
          title: 'Hata',
          message: 'Lütfen analiz edilecek bir API URL girin',
          color: 'red'
        });
        return;
      }
      
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      notifications.show({
        title: '400 Hata Analizi',
        message: 'API hatası analiz ediliyor...',
        loading: true,
        autoClose: false,
        withCloseButton: false,
        id: 'analyze-400'
      });
      
      // URL'nin endpoint kısmını al
      let endpoint = apiUrl;
      if (apiUrl.includes('rest/v1/')) {
        endpoint = apiUrl.split('rest/v1/')[1];
      }
      
      const result = await analyze400Error(endpoint);
      setAnalysisResult(result);
      
      if (result.success) {
        notifications.update({
          id: 'analyze-400',
          title: 'Başarılı',
          message: 'API isteği hata vermedi! İstek başarılı.',
          color: 'green',
          loading: false,
          autoClose: 5000
        });
      } else {
        notifications.update({
          id: 'analyze-400',
          title: 'Hata Analizi Tamamlandı',
          message: `Tespit edilen hata: ${result.errorType}`,
          color: 'blue',
          loading: false,
          autoClose: 5000
        });
      }
      
      console.log('400 Hata Analiz Sonucu:', result);
    } catch (error) {
      console.error('400 Hata analizi genel hatası:', error);
      notifications.update({
        id: 'analyze-400',
        title: 'Hata',
        message: `Beklenmeyen hata: ${error.message}`,
        color: 'red',
        loading: false,
        autoClose: 5000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>
          Ürünler
        </Text>
        <Group>
          {(rlsStatus && !rlsStatus.success) && (
            <Button 
              color="yellow"
              variant="outline"
              leftSection={<IconShieldOff size={16} />}
              onClick={handleDisableRLS}
              loading={isDisablingRLS}
              disabled={rlsStatus?.disabled}
            >
              RLS'yi Geçici Devre Dışı Bırak
            </Button>
          )}
          
          <Button 
            color="blue"
            variant="outline"
            leftSection={<IconBug size={16} />}
            onClick={handleDebugAPI}
            loading={isDebugging}
          >
            API Hata Ayıkla
          </Button>
          
          <Button 
            color="teal"
            variant="outline"
            leftSection={<IconApi size={16} />}
            onClick={handleTestAPIRLS}
            loading={isApiTesting}
          >
            API RLS Testi
          </Button>
          
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Yeni Ürün Ekle
          </Button>
        </Group>
      </Group>

      {rlsStatus && !rlsStatus.success && !rlsStatus?.disabled && (
        <Alert icon={<IconAlertTriangle size={16} />} title="RLS Politikası Sorunu" color="yellow" mb="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              Supabase RLS politikalarında bir sorun tespit edildi. Bu nedenle ürün ekleme/güncelleme işlemleri çalışmayabilir.
              {rlsStatus.error && (
                <div style={{ marginTop: '10px' }}>
                  <Text size="sm">Hata: {rlsStatus.error.message || JSON.stringify(rlsStatus.error)}</Text>
                </div>
              )}
              <div style={{ marginTop: '10px' }}>
                <Text size="sm" fw={600}>Çözüm için:</Text>
                <Text size="sm">1. Supabase Dashboard'a giriş yapın.</Text>
                <Text size="sm">2. "Table Editor" &gt; "products" tablosunu seçin.</Text>
                <Text size="sm">3. "Policies" sekmesine tıklayın.</Text>
                <Text size="sm">4. "New Policy" ile yeni politikalar ekleyin.</Text>
                <Text size="sm">5. Veya geliştirme için RLS'yi geçici olarak devre dışı bırakın (yandaki buton).</Text>
              </div>
            </Box>
            <Badge color="red" size="lg">RLS Sorunu</Badge>
          </Group>
        </Alert>
      )}
      
      {rlsStatus?.disabled && (
        <Alert icon={<IconShield size={16} />} title="RLS Devre Dışı" color="blue" mb="md">
          <Group justify="space-between" align="flex-start">
            <Text>
              RLS geçici olarak devre dışı bırakıldı. Veritabanı güvenliği şu anda aktif değil. 
              Bu sadece geliştirme aşamasında kullanılmalıdır.
            </Text>
            <Badge color="blue" size="lg">Güvenlik Devre Dışı</Badge>
          </Group>
        </Alert>
      )}

      {/* Hata Analiz Bölümü */}
      <Alert icon={<IconSearch size={16} />} title="400 Hata Analizi" color="blue" mb="xl">
        <Stack spacing="md">
          <Text size="sm">
            Aldığınız API hatasını analiz edin. Örnek URL: <Code>jrwplrptzvcrtsnfysqd.supabase.co/rest/v1/products?columns=%22name%22...</Code>
          </Text>
          
          <Group align="flex-end">
            <TextInput
              label="API URL veya Endpoint"
              placeholder="API URL'sini girin veya endpoint (products)"
              style={{ flex: 1 }}
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <Button
              onClick={handleAnalyze400Error}
              loading={isAnalyzing}
            >
              Analiz Et
            </Button>
          </Group>
          
          {analysisResult && (
            <Alert 
              color={analysisResult.success ? 'green' : 'yellow'} 
              title={analysisResult.success ? 'İstek Başarılı' : `Hata Türü: ${analysisResult.errorType}`}
              mb="md"
            >
              <Stack spacing="xs">
                {!analysisResult.success && (
                  <>
                    <Text size="sm" fw={600}>Sorun: {analysisResult.message}</Text>
                    {analysisResult.details && <Text size="sm">Detay: {analysisResult.details}</Text>}
                    {analysisResult.solution && <Text size="sm">Çözüm: {analysisResult.solution}</Text>}
                  </>
                )}
                
                {analysisResult.success && (
                  <Text size="sm">API isteği başarıyla tamamlandı. Herhangi bir hata tespit edilmedi.</Text>
                )}
              </Stack>
            </Alert>
          )}
        </Stack>
      </Alert>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ürün Adı</Table.Th>
            <Table.Th>Kategori</Table.Th>
            <Table.Th>Fiyat</Table.Th>
            <Table.Th>Stok</Table.Th>
            <Table.Th>İşlemler</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((product) => (
            <Table.Tr key={product.id}>
              <Table.Td>{product.name}</Table.Td>
              <Table.Td>{product.category}</Table.Td>
              <Table.Td>{product.price} TL</Table.Td>
              <Table.Td>{product.stock}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button variant="light" size="xs" leftSection={<IconEdit size={16} />} onClick={() => handleEdit(product)}>
                    Düzenle
                  </Button>
                  <Button color="red" size="xs" leftSection={<IconTrash size={16} />} onClick={() => handleDelete(product.id)}>
                    Sil
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yeni Ürün Ekle"
        size="lg"
      >
        <Stack>
          <TextInput
            label="Ürün Adı"
            placeholder="Ürün adını girin"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <NumberInput
            label="Fiyat"
            placeholder="Ürün fiyatını girin"
            value={formData.price}
            onChange={(value) => handleInputChange('price', value)}
            min={1}
            required
          />

          <NumberInput
            label="İndirim Oranı (%)"
            placeholder="İndirim oranını girin"
            value={formData.discount_rate}
            onChange={(value) => handleInputChange('discount_rate', value)}
            min={1}
            max={100}
            clampBehavior="strict"
          />

          <NumberInput
            label="İndirimli Fiyat"
            placeholder="İndirimli fiyatı girin"
            value={formData.discount_price}
            onChange={(value) => handleInputChange('discount_price', value)}
            min={1}
          />

          <FileInput
            label="Ürün Görseli"
            placeholder="Görsel seçin"
            accept="image/*"
            onChange={handleImageUpload}
            loading={loading ? "true" : undefined}
          />

          <TextInput
            label="Marka"
            placeholder="Marka adını girin"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          />

          <Select
            label="Kategori"
            placeholder="Kategori seçin"
            data={categories}
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            required
            searchable
            nothingFoundMessage="Kategori bulunamadı"
          />

          <Select
            label="Alt Kategori"
            placeholder="Alt kategori seçin"
            data={subcategories}
            value={formData.subcategory}
            onChange={(value) => handleInputChange('subcategory', value)}
            disabled={!formData.category}
            searchable
            nothingFoundMessage="Alt kategori bulunamadı"
          />

          <Textarea
            label="Açıklama"
            placeholder="Ürün açıklamasını girin"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            minRows={3}
          />

          <NumberInput
            label="Stok"
            placeholder="Stok miktarını girin"
            value={formData.stock}
            onChange={(value) => handleInputChange('stock', value)}
            min={1}
            required
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} loading={loading ? "true" : undefined}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Ürün Düzenle"
        size="lg"
      >
        <Stack>
          <TextInput
            label="Ürün Adı"
            placeholder="Ürün adını girin"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <NumberInput
            label="Fiyat"
            placeholder="Ürün fiyatını girin"
            value={formData.price}
            onChange={(value) => handleInputChange('price', value)}
            min={1}
            required
          />

          <NumberInput
            label="İndirim Oranı (%)"
            placeholder="İndirim oranını girin"
            value={formData.discount_rate}
            onChange={(value) => handleInputChange('discount_rate', value)}
            min={1}
            max={100}
            clampBehavior="strict"
          />

          <NumberInput
            label="İndirimli Fiyat"
            placeholder="İndirimli fiyatı girin"
            value={formData.discount_price}
            onChange={(value) => handleInputChange('discount_price', value)}
            min={1}
          />

          <FileInput
            label="Ürün Görseli"
            placeholder="Görsel seçin"
            accept="image/*"
            onChange={handleImageUpload}
            loading={loading ? "true" : undefined}
          />

          <TextInput
            label="Marka"
            placeholder="Marka adını girin"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            required
          />

          <Select
            label="Kategori"
            placeholder="Kategori seçin"
            data={categories}
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            required
            searchable
            nothingFoundMessage="Kategori bulunamadı"
          />

          <Select
            label="Alt Kategori"
            placeholder="Alt kategori seçin"
            data={subcategories}
            value={formData.subcategory}
            onChange={(value) => handleInputChange('subcategory', value)}
            disabled={!formData.category}
            searchable
            nothingFoundMessage="Alt kategori bulunamadı"
          />

          <Textarea
            label="Açıklama"
            placeholder="Ürün açıklamasını girin"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            minRows={3}
          />

          <NumberInput
            label="Stok"
            placeholder="Stok miktarını girin"
            value={formData.stock}
            onChange={(value) => handleInputChange('stock', value)}
            min={1}
            required
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditSubmit} loading={loading ? "true" : undefined}>
              Kaydet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
} 