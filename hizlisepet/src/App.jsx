import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { HomePage } from './components/Home/HomePage';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

function App() {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
