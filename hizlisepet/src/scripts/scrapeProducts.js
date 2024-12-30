import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvqvfwxbgbxoqhbxpjlr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cXZmd3hiZ2J4b3FoYnhwamxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4OTk1NzAsImV4cCI6MjAyMjQ3NTU3MH0.Ue_WBhMY5_7f6CiYHJJk9sDBAuGqhXZ5cXhPwXqcYXE'
);

async function addProduct(product) {
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

const categories = [
  {
    name: 'Giyim',
    url: 'https://www.hepsiburada.com/giyim-c-2147483638',
    subcategories: {
      'Kadın Giyim': 'kadin-giyim-c-12087178',
      'Erkek Giyim': 'erkek-giyim-c-12087177',
      'Elbise': 'elbise-c-12087297',
      'Gömlek & Bluz': 'gomlek-bluz-c-12087298',
      'T-shirt & Sweatshirt': 'tisort-sweatshirt-c-12087299',
      'Pantolon & Şort': 'pantolon-sort-c-12087300',
      'Ceket & Mont': 'ceket-mont-c-12087301'
    }
  },
  {
    name: 'Elektronik',
    url: 'https://www.hepsiburada.com/elektronik-c-2147483602',
    subcategories: {
      'Telefon': 'telefon-c-371965',
      'Bilgisayar': 'bilgisayar-c-2147483646',
      'Tablet': 'tablet-c-3008012',
      'TV & Ses Sistemleri': 'tv-goruntu-ses-sistemleri-c-2147483604',
      'Beyaz Eşya': 'beyaz-esya-c-18020286'
    }
  },
  {
    name: 'Ev & Mobilya',
    url: 'https://www.hepsiburada.com/ev-yasam-c-2147483639',
    subcategories: {
      'Mobilya': 'mobilya-c-18020298',
      'Ev Tekstili': 'ev-tekstili-c-18020297',
      'Aydınlatma': 'aydinlatma-c-18020299',
      'Dekorasyon': 'dekorasyon-c-18020300',
      'Mutfak Gereçleri': 'mutfak-gerecleri-c-18020301'
    }
  },
  {
    name: 'Kozmetik',
    url: 'https://www.hepsiburada.com/kozmetik-kisisel-bakim-c-2147483605',
    subcategories: {
      'Makyaj': 'makyaj-c-2147483619',
      'Parfüm': 'parfum-deodorant-c-2147483620',
      'Cilt Bakımı': 'cilt-bakimi-c-2147483621',
      'Saç Bakımı': 'sac-bakimi-c-2147483622'
    }
  }
];

async function scrapeProducts() {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // User agent ayarla
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  for (const category of categories) {
    console.log(`Kategori taranıyor: ${category.name}`);

    for (const [subName, subUrl] of Object.entries(category.subcategories)) {
      console.log(`Alt kategori taranıyor: ${subName}`);

      try {
        await page.goto(`https://www.hepsiburada.com/${subUrl}`, {
          waitUntil: 'networkidle0',
          timeout: 60000
        });

        // Sayfanın yüklenmesi için bekle
        await page.waitForSelector('[data-test-id="product-card"]', { timeout: 10000 });

        const products = await page.evaluate(() => {
          const items = document.querySelectorAll('[data-test-id="product-card"]');
          return Array.from(items, item => {
            const priceEl = item.querySelector('[data-test-id="price-current-price"]');
            const oldPriceEl = item.querySelector('[data-test-id="price-prev-price"]');
            const ratingEl = item.querySelector('[data-test-id="rating"]');
            
            const name = item.querySelector('h3')?.innerText || '';
            const price = priceEl ? parseFloat(priceEl.innerText.replace('TL', '').replace('.', '').replace(',', '.')) : 0;
            const oldPrice = oldPriceEl ? parseFloat(oldPriceEl.innerText.replace('TL', '').replace('.', '').replace(',', '.')) : price;
            const discountRate = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
            const imageUrl = item.querySelector('img')?.src || '';
            const rating = ratingEl ? parseFloat(ratingEl.innerText) : 0;
            const brand = item.querySelector('[data-test-id="brand"]')?.innerText || '';

            return {
              name,
              price: oldPrice,
              discountPrice: price,
              discountRate,
              imageUrl,
              brand,
              category: category.name,
              subcategory: subName,
              rating,
              stock: Math.floor(Math.random() * 100) + 1,
              description: `${brand} ${name}`
            };
          });
        });

        console.log(`${products.length} ürün bulundu`);

        for (const product of products) {
          if (product.name && product.price > 0) {
            try {
              await addProduct(product);
              console.log(`Ürün eklendi: ${product.name}`);
            } catch (error) {
              console.error(`Ürün eklenirken hata: ${product.name}`, error);
            }
          }
        }

        // Sayfa başına bekleme süresi
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Alt kategori taranırken hata: ${subName}`, error);
      }
    }
  }

  await browser.close();
}

// Scripti çalıştır
scrapeProducts().then(() => {
  console.log('Tüm ürünler tarandı ve kaydedildi');
}).catch(error => {
  console.error('Script çalışırken hata oluştu:', error);
}); 