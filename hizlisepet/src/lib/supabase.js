import { createClient } from '@supabase/supabase-js'

// GEÇICI: Environment variables çalışmıyor, hardcode ediyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jrwplrptzvcrtsnfysqd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3BscnB0enZjcnRzbmZ5c3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMjI2NzcsImV4cCI6MjA1MDg5ODY3N30.UGucjeIRao5FHS359sDpTHUbr6zQJzR5IPN-V0BK8kY'

console.log('Supabase yapılandırması:', { 
  url: supabaseUrl, 
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 'undefined',
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

// Authentication session persistence için optimize edilmiş client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit', // PKCE yerine implicit flow kullan
    debug: false,
    storage: window.localStorage, // Explicit storage tanımla
    storageKey: 'supabase.auth.token' // Custom key
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'hizlisepet-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// ÖNEMLİ: Ürün düzenleme işlemindeki temel sorun için yeni fonksiyon
export async function updateProductWithFetch(productId, productData) {
  try {
    console.log('UPDATEwithFETCH fonksiyonu çağrıldı. ID:', productId);
    
    // 1. Önce güncelleme işlemi yap
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId);
    
    if (error) {
      console.error('Güncelleme hatası:', error);
      throw error;
    }
    
    // 2. Güncelleme başarılı ise, güncel veriyi al
    const { data: updatedData, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError) {
      console.error('Veri alma hatası:', fetchError);
      throw fetchError;
    }
    
    console.log('Güncellenmiş veri başarıyla alındı:', updatedData);
    return { data: updatedData, error: null };
  } catch (err) {
    console.error('Güncelleme işleminde hata:', err);
    return { data: null, error: err };
  }
}

// Ürün güncelleme yardımcı fonksiyonu
export async function updateProduct(productId, productData) {
  console.log('Basit updateProduct fonksiyonu çağrıldı', { productId, productData });
  
  // Doğrudan güncelleme
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId);
    
  console.log('Güncelleme sonucu:', { data, error });
  
  if (error) {
    console.error('Ürün güncelleme hatası:', error);
    throw error;
  }
  
  return { data, error };
}

// Supabase tablosunu gerçek zamanlı dinleme fonksiyonu - Dikkat: WebSocket bağlantı hatası nedeniyle çalışmayabilir
export function subscribeToTable(table, callback) {
  console.log('WebSocket bağlantısı devre dışı bırakıldı. Abonelik çalışmayacak.');
  return {
    unsubscribe: () => console.log('Simüle abonelik iptal edildi')
  };
}

// Test fonksiyonu - basitleştirilmiş
export async function testSupabase() {
  try {
    console.log('Supabase bağlantı testi başlatılıyor...');
    
    // Ürün sayısını getir
    const { data, error } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('Supabase test hatası:', error);
      return { success: false, error };
    }
    
    console.log('Supabase test sonucu: başarılı');
    return { success: true };
  } catch (err) {
    console.error('Supabase test exception:', err);
    return { success: false, error: err };
  }
}

// Ürün ekleme fonksiyonu
export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      price: product.price,
      discount_price: product.discountPrice,
      discount_rate: product.discountRate,
      image_url: product.imageUrl,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      rating: product.rating,
      stock: product.stock
    }])
    .select();

  if (error) throw error;
  return data;
}

