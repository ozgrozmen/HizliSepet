import { Header as MantineHeader, Group, Button, Box } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  return (
    <MantineHeader height={60} px="md">
      <Group position="apart" sx={{ height: '100%' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box
            sx={(theme) => ({
              fontWeight: 700,
              fontSize: '1.5rem',
              color: theme.colors.blue[6],
            })}
          >
            HızlıSepet
          </Box>
        </Link>

        <Group>
          <Button variant="subtle" onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
          <Button onClick={() => navigate('/signup')}>
            Kayıt Ol
          </Button>
        </Group>
      </Group>
    </MantineHeader>
  );
} 