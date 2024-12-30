import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvqvfwxbgbxoqhbxpjlr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cXZmd3hiZ2J4b3FoYnhwamxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTk1NzAsImV4cCI6MjAyMjQ3NTU3MH0.Ue_WBhMY5_7f6CiYHJJk9sDBAuGqhXZ5cXhPwXqcYXE'
);

const sampleProducts = [
  // Giyim Kategorisi
  {
    name: 'Slim Fit Pamuklu T-Shirt',
    price: 199.99,
    discountPrice: 159.99,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format',
    brand: 'Example Brand',
    category: 'Giyim',
    subcategory: 'T-shirt & Sweatshirt',
    rating: 4.5,
    stock: 100,
    description: 'Yüksek kaliteli pamuklu kumaştan üretilmiş slim fit t-shirt'
  },
  {
    name: 'Klasik Kesim Gömlek',
    price: 299.99,
    discountPrice: 299.99,
    discountRate: 0,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format',
    brand: 'Example Brand',
    category: 'Giyim',
    subcategory: 'Gömlek & Bluz',
    rating: 4.8,
    stock: 75,
    description: 'Şık ve rahat klasik kesim gömlek'
  },

  // Elektronik Kategorisi
  {
    name: 'Akıllı Telefon XYZ',
    price: 12999.99,
    discountPrice: 11049.99,
    discountRate: 15,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format',
    brand: 'TechBrand',
    category: 'Elektronik',
    subcategory: 'Telefon',
    rating: 4.7,
    stock: 50,
    description: 'Son teknoloji akıllı telefon'
  },
  {
    name: 'Dizüstü Bilgisayar Pro',
    price: 24999.99,
    discountPrice: 22499.99,
    discountRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format',
    brand: 'TechBrand',
    category: 'Elektronik',
    subcategory: 'Bilgisayar',
    rating: 4.9,
    stock: 30,
    description: 'Profesyonel kullanım için dizüstü bilgisayar'
  },

  // Ev & Mobilya Kategorisi
  {
    name: 'Modern Koltuk Takımı',
    price: 15999.99,
    discountPrice: 13599.99,
    discountRate: 15,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format',
    brand: 'HomeBrand',
    category: 'Ev & Mobilya',
    subcategory: 'Mobilya',
    rating: 4.6,
    stock: 10,
    description: 'Modern tasarımlı rahat koltuk takımı'
  },
  {
    name: 'Dekoratif Masa Lambası',
    price: 499.99,
    discountPrice: 399.99,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format',
    brand: 'HomeBrand',
    category: 'Ev & Mobilya',
    subcategory: 'Aydınlatma',
    rating: 4.4,
    stock: 45,
    description: 'Şık ve modern tasarımlı masa lambası'
  },

  // Kozmetik Kategorisi
  {
    name: 'Ruj Seti Deluxe',
    price: 399.99,
    discountPrice: 319.99,
    discountRate: 20,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format',
    brand: 'BeautyBrand',
    category: 'Kozmetik',
    subcategory: 'Makyaj',
    rating: 4.8,
    stock: 60,
    description: 'Lüks ruj seti, 5 farklı renk'
  },
  {
    name: 'Erkek Parfüm 100ml',
    price: 899.99,
    discountPrice: 809.99,
    discountRate: 10,
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format',
    brand: 'BeautyBrand',
    category: 'Kozmetik',
    subcategory: 'Parfüm',
    rating: 4.7,
    stock: 40,
    description: 'Kalıcı ve etkileyici erkek parfümü'
  }
];

async function seedProducts() {
  console.log('Ürünler veritabanına ekleniyor...');

  for (const product of sampleProducts) {
    try {
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
      console.log(`Ürün eklendi: ${product.name}`);
    } catch (error) {
      console.error(`Ürün eklenirken hata: ${product.name}`, error);
    }
  }
}

// Scripti çalıştır
seedProducts().then(() => {
  console.log('Tüm örnek ürünler veritabanına eklendi');
}).catch(error => {
  console.error('Script çalışırken hata oluştu:', error);
}); 