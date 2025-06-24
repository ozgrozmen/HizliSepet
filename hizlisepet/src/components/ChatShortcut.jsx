import React, { useState } from 'react';
import { Drawer, Button, ActionIcon, Group, Text } from '@mantine/core';
import { IconChevronLeft, IconMessageCircle2 } from '@tabler/icons-react';

export function ChatShortcut() {
  const [opened, setOpened] = useState(false);

  const handleToggle = () => setOpened((prev) => !prev);

  // Mobilde tam ekran, masaüstünde telefon gibi ortalanmış panel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size={isMobile ? '100%' : 400}
        padding={0}
        withCloseButton={false}
        overlayProps={{ opacity: 0.3, blur: 2 }}
        styles={{
          content: {
            background: '#f8fafc',
            borderTopLeftRadius: isMobile ? 0 : 32,
            borderBottomLeftRadius: isMobile ? 0 : 32,
            borderTopRightRadius: isMobile ? 0 : 32,
            borderBottomRightRadius: isMobile ? 0 : 32,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            margin: isMobile ? 0 : '32px 0',
            height: isMobile ? '100vh' : '90vh',
            maxWidth: isMobile ? '100vw' : 400,
            right: isMobile ? 0 : 32,
            top: isMobile ? 0 : '5vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 0,
          },
          body: { padding: 0, width: '100%', height: '100%' },
        }}
      >
        {/* Hoparlör çentiği efekti */}
        <div style={{ width: 60, height: 8, background: '#e0e3e7', borderRadius: 8, margin: '18px auto 18px auto' }} />
        {/* Başlık barı ile üst arasında boşluk */}
        <div style={{ height: 10 }} />
        <Group justify="space-between" align="center" px={16} py={6} style={{ borderBottom: '1px solid #e9ecef', width: '100%', minHeight: 38 }}>
          <Text fw={700} size="md">Canlı Destek</Text>
          <ActionIcon variant="light" color="blue" size={32} onClick={() => setOpened(false)}>
            <IconChevronLeft size={16} />
          </ActionIcon>
        </Group>
        <div style={{ padding: 18, color: '#888', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Sohbet paneli buraya gelecek...
        </div>
      </Drawer>
      <Button
        onClick={handleToggle}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 32,
          zIndex: 9999,
          borderRadius: '50%',
          width: 60,
          height: 60,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          padding: 0,
          background: '#228be6',
          color: '#fff',
          fontSize: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        variant="filled"
        size="xl"
        aria-label="Canlı Destek"
      >
        <IconMessageCircle2 size={32} />
      </Button>
    </>
  );
} 