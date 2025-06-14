import { supabase } from './supabase';

// Admin yetkisi kontrol fonksiyonu
export async function checkAdminPermission() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Oturum açmanız gerekiyor');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Profil bilgileriniz alınamadı');
    }

    if (profile.role !== 'admin') {
      throw new Error('Bu işlem için admin yetkisi gerekiyor');
    }

    return { user, profile };
  } catch (error) {
    console.error('Admin yetki kontrolü hatası:', error);
    throw error;
  }
}

// Admin ürün işlemleri
export const adminProductApi = {
  // Ürün ekleme (sadece admin)
  async create(productData) {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) throw error;
    return data;
  },

  // Ürün güncelleme (sadece admin)
  async update(productId, productData) {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select();

    if (error) throw error;
    return data;
  },

  // Ürün silme (sadece admin)
  async delete(productId) {
    await checkAdminPermission();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  },

  // Tüm ürünleri getirme (sadece admin)
  async getAll() {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Admin kategori işlemleri
export const adminCategoryApi = {
  // Kategori ekleme (sadece admin)
  async create(categoryData) {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();

    if (error) throw error;
    return data;
  },

  // Kategori güncelleme (sadece admin)
  async update(categoryId, categoryData) {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select();

    if (error) throw error;
    return data;
  },

  // Kategori silme (sadece admin)
  async delete(categoryId) {
    await checkAdminPermission();
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  }
};

// Admin kullanıcı işlemleri
export const adminUserApi = {
  // Tüm kullanıcıları getirme (sadece admin)
  async getAll() {
    await checkAdminPermission();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Kullanıcı rolü güncelleme (sadece admin)
  async updateRole(userId, newRole) {
    await checkAdminPermission();
    
    // Güvenlik: Sadece admin ve user rolleri arasında değişiklik yapılabilir
    if (!['admin', 'user'].includes(newRole)) {
      throw new Error('Geçersiz rol');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  },

  // Kullanıcı silme (sadece admin, kendi hesabını silemez)
  async delete(userId) {
    const { user } = await checkAdminPermission();
    
    // Güvenlik: Admin kendi hesabını silemez
    if (user.id === userId) {
      throw new Error('Kendi hesabınızı silemezsiniz');
    }
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  }
};

// Admin istatistik işlemleri
export const adminStatsApi = {
  // Dashboard istatistikleri (sadece admin)
  async getDashboardStats() {
    await checkAdminPermission();
    
    try {
      // Paralel olarak tüm istatistikleri al
      const [
        { count: productsCount },
        { count: usersCount },
        { count: cartItemsCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('cart_items').select('*', { count: 'exact' })
      ]);

      return {
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        totalCartItems: cartItemsCount || 0,
        totalOrders: 0, // Orders tablosu olmadığı için 0
        totalRevenue: 0 // Orders tablosu olmadığı için 0
      };
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      throw error;
    }
  }
}; 