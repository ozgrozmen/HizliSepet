import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${searchTerm}%`);

  if (error) throw error;
  return data;
} 