import { Group, Text, Stack, Container } from '@mantine/core';

export function Footer() {
  return (
    <footer style={{
      width: '100%',
      backgroundColor: 'white',
      borderTop: '1px solid #e9ecef',
      padding: '40px 0',
      marginTop: 'auto'
    }}>
      <Container fluid style={{ maxWidth: '100%', padding: 0 }}>
        <div style={{ width: '100%', padding: '0 40px' }}>
          <Group justify="space-between" align="flex-start">
            {/* Sol Kısım */}
            <Stack>
              <Text size="xl" fw={900}>HızlıSepet</Text>
              <Text size="sm" c="dimmed">
                Türkiye'nin en hızlı e-ticaret platformu
              </Text>
            </Stack>

            {/* Orta Kısım */}
            <Stack>
              <Text fw={700}>Kategoriler</Text>
              <Text size="sm" c="dimmed">Giyim</Text>
              <Text size="sm" c="dimmed">Elektronik</Text>
              <Text size="sm" c="dimmed">Ev & Yaşam</Text>
              <Text size="sm" c="dimmed">Kozmetik</Text>
            </Stack>

            {/* Sağ Kısım */}
            <Stack>
              <Text fw={700}>Yardım</Text>
              <Text size="sm" c="dimmed">Sıkça Sorulan Sorular</Text>
              <Text size="sm" c="dimmed">İade ve Değişim</Text>
              <Text size="sm" c="dimmed">İletişim</Text>
            </Stack>
          </Group>

          <Text ta="center" size="sm" c="dimmed" mt="xl">
            © 2024 HızlıSepet. Tüm hakları saklıdır.
          </Text>
        </div>
      </Container>
    </footer>
  );
} 