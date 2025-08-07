import { Button, Stack, Collapse, Text, Divider } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconCategory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName.toLowerCase().replace(/ & /g, '-')}`);
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    navigate(`/category/${categoryName.toLowerCase().replace(/ & /g, '-')}/${subcategoryName.toLowerCase().replace(/ & /g, '-')}`);
  };

  const toggleCategory = (categoryName, e) => {
    e.stopPropagation();
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <Stack spacing={0}>
      {categories.map((category, index) => (
        <div key={category.name}>
          {index > 0 && <Divider my={2} variant="dashed" opacity={0.3} />}
          
          <Button
            variant={expandedCategory === category.name ? "light" : "subtle"}
            fullWidth
            onClick={() => handleCategoryClick(category.name)}
            rightSection={
              category.subcategories && (
                <div onClick={(e) => toggleCategory(category.name, e)}
                style={{
                  backgroundColor: '#2C3E50',
                  borderRadius: '4px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  marginLeft: '8px'
                }}
                >
                  {expandedCategory === category.name ? (
                    <IconChevronDown size={14} stroke={2} color="#ffffff" />
                  ) : (
                    <IconChevronRight size={14} stroke={2} color="#ffffff" />
                  )}
                </div>
              )
            }
            leftSection={<IconCategory size={16} />}
            styles={(theme) => ({
              root: {
                color: '#333',
                padding: '8px 12px',
                height: 'auto',
                justifyContent: 'space-between',
                fontWeight: 500,
                borderRadius: theme.radius.md,
                backgroundColor: expandedCategory === category.name ? theme.colors.blue[0] : 'transparent',
                '&:hover': {
                  backgroundColor: expandedCategory === category.name ? theme.colors.blue[0] : theme.colors.gray[0]
                }
              },
              inner: {
                justifyContent: 'flex-start'
              },
              label: {
                fontSize: '0.85rem',
                letterSpacing: '-0.2px'
              }
            })}
          >
            {category.name}
          </Button>
          
          {category.subcategories && (
            <Collapse in={expandedCategory === category.name}>
              <Stack spacing={0} pl={8} py={3} style={{ backgroundColor: '#f8f9fa', borderRadius: '0 0 4px 4px' }}>
                {category.subcategories.map((subcat) => (
                  <Button
                    key={subcat}
                    variant="subtle"
                    size="xs"
                    onClick={() => handleSubcategoryClick(category.name, subcat)}
                    styles={(theme) => ({
                      root: {
                        color: '#555',
                        padding: '4px 8px',
                        height: 'auto',
                        justifyContent: 'flex-start',
                        borderRadius: 0,
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        '&:hover': {
                          backgroundColor: theme.colors.gray[1]
                        }
                      }
                    })}
                  >
                    {subcat}
                  </Button>
                ))}
              </Stack>
            </Collapse>
          )}
        </div>
      ))}
    </Stack>
  );
} 