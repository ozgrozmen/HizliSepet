import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Layout } from './components/Layout/Layout';
import { CategoryPage } from './components/Category/CategoryPage';
import { HomePage } from './components/Home/HomePage';
import { ProductDetail } from './components/Product/ProductDetail';
import { FavoritesPage } from './components/Favorites/FavoritesPage';
import { CartPage } from './components/Cart/CartPage';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import { CartProvider } from './context/CartContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
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

function App() {
  return (
    <MantineProvider>
      <Notifications position="bottom-right" />
      <AuthProvider>
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
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                </Routes>
              </div>
            </Router>
          </CartProvider>
        </FavoriteProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

