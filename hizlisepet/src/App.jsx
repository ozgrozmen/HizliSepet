import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { CategoryPage } from './components/Category/CategoryPage';
import { HomePage } from './components/Home/HomePage';
import { ProductDetail } from './components/Product/ProductDetail';
import { FavoritesPage } from './components/Favorites/FavoritesPage';
import { CartPage } from './components/Cart/CartPage';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { CartProvider } from './context/CartContext';
import AuthPage from './components/Auth/AuthPage';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import Products from './components/Admin/Products';
import Users from './components/Admin/Users';
import Orders from './components/Admin/Orders';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { NewCategoryPage } from './pages/admin/NewCategoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProtectedRoute } from './components/Admin/ProtectedRoute';
import AuthCallback from './components/Auth/AuthCallback';

// Loading component
function LoadingScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e9ecef', 
          borderTop: '4px solid #228be6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#666', margin: 0 }}>Yükleniyor...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Auth wrapper component
function AuthenticatedApp() {
  const { loading, isInitialized } = useAuth();

  if (loading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <FavoriteProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Routes>
                  {/* Admin Routes - Sadece adminler erişebilir */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="categories/new" element={<NewCategoryPage />} />
                    <Route path="users" element={<Users />} />
                    <Route path="orders" element={<Orders />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/" element={
                    <Layout>
                      <HomePage />
                    </Layout>
                  } />
                  <Route path="/category/:category" element={
                    <Layout>
                      <CategoryPage />
                    </Layout>
                  } />
                  <Route path="/category/:category/:subcategory" element={
                    <Layout>
                      <CategoryPage />
                    </Layout>
                  } />
                  <Route path="/product/:productId" element={
                    <Layout>
                      <ProductDetail />
                    </Layout>
                  } />
                  <Route path="/favorites" element={
                    <Layout>
                      <FavoritesPage />
                    </Layout>
                  } />
                  <Route path="/cart" element={
                    <Layout>
                      <CartPage />
                    </Layout>
                  } />
                  <Route path="/orders" element={
                    <Layout>
                      <OrdersPage />
                    </Layout>
                  } />
                  <Route path="/checkout" element={
                    <Layout>
                      <CheckoutPage />
                    </Layout>
                  } />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
              </div>
            </Router>
          </CartProvider>
        </FavoriteProvider>
  );
}

function App() {
  return (
    <MantineProvider>
      <Notifications position="bottom-right" />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

