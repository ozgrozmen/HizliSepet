import { Container } from '@mantine/core';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Categories } from './Categories';

export function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Categories />
      <main style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa', 
        padding: '5px'
      }}>
        <Container size="xl">
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
} 