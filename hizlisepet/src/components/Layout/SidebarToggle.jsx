import { useState } from 'react';
import { ActionIcon, Drawer, Text, Transition, Paper, Group, Badge, ScrollArea } from '@mantine/core';
import { IconMenu2, IconLayoutSidebarLeftCollapse, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { Categories } from './Categories';

export function SidebarToggle() {
  const [opened, setOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Transition
        mounted={!opened}
        transition="slide-right"
        duration={400}
      >
        {(styles) => (
          <div
            style={{
              ...styles,
              position: 'fixed',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 999,
            }}
          >
            <ActionIcon
              variant="filled"
              size="xl"
              onClick={() => setOpened(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              sx={(theme) => ({
                backgroundColor: '#ffffff',
                color: theme.colors.dark[5],
                width: '28px',
                height: '65px',
                borderRadius: '0 8px 8px 0',
                marginLeft: 0,
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  color: theme.colors.dark[7],
                }
              })}
            >
              <IconLayoutSidebarLeftCollapse 
                size={18} 
                style={{
                  transition: 'transform 0.3s ease'
                }}
              />
            </ActionIcon>
          </div>
        )}
      </Transition>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size={360}
        padding={0}
        position="left"
        overlayProps={{ opacity: 0.2, blur: 2 }}
        styles={(theme) => ({
          content: {
            backgroundColor: 'transparent',
            marginTop: '90px',
            marginBottom: '20px',
            borderRadius: '0 16px 16px 0',
            height: 'calc(100vh - 110px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            position: 'sticky',
            left: 0
          },
          header: {
            display: 'none'
          },
          body: {
            height: '100%',
            padding: 0,
            backgroundColor: theme.white,
            borderRadius: '0 16px 16px 0',
          },
          inner: {
            padding: 0,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(2px)',
          }
        })}
      >
        <Paper p={0} radius={0} style={{ height: '100%', position: 'relative' }}>
          <Paper 
            p="md" 
            radius={0}
            style={{
              borderBottom: '1px solid #f0f0f0',
              background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
            }}
          >
            <Group position="apart" align="center">
              <Group spacing="xs">
                <IconLayoutSidebarLeftCollapse size={22} stroke={1.5} />
                <Text size="lg" fw={600} style={{ 
                  color: '#2C3E50',
                  letterSpacing: '-0.3px'
                }}>
                  Kategoriler
                </Text>
              </Group>
              <Badge 
                variant="dot" 
                color="blue"
                size="sm"
                styles={{
                  root: {
                    backgroundColor: '#EDF2FF',
                    textTransform: 'none',
                  }
                }}
              >
                Tüm Kategoriler
              </Badge>
            </Group>
          </Paper>

          <ScrollArea h="calc(100% - 130px)" type="hover" scrollbarSize={6} offsetScrollbars>
            <div style={{ padding: '15px' }}>
              <Categories onClose={() => setOpened(false)} />
            </div>
          </ScrollArea>

          <Paper 
            p="xs" 
            radius={0}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: '1px solid #f0f0f0',
              background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
              textAlign: 'center',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
          >
            <Text size="xs" c="dimmed">
              Kategorilerde kolayca gezinin
            </Text>
          </Paper>
        </Paper>
      </Drawer>
    </>
  );
} 