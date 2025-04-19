-- RLS politikalarını cart_items tablosu için etkinleştir (varsayılan olarak kapalıdır)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (isteğe bağlı)
DROP POLICY IF EXISTS "Kullanıcıların kendi sepet öğelerini görüntülemesine izin ver" ON cart_items;
DROP POLICY IF EXISTS "Kullanıcıların sepetlerine ürün eklemesine izin ver" ON cart_items;
DROP POLICY IF EXISTS "Kullanıcıların sepetlerinden ürün çıkarmasına izin ver" ON cart_items;
DROP POLICY IF EXISTS "Kullanıcıların sepet öğelerini güncellemesine izin ver" ON cart_items;

-- Kullanıcının kendi sepet öğelerini görüntülemesine izin veren politika
CREATE POLICY "Kullanıcıların kendi sepet öğelerini görüntülemesine izin ver"
ON cart_items
FOR SELECT
USING (auth.uid() = user_id);

-- Kullanıcının sepetine ürün eklemesine izin veren politika
CREATE POLICY "Kullanıcıların sepetlerine ürün eklemesine izin ver"
ON cart_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Kullanıcının sepetinden ürün çıkarmasına izin veren politika
CREATE POLICY "Kullanıcıların sepetlerinden ürün çıkarmasına izin ver"
ON cart_items
FOR DELETE
USING (auth.uid() = user_id);

-- Kullanıcının sepet öğelerini güncellemesine izin veren politika
CREATE POLICY "Kullanıcıların sepet öğelerini güncellemesine izin ver"
ON cart_items
FOR UPDATE
USING (auth.uid() = user_id);

-- NOT: Bu SQL komutlarını Supabase SQL Editör'de çalıştırın.
-- Geliştirme aşamasındaysanız ve hızlı bir çözüm istiyorsanız, 
-- aşağıdaki komutla RLS'yi tamamen devre dışı bırakabilirsiniz (güvenli değil):
-- ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY; 