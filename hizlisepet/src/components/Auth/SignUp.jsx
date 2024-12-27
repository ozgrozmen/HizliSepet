import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Geçersiz email'),
      password: (value) => (value.length < 6 ? 'Şifre en az 6 karakter olmalıdır' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Şifreler eşleşmiyor' : null,
    },
  });

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      navigate('/login');
    } catch (error) {
      setError('Kayıt olurken bir hata oluştu');
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <Container size="xs" style={{ margin: '0 auto', padding: '20px' }}>
        <Stack justify="center" align="center">
          <Paper withBorder shadow="md" p={30} radius="md" bg="white" style={{ width: '100%', maxWidth: '400px' }}>
            <Title ta="center" fw={900} mb={20}>
              Yeni Hesap Oluştur
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb={30}>
              Zaten hesabınız var mı?{' '}
              <Text component="a" href="/login" size="sm" c="blue">
                Giriş Yap
              </Text>
            </Text>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Email"
                placeholder="ornek@email.com"
                required
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Şifre"
                placeholder="Şifreniz"
                required
                mt="md"
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label="Şifre Tekrar"
                placeholder="Şifrenizi tekrar girin"
                required
                mt="md"
                {...form.getInputProps('confirmPassword')}
              />

              {error && (
                <Text c="red" size="sm" mt="sm">
                  {error}
                </Text>
              )}

              <Button type="submit" fullWidth mt="xl" loading={loading}>
                Kayıt Ol
              </Button>
            </form>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
} 