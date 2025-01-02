import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Navbar } from './components/Layout/Navbar';
import { Categories } from './components/Layout/Categories';
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
              </>
            } />
            <Route path="/category/:category" element={
              <>
                <Navbar />
                <Categories />
                <CategoryPage />
              </>
            } />
            <Route path="/category/:category/:subcategory" element={
              <>
                <Navbar />
                <Categories />
                <CategoryPage />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

