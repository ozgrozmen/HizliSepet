import { useState, useEffect } from 'react';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Stack, 
  Title, 
  Text, 
  Alert, 
  Center, 
  Container, 
  Loader,
  Transition,
  Divider
} from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconAlertCircle, 
  IconInfoCircle, 
  IconMail, 
  IconLock, 
  IconLogin 
} from '@tabler/icons-react';

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
          <Loader size="lg" variant="bars" color="blue" />
          <Text size="lg" fw={500}>Oturum kontrol ediliyor...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      <Container size="xs">
        <Transition mounted={true} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <Paper
              radius="lg"
              p="xl"
              withBorder
              shadow="md"
              style={{
                ...styles,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Title align="center" order={1} mb="lg" style={{ color: '#1a1b1e' }}>
                HızlıSepet'e Hoş Geldiniz
              </Title>

              {authError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Sistem Hatası" 
                  color="red" 
                  mb="md"
                  variant="light"
                  radius="md"
                >
                  {authError}
                </Alert>
              )}

              {formError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Hata" 
                  color="red" 
                  mb="md"
                  variant="light"
                  radius="md"
                >
                  {formError}
                </Alert>
              )}

              {loginStatus && (
                <Alert 
                  icon={<IconInfoCircle size={16} />} 
                  title="Bilgi" 
                  color="blue" 
                  mb="md"
                  variant="light"
                  radius="md"
                >
                  {loginStatus}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing="md">
                  <TextInput
                    required
                    label="E-posta"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    icon={<IconMail size={16} />}
                    radius="md"
                    size="md"
                  />

                  <PasswordInput
                    required
                    label="Şifre"
                    placeholder="Şifreniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    icon={<IconLock size={16} />}
                    radius="md"
                    size="md"
                  />

                  <Button 
                    type="submit" 
                    fullWidth 
                    loading={loading}
                    disabled={!email || !password}
                    size="md"
                    radius="md"
                    leftSection={<IconLogin size={20} />}
                    gradient={{ from: 'blue', to: 'cyan' }}
                    variant="gradient"
                  >
                    Giriş Yap
                  </Button>
                </Stack>
              </form>

              <Divider my="lg" label="veya" labelPosition="center" />

              <Text align="center" size="sm" style={{ color: '#495057' }}>
                Henüz hesabınız yok mu?{' '}
                <Link 
                  to="/signup" 
                  style={{ 
                    color: '#228be6', 
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Hemen Kayıt Olun
                </Link>
              </Text>
            </Paper>
          )}
        </Transition>
      </Container>
    </Center>
  );
} 