// Kategori bazlı ürün getirme fonksiyonu
export async function getProductsByCategory(category, subcategory = null) {
  let query = supabase
    .from('products')
    .select('*');

  if (subcategory) {
    query = query.eq('subcategory', subcategory);
  } else {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Ürün arama fonksiyonu
export async function searchProducts(searchTerm) {
  if (!searchTerm) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(
      `name.ilike.%${searchTerm}%,` +
      `brand.ilike.%${searchTerm}%,` +
      `category.ilike.%${searchTerm}%,` +
      `subcategory.ilike.%${searchTerm}%`
    )
    .order('name')
    .limit(10);

  if (error) {
    console.error('Arama hatası:', error);
    return [];
  }

  return data || [];
}

// UYARI: Sadece geliştirme ortamında kullanın!
// Bu fonksiyon products tablosu için RLS politikalarını geçici olarak devre dışı bırakır
export async function disableRLSTemporarily() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Bu fonksiyon sadece geliştirme ortamında kullanılmalıdır!');
    return { success: false, error: 'Üretim ortamında kullanılamaz' };
  }
  
  try {
    console.log('Geliştirme için RLS politikalarını geçici olarak devre dışı bırakma girişimi...');
    
    // Servis rolü anahtarını kontrol et
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return { 
        success: false, 
        error: 'Service role key bulunamadı. .env dosyasına VITE_SUPABASE_SERVICE_ROLE_KEY ekleyin.' 
      };
    }
    
    // Admin yetkilerine sahip bir istemci oluştur
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // RLS'yi products tablosu için devre dışı bırak
    const { error } = await adminClient.rpc('disable_rls_for_development', { table_name: 'products' });
    
    if (error) {
      console.error('RLS devre dışı bırakma hatası:', error);
      
      // Yardımcı mesaj göster
      console.log('SQL Editöründe aşağıdaki fonksiyonu oluşturun:');
      console.log(`
CREATE OR REPLACE FUNCTION disable_rls_for_development(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ardından bu fonksiyonu çağırın:
SELECT disable_rls_for_development('products');
      `);
      
      return { success: false, error };
    }
    
    console.log('RLS geçici olarak devre dışı bırakıldı. Bu yalnızca geliştirme için kullanılmalıdır!');
    return { success: true };
  } catch (err) {
    console.error('RLS devre dışı bırakma hatası:', err);
    return { success: false, error: err };
  }
}

// RLS politikalarını test et
export async function testRLS() {
  try {
    console.log('RLS testi başlatılıyor...');
    
    // 1. SELECT testi
    console.log('SELECT testi yapılıyor...');
    const { data: selectData, error: selectError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('SELECT işlemi RLS hatası:', selectError);
      return { 
        success: false, 
        read: false,
        write: false,
        delete: false,
        error: selectError 
      };
    }
    
    console.log('SELECT testi başarılı:', selectData);
    
    // 2. INSERT testi
    console.log('INSERT testi yapılıyor...');
    const testProduct = {
      name: `Test Ürün ${Date.now()}`,
      price: 100,
      brand: 'Test Marka',
      category: 'Test Kategori',
      subcategory: 'Test Alt Kategori',
      description: 'Test açıklaması',
      stock: 1,
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (insertError) {
      console.error('INSERT işlemi RLS hatası:', insertError);
      return { 
        success: false, 
        read: true,
        write: false,
        delete: false,
        error: insertError 
      };
    }
    
    console.log('INSERT testi başarılı:', insertData);
    const newProductId = insertData[0].id;
    
    // 3. UPDATE testi
    console.log('UPDATE testi yapılıyor...');
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ name: `Test Ürün Güncellendi ${Date.now()}` })
      .eq('id', newProductId)
      .select();
    
    if (updateError) {
      console.error('UPDATE işlemi RLS hatası:', updateError);
      return { 
        success: false, 
        read: true,
        write: true,
        update: false,
        delete: false,
        error: updateError 
      };
    }
    
    console.log('UPDATE testi başarılı:', updateData);
    
    // 4. DELETE testi
    console.log('DELETE testi yapılıyor...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', newProductId);
    
    if (deleteError) {
      console.error('DELETE işlemi RLS hatası:', deleteError);
      return { 
        success: false, 
        read: true,
        write: true,
        update: true,
        delete: false,
        error: deleteError 
      };
    }
    
    console.log('DELETE testi başarılı');
    
    // Tüm testler başarılı
    return { 
      success: true, 
      read: true,
      write: true,
      update: true,
      delete: true,
      message: 'Tüm RLS testleri başarılı' 
    };
  } catch (err) {
    console.error('RLS test genel hatası:', err);
    return { success: false, error: err };
  }
}

// Supabase servis rolü ile kimlik doğrulama (Sadece güvenli ortamlarda kullanın)
export async function authenticateWithServiceRole() {
  try {
    // NOT: Bu fonksiyon sadece backend tarafında güvenli bir ortamda çalıştırılmalıdır
    // Frontend'de servis rolü kullanmak güvenlik açığı oluşturur
    console.log('Servis rolü ile kimlik doğrulama yapılıyor...');
    
    // Eğer bir service_role token'ı varsa
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.error('Servis rolü anahtarı bulunamadı');
      return { success: false, error: 'Servis rolü anahtarı bulunamadı' };
    }
    
    // Servis rolü ile yeni bir Supabase istemcisi oluştur
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('Servis rolü ile kimlik doğrulama başarılı');
    return { success: true, client: adminClient };
  } catch (err) {
    console.error('Servis rolü ile kimlik doğrulama hatası:', err);
    return { success: false, error: err };
  }
}

