import { Container } from '@mantine/core';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChatShortcut } from '../ChatShortcut';

export function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Navbar />
      <main style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa', 
        padding: 0,
        width: '100%'
      }}>
        <Container fluid style={{ maxWidth: '100%', padding: 0 }}>
          {children}
        </Container>
      </main>
      <Footer />
      <ChatShortcut />
    </div>
  );
} 