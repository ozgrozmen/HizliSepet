import { Container, Group, Button, Paper, Stack, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

const categories = [
  { 
    name: 'Giyim',
    subcategories: [
      'Kadın Giyim',
      'Erkek Giyim',
      'Elbise',
      'Gömlek & Bluz',
      'T-shirt & Sweatshirt',
      'Pantolon & Şort',
      'Etek & Tulum',
      'Ceket & Mont',
      'Takım Elbise',
      'İç Giyim & Pijama',
      'Spor Giyim',
      'Hamile Giyim',
      'Plaj Giyim',
      'Büyük Beden',
      'Tesettür Giyim',
      'Aksesuar'
    ]
  },
  { 
    name: 'Anne & Çocuk',
    subcategories: [
      'Bebek Giyim',
      'Çocuk Giyim',
      'Bebek Bakım',
      'Bebek Bezi & Mendil',
      'Bebek Arabaları',
      'Oto Koltuğu',
      'Mama Sandalyesi',
      'Oyuncak'
    ]
  },
  { 
    name: 'Ev & Mobilya',
    subcategories: [
      'Mobilya',
      'Ev Tekstili',
      'Aydınlatma',
      'Dekorasyon',
      'Mutfak Gereçleri',
      'Banyo',
      'Ev Düzenleme',
      'Bahçe'
    ]
  },
  { 
    name: 'Süpermarket',
    subcategories: [
      'Temel Gıda',
      'Atıştırmalık',
      'İçecek',
      'Kahvaltılık',
      'Temizlik',
      'Kağıt Ürünleri',
      'Kişisel Bakım',
      'Ev Bakım'
    ]
  },
  { 
    name: 'Kozmetik',
    subcategories: [
      'Makyaj',
      'Parfüm',
      'Cilt Bakımı',
      'Saç Bakımı',
      'Kişisel Bakım',
      'Güneş Ürünleri',
      'Erkek Bakım',
      'Organik Kozmetik'
    ]
  },
  { 
    name: 'Ayakkabı & Çanta',
    subcategories: [
      'Kadın Ayakkabı',
      'Erkek Ayakkabı',
      'Çocuk Ayakkabı',
      'Spor Ayakkabı',
      'Çanta',
      'Cüzdan',
      'Sırt Çantası',
      'Valiz'
    ]
  },
  { 
    name: 'Elektronik',
    subcategories: [
      'Telefon',
      'Bilgisayar',
      'Tablet',
      'TV & Ses Sistemleri',
      'Beyaz Eşya',
      'Küçük Ev Aletleri',
      'Oyun & Oyun Konsolları',
      'Foto & Kamera'
    ]
  },
  { 
    name: 'Spor & Outdoor',
    subcategories: [
      'Spor Giyim',
      'Spor Ayakkabı',
      'Fitness & Kondisyon',
      'Outdoor & Kamp',
      'Bisiklet',
      'Scooter',
      'Spor Ekipmanları',
      'Sporcu Besinleri'
    ]
  }
];

export function Categories() {
  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: 'white',
      borderBottom: '1px solid #e9ecef',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container size="xl">
        <Group wrap="nowrap" justify="center" gap="md">
          {categories.map((category) => (
            <div
              key={category.name}
              style={{ position: 'relative' }}
              onMouseEnter={(e) => {
                if (category.subcategories) {
                  e.currentTarget.querySelector('.subcategories').style.display = 'block';
                }
              }}
              onMouseLeave={(e) => {
                if (category.subcategories) {
                  e.currentTarget.querySelector('.subcategories').style.display = 'none';
                }
              }}
            >
              <Button
                variant="default"
                size="sm"
                rightSection={category.subcategories && <IconChevronDown size={14} />}
                styles={{
                  root: {
                    color: '#333',
                    padding: '0 15px',
                    height: '32px',
                    whiteSpace: 'nowrap',
                    borderColor: '#dee2e6',
                    backgroundColor: 'white',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#dee2e6'
                    }
                  }
                }}
              >
                {category.name}
              </Button>
              {category.subcategories && (
                <Paper
                  className="subcategories"
                  shadow="sm"
                  style={{
                    display: 'none',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '200px',
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderTop: 'none',
                    zIndex: 1000,
                    marginTop: '1px'
                  }}
                >
                  <Stack gap={0}>
                    {category.subcategories.map((subcat) => (
                      <Button
                        key={subcat}
                        variant="subtle"
                        size="sm"
                        styles={{
                          root: {
                            color: '#333',
                            padding: '8px 15px',
                            height: 'auto',
                            justifyContent: 'flex-start',
                            '&:hover': {
                              backgroundColor: '#f8f9fa'
                            }
                          }
                        }}
                      >
                        {subcat}
                      </Button>
                    ))}
                  </Stack>
                </Paper>
              )}
            </div>
          ))}
        </Group>
      </Container>
    </div>
  );
} 