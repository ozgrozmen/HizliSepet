import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container } from '@mantine/core';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      setError('Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2}>
        HızlıSepet'e Hoş Geldiniz
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Hesabınız yok mu?{' '}
        <Link to="/signup" style={{ color: 'var(--mantine-color-blue-filled)' }}>
          Hesap Oluştur
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="E-posta"
            placeholder="ornek@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Şifre"
            placeholder="Şifreniz"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Text c="red" size="sm" mt="sm">
              {error}
            </Text>
          )}
          <Button type="submit" fullWidth mt="xl">
            Giriş Yap
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 