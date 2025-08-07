import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Anchor,
  Group,
  Stack,
  Alert,
  Box,
  Modal,
  ThemeIcon,
  Center,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconAlertCircle, IconMail, IconCheck } from '@tabler/icons-react';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, resendConfirmationEmail } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(location.pathname === '/login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailNotConfirmed(false);

    try {
      if (isLoginMode) {
        const { error } = await login(email, password);
        if (error === 'email_not_confirmed') {
          setEmailNotConfirmed(true);
          return;
        }
        if (!error) {
          navigate('/');
        }
      } else {
        const { error } = await register(email, password);
        if (!error) {
          setRegisteredEmail(email);
          setShowVerificationModal(true);
          setEmail('');
          setPassword('');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const emailToResend = registeredEmail || email;
    await resendConfirmationEmail(emailToResend);
  };

  const handleModeChange = () => {
    setIsLoginMode(!isLoginMode);
    setEmailNotConfirmed(false);
    setShowVerificationModal(false);
    setEmail('');
    setPassword('');
  };

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        {isLoginMode ? 'Hoş Geldiniz!' : 'Hesap Oluşturun'}
      </Title>
      
      <Text color="dimmed" size="sm" align="center" mt={5}>
        {isLoginMode ? (
          <>
            Hesabınız yok mu?{' '}
            <Anchor size="sm" onClick={handleModeChange}>
              Hesap Oluşturun
            </Anchor>
          </>
        ) : (
          <>
            Zaten hesabınız var mı?{' '}
            <Anchor size="sm" onClick={handleModeChange}>
              Giriş Yapın
            </Anchor>
          </>
        )}
      </Text>

      {emailNotConfirmed && (
        <Alert 
          icon={<IconAlertCircle size={16} />}
          title="E-posta Doğrulanmamış"
          color="yellow"
          mt="md"
        >
          <Stack spacing="xs">
            <Text size="sm">
              Lütfen e-posta adresinize gönderilen doğrulama bağlantısını tıklayın.
            </Text>
            <Button
              variant="light"
              color="yellow"
              leftIcon={<IconMail size={16} />}
              onClick={handleResendConfirmation}
              size="xs"
            >
              Doğrulama E-postasını Tekrar Gönder
            </Button>
          </Stack>
        </Alert>
      )}

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
          
          <Group position="apart" mt="lg">
            {isLoginMode && (
              <Anchor
                onClick={() => navigate('/forgot-password')}
                size="sm"
              >
                Şifremi Unuttum
              </Anchor>
            )}
          </Group>
          
          <Button 
            fullWidth 
            mt="xl" 
            type="submit"
            loading={loading}
          >
            {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
          </Button>

          {!isLoginMode && (
            <Alert
              icon={<IconMail size={16} />}
              color="blue"
              variant="light"
              mt="md"
              styles={(theme) => ({
                root: {
                  backgroundColor: 'transparent',
                  border: `1px dashed ${theme.colors.blue[4]}`
                }
              })}
            >
              <Text size="sm" color="dimmed">
                Kayıt olduktan sonra hesabınızı aktifleştirmek için e-posta doğrulaması yapmanız gerekecektir.
              </Text>
            </Alert>
          )}
        </form>
      </Paper>

      <Modal
        opened={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        title="E-posta Doğrulaması Gerekli"
        centered
        closeOnClickOutside={false}
        size="md"
      >
        <Stack align="center" spacing="xl" py="md">
          <ThemeIcon
            size={80}
            radius="xl"
            color="blue"
          >
            <IconMail size={40} />
          </ThemeIcon>

          <Stack spacing="xs" align="center">
            <Text size="lg" weight={500} align="center">
              Hesabınız Oluşturuldu!
            </Text>
            
            <Text color="dimmed" align="center" px="md">
              Hesabınızı aktifleştirmek için lütfen <b>{registeredEmail}</b> adresine gönderilen doğrulama e-postasını kontrol edin ve bağlantıya tıklayın.
            </Text>

            <Text size="sm" color="dimmed" align="center" mt="xs">
              E-posta birkaç dakika içinde gelmezse, lütfen spam/gereksiz klasörünü kontrol edin.
            </Text>
          </Stack>

          <Stack spacing="xs" w="100%">
            <Button
              variant="light"
              color="blue"
              leftIcon={<IconMail size={16} />}
              onClick={handleResendConfirmation}
              fullWidth
            >
              Doğrulama E-postasını Tekrar Gönder
            </Button>

            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setShowVerificationModal(false);
                setIsLoginMode(true);
              }}
              fullWidth
            >
              Giriş Sayfasına Dön
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Container>
  );
} 