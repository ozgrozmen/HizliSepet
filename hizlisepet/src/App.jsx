import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Navbar } from './components/Layout/Navbar';
import { Categories } from './components/Layout/Categories';
import { Footer } from './components/Layout/Footer';
import { CategoryPage } from './components/Category/CategoryPage';
import { HomePage } from './components/Home/HomePage';
import { AuthProvider } from './context/AuthContext';
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
        <Router>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
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
                <>
                  <Navbar />
                  <Categories />
                  <HomePage />
                  <Footer />
                </>
              } />
              <Route path="/category/:category" element={
                <>
                  <Navbar />
                  <Categories />
                  <CategoryPage />
                  <Footer />
                </>
              } />
              <Route path="/category/:category/:subcategory" element={
                <>
                  <Navbar />
                  <Categories />
                  <CategoryPage />
                  <Footer />
                </>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

