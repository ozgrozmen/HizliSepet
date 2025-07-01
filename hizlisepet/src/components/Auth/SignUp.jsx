import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Container, 
  Stack,
  Alert,
  Transition,
  Divider,
  Progress
} from '@mantine/core';
import { useAuth } from '../../context/AuthContext';
import { 
  IconAlertCircle, 
  IconMail, 
  IconLock, 
  IconUserPlus,
  IconCheck,
  IconX
} from '@tabler/icons-react';

function PasswordRequirement({ meets, label }) {
  return (
    <Text color={meets ? 'teal' : 'red'} size="sm" mt={5}>
      {meets ? <IconCheck size={14} /> : <IconX size={14} />} {label}
    </Text>
  );
}

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

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const strength = getStrength(password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('E-posta ve şifre alanları boş olamaz.');
      setLoading(false);
      return;
    }

    if (strength < 50) {
      setError('Lütfen daha güçlü bir şifre oluşturun.');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      navigate('/login', { state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    } catch (error) {
      setError('Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      setLoading(false);
    }
  };

  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        key={index}
        value={
          password.length > 0 && index === 0 ? 100 : strength >= ((index + 1) / 4) * 100 ? 100 : 0
        }
        color={strength > 80 ? 'teal' : strength > 50 ? 'yellow' : 'red'}
        size={4}
        style={{ marginBottom: 4 }}
      />
    ));

  return (
    <Container 
      size={420} 
      my={40}
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Transition mounted={true} transition="fade" duration={400} timingFunction="ease">
        {(styles) => (
          <Paper
            withBorder
            shadow="md"
            p={30}
            radius="lg"
            style={{
              ...styles,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Title ta="center" order={1} mb="lg" style={{ color: '#1a1b1e' }}>
              HızlıSepet'e Katılın
            </Title>

            <Text c="dimmed" size="sm" ta="center" mb="lg">
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#228be6',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Giriş Yapın
              </Link>
            </Text>

            {error && (
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Hata" 
                color="red" 
                mb="lg"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing="md">
                <TextInput
                  label="E-posta"
                  placeholder="ornek@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<IconMail size={16} />}
                  radius="md"
                  size="md"
                  disabled={loading}
                />

                <div>
                  <PasswordInput
                    label="Şifre"
                    placeholder="Güçlü bir şifre oluşturun"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<IconLock size={16} />}
                    radius="md"
                    size="md"
                    disabled={loading}
                  />

                  <div style={{ marginTop: 10 }}>
                    {bars}
                    {password.length > 0 && (
                      <Text size="sm" color="dimmed" mt={5}>
                        Şifre güçlülüğü: {strength < 50 ? 'Zayıf' : strength < 80 ? 'Orta' : 'Güçlü'}
                      </Text>
                    )}
                    {password.length > 0 && checks}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  fullWidth 
                  mt="xl"
                  size="md"
                  radius="md"
                  loading={loading}
                  leftSection={<IconUserPlus size={20} />}
                  gradient={{ from: 'blue', to: 'cyan' }}
                  variant="gradient"
                  disabled={strength < 50}
                >
                  Kayıt Ol
                </Button>
              </Stack>
            </form>

            <Divider my="lg" label="Kayıt olarak" labelPosition="center" />

            <Text c="dimmed" size="xs" ta="center">
              HızlıSepet'in{' '}
              <Link to="/terms" style={{ color: '#228be6', textDecoration: 'none' }}>
                Kullanım Koşulları
              </Link>
              {' '}ve{' '}
              <Link to="/privacy" style={{ color: '#228be6', textDecoration: 'none' }}>
                Gizlilik Politikası
              </Link>
              'nı kabul etmiş olursunuz.
            </Text>
          </Paper>
        )}
      </Transition>
    </Container>
  );
} 