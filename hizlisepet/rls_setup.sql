-- RLS politikalarını oluşturma ve yönetme SQL dosyası

-- RLS'yi ürünler tablosu için etkinleştir (RLS varsayılan olarak kapalıdır)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Mevcut tüm politikaları temizle (isteğe bağlı)
DROP POLICY IF EXISTS "allow_anonymous_read" ON products;
DROP POLICY IF EXISTS "allow_authenticated_read" ON products;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON products;
DROP POLICY IF EXISTS "allow_authenticated_update" ON products;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON products;
DROP POLICY IF EXISTS "allow_all_access" ON products;

-- 1) Herkes için okuma erişimi politikası (anonim kullanıcılar dahil)
CREATE POLICY "allow_anonymous_read" 
ON products
FOR SELECT 
USING (true);

-- 2) Giriş yapmış kullanıcılar için ekleme erişimi politikası
CREATE POLICY "allow_authenticated_insert" 
ON products
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3) Giriş yapmış kullanıcılar için güncelleme erişimi politikası
CREATE POLICY "allow_authenticated_update" 
ON products
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 4) Giriş yapmış kullanıcılar için silme erişimi politikası
CREATE POLICY "allow_authenticated_delete" 
ON products
FOR DELETE 
USING (auth.role() = 'authenticated');

-- NOT: Sadece geliştirme ortamında kullanın!
-- Tüm işlemlere izin veren genel bir politika
-- CREATE POLICY "allow_all_access" ON products USING (true);

-- RLS'yi tamamen devre dışı bırakmak istiyorsanız (sadece geliştirme ortamında kullanın!):
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- RLS devre dışı bırakma yardımcı fonksiyonu (servis rolüyle kullanılabilir)
CREATE OR REPLACE FUNCTION disable_rls_for_development(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS etkinleştirme yardımcı fonksiyonu (servis rolüyle kullanılabilir)
CREATE OR REPLACE FUNCTION enable_rls_for_production(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politikaları test etme fonksiyonu
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- RLS durumunu kontrol et
  SELECT jsonb_build_object(
    'rls_enabled', pg_catalog.has_table_privilege('anon', 'products', 'SELECT'),
    'insert_allowed', pg_catalog.has_table_privilege('authenticated', 'products', 'INSERT'),
    'update_allowed', pg_catalog.has_table_privilege('authenticated', 'products', 'UPDATE'),
    'delete_allowed', pg_catalog.has_table_privilege('authenticated', 'products', 'DELETE')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 