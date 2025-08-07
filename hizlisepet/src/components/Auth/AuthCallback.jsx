import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Container, Paper, Title, Text, Loader, Center } from '@mantine/core';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session yenileme hatası:', error);
          throw error;
        }

        // Başarılı doğrulama sonrası login sayfasına yönlendir
        navigate('/login', {
          state: {
            message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.'
          }
        });
      } catch (error) {
        console.error('Doğrulama hatası:', error);
        navigate('/login', {
          state: {
            error: 'E-posta doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin.'
          }
        });
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <Container size="xs" style={{ marginTop: '100px' }}>
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} align="center" mb="md">
          E-posta Doğrulanıyor
        </Title>
        <Center>
          <Loader size="lg" variant="dots" />
        </Center>
        <Text align="center" mt="md" size="sm" c="dimmed">
          Lütfen bekleyin, e-posta doğrulamanız işleniyor...
        </Text>
      </Paper>
    </Container>
  );
} 