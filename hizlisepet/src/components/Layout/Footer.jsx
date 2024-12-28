import { Container, Group, Text, Stack, Anchor } from '@mantine/core';

export function Footer() {
  return (
    <div style={{ 
      width: '100vw', 
      backgroundColor: 'white',
      borderTop: '1px solid #e9ecef',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      maxWidth: '100%',
      margin: 0,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <Container size="xl" style={{ 
        width: '100%', 
        maxWidth: 'none',
        padding: '0 20px',
        margin: '0 auto'
      }}>
        <div style={{ padding: '40px 0' }}>
          <Group align="flex-start" gap={50} justify="center">
            <Stack gap="sm">
              <Text fw={600} size="lg">Hakkımızda</Text>
              <Anchor c="dimmed" underline="never">Biz Kimiz</Anchor>
              <Anchor c="dimmed" underline="never">İletişim</Anchor>
              <Anchor c="dimmed" underline="never">Kariyer</Anchor>
            </Stack>

            <Stack gap="sm">
              <Text fw={600} size="lg">Yardım</Text>
              <Anchor c="dimmed" underline="never">Sıkça Sorulan Sorular</Anchor>
              <Anchor c="dimmed" underline="never">Kargo Takip</Anchor>
              <Anchor c="dimmed" underline="never">İade Şartları</Anchor>
            </Stack>

            <Stack gap="sm">
              <Text fw={600} size="lg">Kategoriler</Text>
              <Anchor c="dimmed" underline="never">Elektronik</Anchor>
              <Anchor c="dimmed" underline="never">Moda</Anchor>
              <Anchor c="dimmed" underline="never">Ev & Yaşam</Anchor>
              <Anchor c="dimmed" underline="never">Spor & Outdoor</Anchor>
            </Stack>

            <Stack gap="sm">
              <Text fw={600} size="lg">İletişim</Text>
              <Text c="dimmed">info@hizlisepet.com</Text>
              <Text c="dimmed">0850 123 45 67</Text>
              <Text c="dimmed">
                Merkez Mah. E-Ticaret Cad.<br />
                No:123 Çankaya/Ankara
              </Text>
            </Stack>
          </Group>

          <Text ta="center" c="dimmed" mt={50}>
            © 2024 HızlıSepet. Tüm hakları saklıdır.
          </Text>
        </div>
      </Container>
    </div>
  );
} 