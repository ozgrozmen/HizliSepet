import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Layout } from './components/Layout/Layout';
import { CategoryPage } from './components/Category/CategoryPage';
import { HomePage } from './components/Home/HomePage';
import { ProductDetail } from './components/Product/ProductDetail';
import { FavoritesPage } from './components/Favorites/FavoritesPage';
import { AuthProvider } from './context/AuthContext';
import { FavoriteProvider } from './context/FavoriteContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import Products from './components/Admin/Products';
import AdminCategories from './components/Admin/Categories';
import Users from './components/Admin/Users';

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <FavoriteProvider>
          <Router>
            <div className="app-container">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="users" element={<Users />} />
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
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
              </Routes>
            </div>
          </Router>
        </FavoriteProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

