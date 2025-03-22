import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Paper, Stack, Title, Text, Alert, Center, Container, Loader } from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const { user, loading, authError, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';

  // Eğer kullanıcı zaten giriş yapmışsa, ana sayfaya yönlendir
  useEffect(() => {
    if (user) {
      console.log('Kullanıcı zaten giriş yapmış, yönlendiriliyor:', returnUrl);
      navigate(returnUrl);
    }
  }, [user, navigate, returnUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoginStatus('Giriş yapılıyor...');

    // Form doğrulama
    if (!email.trim() || !password.trim()) {
      setFormError('E-posta ve şifre alanları boş olamaz.');
      setLoginStatus('');
      return;
    }

    try {
      console.log('Giriş yapılıyor:', email);
      await signIn(email, password);
      setLoginStatus('Giriş başarılı! Yönlendiriliyor...');
      
      // Giriş başarılı olduktan sonra navigasyon AuthContext içindeki useEffect ile otomatik yapılacak
    } catch (error) {
      console.error('Giriş hatası:', error.message);
      setFormError(error.message || 'Giriş yapılamadı. E-posta veya şifre hatalı olabilir.');
      setLoginStatus('');
    }
  };

  // Eğer sayfa yükleniyorsa ve kullanıcı kontrol ediliyorsa
  if (loading && !formError && !loginStatus) {
    return (
      <Center style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
        <Stack align="center" spacing="md">
          <Loader size="lg" />
          <Text>Oturum kontrol ediliyor...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
      <Container size="xs">
        <Paper radius="md" p="xl" withBorder>
          <Title align="center" order={1} mb="md">
            Giriş Yap
          </Title>

          {authError && (
            <Alert icon={<IconAlertCircle size={16} />} title="Sistem Hatası" color="red" mb="md">
              {authError}
            </Alert>
          )}

          {formError && (
            <Alert icon={<IconAlertCircle size={16} />} title="Hata" color="red" mb="md">
              {formError}
            </Alert>
          )}

          {loginStatus && (
            <Alert icon={<IconInfoCircle size={16} />} title="Bilgi" color="blue" mb="md">
              {loginStatus}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                required
                label="E-posta"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <PasswordInput
                required
                label="Şifre"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <Button 
                type="submit" 
                fullWidth 
                loading={loading}
                disabled={!email || !password}
              >
                Giriş Yap
              </Button>
            </Stack>
          </form>

          <Text align="center" mt="md">
            Henüz hesabınız yok mu?{' '}
            <Link to="/signup" style={{ color: '#228be6', textDecoration: 'none' }}>
              Kayıt Ol
            </Link>
          </Text>
        </Paper>
      </Container>
    </Center>
  );
} 