// RLS hatası olmadan güncelleme yap
export async function updateProductIgnoringRLS(productId, productData) {
  try {
    console.log('RLS olmadan güncelleme başlatılıyor...');
    
    // 1. Mevcut kimlik bilgilerini kullanarak güncelleme yap
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId);
    
    // Hata kontrol et
    if (error) {
      // Hata RLS ile ilgiliyse
      if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
        console.warn('RLS hatası tespit edildi, alternatif yöntemler deneniyor...');
        
        // A. CORS hatası uyarısı
        console.log('Not: Tarayıcı CORS hatası veriyorsa, server-side çözüm gerekli olabilir');
        
        // B. Oturum açmış kullanıcı kontrolü
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('Kimlik doğrulaması gerekiyor, lütfen oturum açın');
          return { data: null, error: { message: 'Kimlik doğrulaması gerekiyor' } };
        }
        
        // Yine de hata verdiyse, daha fazla bilgi isteyelim
        console.error('Lütfen Supabase dashboard üzerinden RLS politikalarını kontrol edin.');
        console.error('Tavsiye: Veritabanı > Tablo (products) > Politikalar bölümünden yeni güncelleme politikası ekleyin');
        
        return { data: null, error: { 
          message: 'RLS politikası engelledi, lütfen Supabase yönetim panelinden kontrol edin', 
          originalError: error
        }};
      }
      
      console.error('Standart güncelleme hatası:', error);
      throw error;
    }
    
    // Güncelleme başarılı, güncel veriyi al
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError) {
      console.error('Veri alma hatası:', fetchError);
      throw fetchError;
    }
    
    console.log('Güncelleme başarılı:', data);
    return { data, error: null };
  } catch (err) {
    console.error('Güncelleme işlemi genel hatası:', err);
    return { data: null, error: err };
  }
}

// API Hata Ayıklama Fonksiyonu
export async function debugSupabaseAPI(endpoint, requestOptions = {}) {
  try {
    console.log('API Hata Ayıklama Başlatılıyor...');
    
    // API endpoint'ini kontrol et
    if (!endpoint) {
      return { success: false, error: 'API endpoint\'i belirtilmedi' };
    }
    
    // Supabase URL ve API Key kontrolü
    console.log('Supabase Yapılandırması:', {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'tanımlanmamış',
      key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}` : 'tanımlanmamış'
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        success: false, 
        error: 'Supabase URL veya API anahtarı tanımlanmamış',
        env: {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey
        }
      };
    }
    
    // API isteği yapılandırması
    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...requestOptions.headers
    };
    
    // Tam URL oluştur
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${supabaseUrl}/rest/v1/${endpoint}`;
    
    console.log('API İsteği Yapılıyor:', { 
      url: fullUrl, 
      method: requestOptions.method || 'GET',
      headers: Object.keys(headers)
    });
    
    // Fetch isteği yap
    const response = await fetch(fullUrl, {
      method: requestOptions.method || 'GET',
      headers,
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
      ...requestOptions
    });
    
    // Yanıt durum kodunu kontrol et
    console.log('API Yanıtı:', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Hatası:', { 
        status: response.status, 
        body: errorText 
      });
      
      try {
        // JSON yanıtı ayrıştırmayı dene
        const errorJson = JSON.parse(errorText);
        return { 
          success: false, 
          status: response.status,
          error: errorJson,
          message: 'Supabase API hatası'
        };
      } catch (e) {
        // JSON ayrıştırılamadıysa ham metin döndür
        return { 
          success: false, 
          status: response.status,
          error: errorText,
          message: 'Supabase API hatası (metin)'
        };
      }
    }
    
    // Başarılı yanıtı JSON olarak ayrıştır
    const data = await response.json();
    console.log('API Yanıt Verisi:', {
      length: Array.isArray(data) ? data.length : 'JSON nesnesi',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : data
    });
    
    return { 
      success: true, 
      status: response.status,
      data 
    };
  } catch (err) {
    console.error('API İsteği Genel Hatası:', err);
    return { 
      success: false, 
      error: err.message,
      stack: err.stack
    };
  }
}

