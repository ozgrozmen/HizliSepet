import React, { useState, useEffect } from 'react';
import { AppShell, Navbar, Stack, Group, Text, UnstyledButton, Badge } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader } from '@mantine/core';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Tüm kategorileri getir
      const { data: allCategories, error: mainError } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name', { ascending: true });

      if (mainError) {
        console.error('Supabase hatası:', mainError);
        throw mainError;
      }

      if (!allCategories || allCategories.length === 0) {
        setCategories([]);
        return;
      }

      // Her kategori için ürün sayısını hesapla
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          try {
            const { data: products, error: productError } = await supabase
              .from('products')
              .select('id')
              .eq('category', category.id);

            if (productError) {
              console.error(`Kategori ${category.name} için ürün sayısı hesaplanırken hata:`, productError);
              return {
                ...category,
                product_count: 0
              };
            }

            return {
              ...category,
              product_count: products ? products.length : 0
            };
          } catch (error) {
            console.error(`Kategori ${category.name} için sayı hesaplanırken hata:`, error);
            return {
              ...category,
              product_count: 0
            };
          }
        })
      );

      // Ürün sayısına göre sırala (en çok ürün olan üstte)
      const sortedCategories = categoriesWithCounts.sort((a, b) => b.product_count - a.product_count);
      
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategories = () => {
    if (loading) {
      return (
        <Stack align="center" spacing="xs">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">Kategoriler yükleniyor...</Text>
        </Stack>
      );
    }

    return categories.map((category) => (
      <UnstyledButton
        key={category.id}
        className={classes.category}
        onClick={() => navigate(`/category/${encodeURIComponent(category.name.toLowerCase())}`)}
      >
        <Group position="apart" style={{ width: '100%' }}>
          <Text size="sm" fw={500}>
            {category.name}
          </Text>
          <Badge 
            color={category.product_count > 0 ? "blue" : "gray"} 
            variant="light" 
            size="sm"
          >
            {category.product_count}
          </Badge>
        </Group>
      </UnstyledButton>
    ));
  };

  return (
    <AppShell
      navbar={
        <Navbar width={{ base: 300 }} p="md" className={classes.navbar}>
          <Navbar.Section>
            <Group position="apart" mb="md">
              <Text size="lg" fw={700}>Kategoriler</Text>
            </Group>
            <Stack spacing="xs">
              {renderCategories()}
            </Stack>
          </Navbar.Section>
        </Navbar>
      }
    >
      {/* ... existing code ... */}
    </AppShell>
  );
};

export default HomePage; 