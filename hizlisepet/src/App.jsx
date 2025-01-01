import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Navbar } from './components/Layout/Navbar';
import { Categories } from './components/Layout/Categories';
import { CategoryPage } from './components/Category/CategoryPage';
import { HomePage } from './components/Home/HomePage';

function App() {
  return (
    <MantineProvider>
      <Router>
        <Navbar />
        <Categories />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;