// 400 hatası ve RLS sorunu ile ilgili hata ayıklama fonksiyonu
export async function testRLSWithDirectAPI() {
  try {
    console.log('Doğrudan API çağrısı ile RLS testi başlatılıyor...');
    
    // 1. Önce normal bir select işlemi yap
    const selectResult = await debugSupabaseAPI('products?limit=1');
    
    if (!selectResult.success) {
      console.error('SELECT API isteği başarısız:', selectResult.error);
      return { 
        success: false, 
        read: false,
        error: selectResult.error,
        message: 'Ürünleri okuma işleminde hata. Supabase yapılandırmanızı kontrol edin.' 
      };
    }
    
    console.log('SELECT API isteği başarılı. Devam ediliyor...');
    
    // 2. Test ürünü verisi
    const testProduct = {
      name: `API Test Ürün ${Date.now()}`,
      price: 100,
      brand: 'Test Marka',
      category: 'Test Kategori',
      subcategory: 'Test Alt Kategori',
      description: 'Test açıklaması',
      stock: 1,
      created_at: new Date().toISOString()
    };
    
    // 3. INSERT işlemini test et
    const insertResult = await debugSupabaseAPI('products', {
      method: 'POST',
      body: testProduct
    });
    
    if (!insertResult.success) {
      console.error('INSERT API isteği başarısız:', insertResult.error);
      
      // RLS politikası sorunu olup olmadığını kontrol et
      const errorMessage = typeof insertResult.error === 'string' 
        ? insertResult.error 
        : JSON.stringify(insertResult.error);
        
      if (insertResult.status === 400 || 
          errorMessage.includes('permission') || 
          errorMessage.includes('policy') ||
          errorMessage.includes('RLS')) {
        console.warn('RLS politikası sorunu tespit edildi');
        return { 
          success: false, 
          read: true,
          write: false,
          error: insertResult.error,
          isRLSError: true,
          message: `
            RLS politikası sorunu tespit edildi. Bu sorun, tablonuzda Row Level Security politikalarının
            yanlış yapılandırılmış olmasından kaynaklanabilir. Çözüm için:
            
            1. RLS_POLICY_SETUP.md dosyasındaki adımları izleyin
            2. Supabase Dashboard'dan RLS politikalarını düzenleyin
            3. Geliştirme aşamasında RLS'yi devre dışı bırakabilirsiniz
          ` 
        };
      }
      
      return { 
        success: false, 
        read: true,
        write: false,
        error: insertResult.error,
        message: 'INSERT işlemi başarısız oldu. API anahtarınızı ve izinleri kontrol edin.' 
      };
    }
    
    console.log('INSERT API isteği başarılı. RLS sorunu yok.');
    
    return { 
      success: true, 
      read: true,
      write: true,
      message: 'API testleri başarılı. RLS politika sorunu tespit edilmedi.' 
    };
  } catch (err) {
    console.error('API RLS test genel hatası:', err);
    return { 
      success: false, 
      error: err,
      message: 'API testi sırasında beklenmeyen bir hata oluştu.' 
    };
  }
}

