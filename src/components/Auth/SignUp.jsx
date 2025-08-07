import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Alert,
  Stack,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // E-posta formatı kontrolü
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      setLoading(false);
      return;
    }

    // Şifre kontrolü
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(), // E-postayı küçük harfe çevir ve boşlukları temizle
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email.toLowerCase().trim(),
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı.');
        } else if (signUpError.message.includes('invalid format')) {
          setError('Geçerli bir e-posta adresi giriniz.');
        } else {
          setError(signUpError.message);
        }
      } else if (data?.user) {
        setRegistered(true);
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <Container size={420} my={40}>
        <Alert
          icon={<IconAlertCircle size="1.1rem" />}
          title="E-posta Doğrulaması Gerekli"
          color="blue"
          radius="md"
        >
          <Text size="sm" mb={10}>
            Hesabınız başarıyla oluşturuldu! Hesabınızı aktifleştirmek için lütfen e-posta adresinizi kontrol edin.
          </Text>
          <Text size="sm" mb={10}>
            Size gönderdiğimiz doğrulama bağlantısına tıklayarak hesabınızı aktifleştirebilirsiniz.
          </Text>
          <Text size="xs" c="dimmed">
            Not: Spam/gereksiz klasörünüzü de kontrol etmeyi unutmayın.
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2}>
        Yeni Hesap Oluştur
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size="1.1rem" />} color="red">
                {error}
              </Alert>
            )}

            <TextInput
              required
              label="E-posta"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              error={email && !validateEmail(email) ? 'Geçerli bir e-posta adresi giriniz' : null}
            />

            <PasswordInput
              required
              label="Şifre"
              placeholder="Şifreniz (en az 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={password && password.length < 6 ? 'Şifre en az 6 karakter olmalıdır' : null}
            />

            <Button type="submit" loading={loading}>
              Kayıt Ol
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 