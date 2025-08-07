import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Divider,
  Stack,
  Alert,
  Progress,
  SimpleGrid,
  Center,
  Transition,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconMail,
  IconLock,
  IconLogin,
  IconUserPlus,
  IconCheck,
  IconX,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Şifre gereksinimleri için yardımcı bileşen
function PasswordRequirement({ meets, label }) {
  return (
    <Text color={meets ? 'teal' : 'red'} size="sm" mt={5}>
      {meets ? <IconCheck size={14} /> : <IconX size={14} />} {label}
    </Text>
  );
}

// Şifre güçlülüğünü hesaplama
function getStrength(password) {
  let multiplier = password.length > 7 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

const requirements = [
  { re: /[0-9]/, label: 'En az bir rakam içermeli' },
  { re: /[a-z]/, label: 'En az bir küçük harf içermeli' },
  { re: /[A-Z]/, label: 'En az bir büyük harf içermeli' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'En az bir özel karakter içermeli' },
];

export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp } = useAuth();
  const returnUrl = location.state?.returnUrl || '/';

  useEffect(() => {
    if (user) {
      navigate(returnUrl);
    }
  }, [user, navigate, returnUrl]);

  // Eğer kullanıcı henüz yüklenmediyse veya giriş yapmışsa içeriği gösterme
  if (user) {
    return null;
  }

  const strength = getStrength(registerPassword);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(registerPassword)}
    />
  ));

  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        key={index}
        value={
          registerPassword.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        size={4}
        style={{ marginBottom: 4 }}
      />
    ));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginStatus('Giriş yapılıyor...');
    setLoginLoading(true);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('E-posta ve şifre alanları boş olamaz.');
      setLoginStatus('');
      setLoginLoading(false);
      return;
    }

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        throw error;
      }

      setLoginStatus('Giriş başarılı! Yönlendiriliyor...');
    } catch (error) {
      console.error('❌ Giriş hatası:', error);
      setLoginError(error.message);
      setLoginStatus('');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    if (!registerEmail.trim() || !registerPassword.trim() || !firstName.trim() || !lastName.trim() || !confirmPassword.trim()) {
      setRegisterError('Lütfen tüm alanları doldurun.');
      setRegisterLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError('Şifreler eşleşmiyor. Lütfen kontrol edin.');
      setRegisterLoading(false);
      return;
    }

    if (strength < 50) {
      setRegisterError('Lütfen daha güçlü bir şifre oluşturun.');
      setRegisterLoading(false);
      return;
    }

    try {
      // 1. Auth kaydı oluştur
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data?.user) {
        // 2. Profiles tablosuna kayıt ekle
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: registerEmail,
            full_name: `${firstName} ${lastName}`,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
          setRegisterError('Profil oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
          return;
        }

        // 3. Başarılı kayıt mesajı göster
        navigate('/login', { 
          state: { 
            message: 'Kayıt başarılı! Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayın ve ardından giriş yapın.' 
          } 
        });
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      if (error.message?.includes('already registered')) {
        setRegisterError('Bu e-posta adresi zaten kayıtlı.');
      } else {
        setRegisterError('Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ffffff 0%, #e7f5ff 20%, #a5d8ff 40%, #74c0fc 60%, #339af0 80%, #1971c2 100%)',
      paddingTop: '40px',
      paddingBottom: '40px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dekoratif arka plan desenleri */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 75%, rgba(255, 255, 255, 0.4) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 80% 65%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <Container size="xl">
        <Transition mounted={true} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing={40}
              style={{
                ...styles,
                maxWidth: '1000px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Giriş Formu */}
              <Paper
                withBorder
                shadow="xl"
                p={30}
                radius="lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  maxHeight: '600px',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Title ta="center" order={2} mb="lg" style={{ color: '#1a1b1e' }}>
                  Giriş Yap
                </Title>

                {loginError && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Hata"
                    color="red"
                    mb="lg"
                    variant="light"
                    radius="md"
                  >
                    {loginError}
                  </Alert>
                )}

                {loginStatus && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Bilgi"
                    color="blue"
                    mb="lg"
                    variant="light"
                    radius="md"
                  >
                    {loginStatus}
                  </Alert>
                )}

                <form onSubmit={handleLogin}>
                  <Stack spacing="md">
                    <TextInput
                      required
                      label="E-posta"
                      placeholder="ornek@mail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      icon={<IconMail size={16} />}
                      radius="md"
                      size="md"
                      disabled={loginLoading}
                    />

                    <PasswordInput
                      required
                      label="Şifre"
                      placeholder="Şifreniz"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      icon={<IconLock size={16} />}
                      radius="md"
                      size="md"
                      disabled={loginLoading}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      loading={loginLoading}
                      disabled={!loginEmail || !loginPassword}
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
              </Paper>

              {/* Kayıt Formu */}
              <Paper
                withBorder
                shadow="xl"
                p={30}
                radius="lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Title ta="center" order={2} mb="lg" style={{ color: '#1a1b1e' }}>
                  Yeni Hesap Oluştur
                </Title>

                {registerError && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Hata"
                    color="red"
                    mb="lg"
                    variant="light"
                    radius="md"
                  >
                    {registerError}
                  </Alert>
                )}

                <form onSubmit={handleRegister}>
                  <Stack spacing="md">
                    <SimpleGrid cols={2}>
                      <TextInput
                        required
                        label="Ad"
                        placeholder="Adınız"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        icon={<IconUser size={16} />}
                        radius="md"
                        size="md"
                        disabled={registerLoading}
                      />

                      <TextInput
                        required
                        label="Soyad"
                        placeholder="Soyadınız"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        icon={<IconUser size={16} />}
                        radius="md"
                        size="md"
                        disabled={registerLoading}
                      />
                    </SimpleGrid>

                    <TextInput
                      required
                      label="E-posta"
                      placeholder="ornek@mail.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      icon={<IconMail size={16} />}
                      radius="md"
                      size="md"
                      disabled={registerLoading}
                    />

                    <div>
                      <PasswordInput
                        required
                        label="Şifre"
                        placeholder="Güçlü bir şifre oluşturun"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        icon={<IconLock size={16} />}
                        radius="md"
                        size="md"
                        disabled={registerLoading}
                      />

                      <PasswordInput
                        required
                        label="Şifre Tekrar"
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        icon={<IconLock size={16} />}
                        radius="md"
                        size="md"
                        disabled={registerLoading}
                        mt="md"
                        error={confirmPassword && registerPassword !== confirmPassword ? "Şifreler eşleşmiyor" : null}
                      />

                      <div style={{ marginTop: 10 }}>
                        {bars}
                        {registerPassword.length > 0 && (
                          <Text size="sm" color="dimmed" mt={5}>
                            Şifre güçlülüğü: {strength < 50 ? 'Zayıf' : strength < 80 ? 'Orta' : 'Güçlü'}
                          </Text>
                        )}
                        {registerPassword.length > 0 && checks}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      loading={registerLoading}
                      disabled={!registerEmail || !registerPassword || !firstName || !lastName || !confirmPassword || strength < 50 || registerPassword !== confirmPassword}
                      size="md"
                      radius="md"
                      leftSection={<IconUserPlus size={20} />}
                      gradient={{ from: 'violet', to: 'indigo' }}
                      variant="gradient"
                    >
                      Kayıt Ol
                    </Button>
                  </Stack>
                </form>

                <Text c="dimmed" size="xs" ta="center" mt="lg">
                  Kayıt olarak HızlıSepet'in{' '}
                  <Text
                    component="a"
                    href="/terms"
                    style={{ color: '#228be6', textDecoration: 'none' }}
                  >
                    Kullanım Koşulları
                  </Text>
                  {' '}ve{' '}
                  <Text
                    component="a"
                    href="/privacy"
                    style={{ color: '#228be6', textDecoration: 'none' }}
                  >
                    Gizlilik Politikası
                  </Text>
                  'nı kabul etmiş olursunuz.
                </Text>
              </Paper>
            </SimpleGrid>
          )}
        </Transition>
      </Container>
    </div>
  );
} 