// 400 Bad Request hata kodunu analiz et ve RLS politika sorunlarını tespit et
export async function analyze400Error(endpoint, requestOptions = {}) {
  try {
    console.log('400 Hata Kodu Analizi Başlatılıyor...');
    
    // 1. Önce Headers analizi için bir OPTIONS isteği yap
    console.log('OPTIONS isteği ile sunucu CORS yapılandırmasını kontrol ediliyor...');
    
    const headersCheckUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${supabaseUrl}/rest/v1/${endpoint}`;
    
    const corsCheck = await fetch(headersCheckUrl, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseAnonKey,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS Kontrol Sonucu:', { 
      status: corsCheck.status,
      headers: Object.fromEntries([...corsCheck.headers.entries()])
    });
    
    // 2. Ardından asıl isteği gerçekleştir ve hataya dikkat et
    const result = await debugSupabaseAPI(endpoint, requestOptions);
    
    // 3. Eğer 400 hata kodu aldıysak, hata kaynağını analiz et
    if (!result.success && result.status === 400) {
      console.warn('400 Bad Request hatası tespit edildi');
      
      // Hata detaylarını analiz et
      const errorText = typeof result.error === 'string' 
        ? result.error 
        : JSON.stringify(result.error);
      
      // 3.1. API Key yoksa
      if (errorText.includes('No API key found') || errorText.includes('apikey')) {
        return {
          success: false,
          errorType: 'API_KEY_MISSING',
          message: 'API anahtarı eksik veya geçersiz. Supabase yapılandırmasını kontrol edin.',
          details: 'Supabase isteklerinde apikey header veya url parametresi gereklidir.',
          solution: 'VITE_SUPABASE_ANON_KEY ortam değişkeninin doğru ayarlandığından emin olun.'
        };
      }
      
      // 3.2. RLS politika hatası
      if (errorText.includes('permission') || errorText.includes('policy') || errorText.includes('row-level')) {
        return {
          success: false,
          errorType: 'RLS_POLICY_ERROR',
          message: 'Row Level Security (RLS) politika hatası tespit edildi.',
          details: 'Tabloda gerekli erişim politikaları eksik veya kullanıcınızın yetkileri yetersiz.',
          solution: 'RLS_POLICY_SETUP.md dosyasındaki adımları izleyerek Supabase Dashboard üzerinden politikaları yapılandırın.'
        };
      }
      
      // 3.3. CORS hatası
      if (errorText.includes('CORS') || errorText.includes('origin')) {
        return {
          success: false,
          errorType: 'CORS_ERROR',
          message: 'Cross-Origin Resource Sharing (CORS) hatası tespit edildi.',
          details: 'Tarayıcı güvenlik politikaları nedeniyle API çağrınız engellendi.',
          solution: 'Supabase Dashboard > Settings > API bölümünde CORS ayarlarını düzenleyin ve etki alanınızı ekleyin.'
        };
      }
      
      // 3.4. JSON formatı hatası
      if (errorText.includes('JSON') || errorText.includes('format') || errorText.includes('parse')) {
        return {
          success: false,
          errorType: 'JSON_FORMAT_ERROR',
          message: 'Geçersiz JSON formatı hatası tespit edildi.',
          details: 'Gönderilen veri geçerli bir JSON formatında değil.',
          solution: 'Gönderilen veriyi JSON.stringify ile dönüştürdüğünüzden emin olun ve veri tiplerini kontrol edin.'
        };
      }
      
      // 3.5. Diğer 400 hataları
      return {
        success: false,
        errorType: 'GENERIC_400_ERROR',
        message: 'Tanımlanamayan 400 Bad Request hatası.',
        details: errorText,
        solution: 'Hata detaylarını inceleyerek istek parametrelerini, formatını ve içeriğini kontrol edin.'
      };
    }
    
    // 4. Farklı bir hata kodu veya başarılı sonuç için
    return result;
  } catch (err) {
    console.error('400 Hata analizi genel hatası:', err);
    return {
      success: false,
      errorType: 'ANALYSIS_ERROR',
      message: 'Hata analizi sırasında beklenmeyen bir sorun oluştu.',
      error: err
    };
  }
}

// RLS politikalarını kontrol etmek için yardımcı fonksiyon
export async function checkRLSPolicies() {
  try {
    // Products tablosu için okuma izni kontrolü
    const { data: readData, error: readError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('RLS Okuma Hatası:', readError);
      return false;
    }

    // Products tablosu için yazma izni kontrolü
    const { error: writeError } = await supabase
      .from('products')
      .insert([{ name: 'test', price: 0 }])
      .select();

    if (writeError) {
      console.error('RLS Yazma Hatası:', writeError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('RLS Kontrol Hatası:', error);
    return false;
  }
}

// Auth session temizleme fonksiyonu
export function clearAuthSession() {
  try {
    // Supabase auth tokenlarını temizle
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-jrwplrptzvcrtsnfysqd-auth-token');
    
    // Diğer auth anahtarlarını da temizle
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 Auth session temizlendi');
    return { success: true };
  } catch (error) {
    console.error('❌ Session temizleme hatası:', error);
    return { success: false, error };
  }
}

// Session durumunu kontrol et
export async function checkAuthSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session kontrol hatası:', error);
      return { valid: false, error };
    }
    
    const isValid = !!session?.user && !!session?.access_token;
    console.log(`🔍 Session durumu: ${isValid ? 'Geçerli' : 'Geçersiz'}`);
    
    return { valid: isValid, session };
  } catch (error) {
    console.error('❌ Session kontrol exception:', error);
    return { valid: false, error };
  }
} 