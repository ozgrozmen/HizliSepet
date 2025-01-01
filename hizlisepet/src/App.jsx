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

function App() {
  return (
    <MantineProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Categories />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;

