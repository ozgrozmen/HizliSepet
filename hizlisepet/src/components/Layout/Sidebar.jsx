import { Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

const categories = [
  {
    name: 'Kadın',
    subcategories: ['Elbise', 'Gömlek', 'T-shirt', 'Pantolon', 'Ayakkabı']
  },
  {
    name: 'Erkek',
    subcategories: ['Gömlek', 'T-shirt', 'Pantolon', 'Ayakkabı', 'Aksesuar']
  },
  {
    name: 'Anne & Çocuk',
    subcategories: ['Bebek Giyim', 'Çocuk Giyim', 'Bebek Bakım', 'Oyuncak']
  },
  {
    name: 'Ev & Yaşam',
    subcategories: ['Mobilya', 'Dekorasyon', 'Ev Tekstili', 'Mutfak Gereçleri']
  },
  {
    name: 'Süpermarket',
    subcategories: ['Gıda', 'İçecek', 'Temizlik', 'Kişisel Bakım']
  },
  {
    name: 'Kozmetik',
    subcategories: ['Makyaj', 'Parfüm', 'Cilt Bakımı', 'Saç Bakımı']
  },
  {
    name: 'Ayakkabı & Çanta',
    subcategories: ['Kadın Ayakkabı', 'Erkek Ayakkabı', 'Çanta', 'Cüzdan']
  },
  {
    name: 'Elektronik',
    subcategories: ['Telefon', 'Bilgisayar', 'TV & Ses Sistemleri', 'Küçük Ev Aletleri']
  }
];

export function Sidebar() {
  return (
    <div style={{ 
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid #e9ecef',
      height: '100%',
      position: 'fixed',
      left: 0,
      top: '70px',
      overflowY: 'auto'
    }}>
      <Stack spacing={0}>
        {categories.map((category) => (
          <UnstyledButton
            key={category.name}
            sx={(theme) => ({
              display: 'block',
              width: '100%',
              padding: theme.spacing.sm,
              color: theme.black,
              position: 'relative',

              '&:hover': {
                backgroundColor: theme.colors.gray[0],

                '.subcategories': {
                  display: 'block'
                }
              }
            })}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Text size="sm">{category.name}</Text>
              <IconChevronRight size={16} style={{ opacity: 0.5 }} />
            </div>

            <div
              className="subcategories"
              style={{
                display: 'none',
                position: 'absolute',
                left: '100%',
                top: 0,
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderLeft: 'none',
                width: '200px',
                zIndex: 1000,
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
              }}
            >
              <Stack spacing={0}>
                {category.subcategories.map((subcat) => (
                  <UnstyledButton
                    key={subcat}
                    sx={(theme) => ({
                      display: 'block',
                      width: '100%',
                      padding: theme.spacing.sm,
                      color: theme.black,

                      '&:hover': {
                        backgroundColor: theme.colors.gray[0]
                      }
                    })}
                  >
                    <Text size="sm">{subcat}</Text>
                  </UnstyledButton>
                ))}
              </Stack>
            </div>
          </UnstyledButton>
        ))}
      </Stack>
    </div>
  );
} 