# Supabase RLS Politikaları Kurulum Kılavuzu

Bu kılavuz, Supabase veritabanınız için RLS (Row Level Security) politikalarını doğru şekilde yapılandırmanıza yardımcı olacaktır.

## Sorun

Uygulama şu anda 'products' tablosunda RLS politikalarının düzgün yapılandırılmaması nedeniyle güncelleme işlemleri yapamıyor olabilir. RLS, veritabanı güvenliğini sağlayan bir özelliktir ve doğru yapılandırılmadığında veri okuma/yazma işlemlerini engelleyebilir.

## Sık Karşılaşılan 400 Hataları ve Çözümleri

API isteklerinde 400 Bad Request hatasının çeşitli nedenleri olabilir. İşte en yaygın olanlar ve çözümleri:

### 1. "No API key found in request" Hatası

Bu hata, Supabase API'sine yapılan isteklerde API anahtarının eksik olduğunu gösterir.

**Çözüm:**
- `.env` dosyanızda `VITE_SUPABASE_ANON_KEY` değişkeninin doğru şekilde ayarlandığından emin olun
- API isteklerinizde `apikey` header'ının eklendiğinden emin olun
- Örnek: `headers: { 'apikey': 'ANAHTARINIZ', 'Authorization': 'Bearer ANAHTARINIZ' }`

### 2. "Permission denied" veya "Policy check failed" Hatası

Bu hatalar, RLS politika sorunlarını gösterir.

**Çözüm:**
- Supabase Dashboard üzerinden ilgili tabloya uygun RLS politikaları ekleyin
- Oturum açma durumunuzu kontrol edin (bazı işlemler sadece kimliği doğrulanmış kullanıcılar için izin verebilir)
- Aşağıdaki RLS politikalarını uygulayın

### 3. "Invalid column" veya "Invalid table" Hatası

Bu hatalar, sorgunuzda hatalı bir sütun adı veya tablo adı kullandığınızı gösterir.

**Çözüm:**
- Sütun adlarını ve tablo adlarını doğru yazdığınızdan emin olun
- Sütun adlarının Supabase'deki adlarla tam olarak eşleştiğini kontrol edin

## RLS Politikalarını Yapılandırma Adımları

1. Supabase Dashboard'a giriş yapın (https://app.supabase.io)
2. Projenizi seçin
3. Sol menüden 'Table Editor' seçeneğine tıklayın
4. 'products' tablosunu bulun ve seçin
5. 'Policies' sekmesine tıklayın
6. Aşağıdaki politikaları eklemek için 'New Policy' butonuna tıklayın:

### 1. Herkes İçin Okuma Erişimi

- Politika Adı: "allow_public_read"
- Hedef Rol: public (herkes)
- İzin Tipi: SELECT
- İzin Kullanımı: PERMISSIVE
- Politika Tanımı: true

### 2. Kimliği Doğrulanmış Kullanıcılar İçin Yazma Erişimi

- Politika Adı: "allow_auth_inserts"
- Hedef Rol: authenticated (kimliği doğrulanmış kullanıcılar)
- İzin Tipi: INSERT
- İzin Kullanımı: PERMISSIVE
- Politika Tanımı: true

### 3. Kimliği Doğrulanmış Kullanıcılar İçin Güncelleme Erişimi

- Politika Adı: "allow_auth_updates"
- Hedef Rol: authenticated (kimliği doğrulanmış kullanıcılar)
- İzin Tipi: UPDATE
- İzin Kullanımı: PERMISSIVE
- Politika Tanımı: true

### 4. Kimliği Doğrulanmış Kullanıcılar İçin Silme Erişimi

- Politika Adı: "allow_auth_deletes"
- Hedef Rol: authenticated (kimliği doğrulanmış kullanıcılar)
- İzin Tipi: DELETE
- İzin Kullanımı: PERMISSIVE
- Politika Tanımı: true

## Veya Tümü İçin Hızlı Çözüm

Eğer sadece geliştirme ortamında çalışıyorsanız ve maksimum güvenliğe ihtiyacınız yoksa, tüm işlemlere izin veren tek bir politika ekleyebilirsiniz:

- Politika Adı: "allow_all_operations"
- Hedef Rol: anon (herkes)
- İzin Tipi: ALL
- İzin Kullanımı: PERMISSIVE
- Politika Tanımı: true

## Direkt SQL ile Politika Ekleme

Supabase SQL editörünü kullanarak aşağıdaki SQL komutları ile de politika ekleyebilirsiniz:

```sql
-- RLS'yi products tablosu için etkinleştir
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Herkes için okuma izni
CREATE POLICY "allow_public_read" ON products
  FOR SELECT USING (true);

-- Kimliği doğrulanmış kullanıcılara yazma izni
CREATE POLICY "allow_auth_inserts" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Kimliği doğrulanmış kullanıcılara güncelleme izni  
CREATE POLICY "allow_auth_updates" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Kimliği doğrulanmış kullanıcılara silme izni
CREATE POLICY "allow_auth_deletes" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

## RLS'nin Çalışma Şekli

Row Level Security (RLS), veritabanı düzeyinde güvenlik sağlar ve her kullanıcının hangi satırlara erişebileceğini kontrol eder.

1. RLS varsayılan olarak bir tablo için kapalıdır (`DISABLE ROW LEVEL SECURITY`).
2. RLS'yi etkinleştirdiğinizde (`ENABLE ROW LEVEL SECURITY`), tüm erişimler varsayılan olarak reddedilir.
3. `USING` ifadesi, satırları okuma, güncelleme veya silme yetkisini kontrol eder.
4. `WITH CHECK` ifadesi, yeni satır ekleme veya güncelleme ile ilgili yetkileri kontrol eder.

## Sorun Giderme

RLS ile ilgili sorunlar yaşıyorsanız aşağıdaki adımları izleyin:

1. **RLS Etkin mi Kontrol Edin**: Tablonuzun RLS'nin aktif olduğundan emin olun.
2. **Politika Var mı Kontrol Edin**: En az bir politika tanımlanmış olmalıdır.
3. **Kullanıcı Kimliğini Kontrol Edin**: 'Authenticated' politikalarının çalışması için kullanıcı oturum açmış olmalıdır.
4. **API İsteklerini İnceleyin**: Tarayıcı geliştirici araçlarını kullanarak API isteklerini izleyin.

## Önemli Notlar

1. Anonim kullanıcılar için sadece okuma izni verilmesini öneririz.
2. Anonim kullanıcılara yazma, güncelleme ve silme izni vermek güvenlik riski oluşturabilir.
3. Ürünleri sadece yetkili kullanıcıların düzenleyebilmesi için Auth sistemini uygulamanıza entegre edin.
4. Kullanıcı hesabı oluşturmak için Auth modülünü kullanın.
5. Bu yönergeleri uyguladıktan sonra, uygulamayı yeniden başlatın ve düzgün çalışıp çalışmadığını test edin.

## Politikaları Geçici Olarak Devre Dışı Bırakma

Geliştirme aşamasında RLS'yi tamamen devre dışı bırakmak için:

```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

**Dikkat**: Bu komut tüm güvenlik kurallarını kaldırır ve herkesin tabloyu değiştirebilmesine izin verir. Sadece geliştirme ortamında kullanın!

## Detaylı Bilgi

Daha fazla bilgi için Supabase RLS dokümantasyonunu inceleyebilirsiniz:
https://supabase.com/docs/guides/auth/row-level-security 