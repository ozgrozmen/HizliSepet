import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  TextInput, 
  Button, 
  Group, 
  Stack,
  NumberInput,
  Text,
  Paper
} from '@mantine/core';
import { supabase } from '../../lib/supabase';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

export function NewCategoryPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: null
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Önce kategori adının benzersiz olduğunu kontrol et
      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', formData.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingCategory) {
        notifications.show({
          title: 'Hata',
          message: 'Bu isimde bir kategori zaten mevcut',
          color: 'red'
        });
        return;
      }

      // Kategoriyi ekle
      const { error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: formData.name,
          description: formData.description,
          parent_id: formData.parent_id
        }]);

      if (insertError) throw insertError;

      notifications.show({
        title: 'Başarılı',
        message: 'Yeni kategori başarıyla eklendi',
        color: 'green'
      });

      navigate('/admin/categories');
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      notifications.show({
        title: 'Hata',
        message: 'Kategori eklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md">
      <Paper shadow="sm" p="xl" withBorder>
        <Title order={2} mb="xl">Yeni Kategori Ekle</Title>
        
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Kategori Adı"
              placeholder="Kategori adını girin"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              withAsterisk
              description="Kategori adı benzersiz olmalıdır"
            />

            <TextInput
              label="Açıklama"
              placeholder="Kategori açıklamasını girin"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Group justify="flex-end" mt="xl">
              <Button
                variant="default"
                onClick={() => navigate('/admin/categories')}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                color="blue"
                loading={loading}
                disabled={!formData.name.trim()}
              >
                Kaydet
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
} 