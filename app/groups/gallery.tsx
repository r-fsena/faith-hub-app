import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 40 - (8 * (COLUMN_COUNT - 1))) / COLUMN_COUNT; // 40 is padding horizontal

type PostMedia = {
  id: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO';
  author_name: string;
  created_at: string;
};

export default function GroupGalleryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [photos, setPhotos] = useState<PostMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#5bc3bb';

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      let groupId = '';

      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          const userRes = await fetch(`${baseUrl}/members/${user.userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.data?.cell_group_id) {
              groupId = userData.data.cell_group_id;
            }
          }
        }
      } catch (e) { console.log(e); }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // Buscamos SOMENTE as postagens que contêm imagem/vídeo (Filtro Inteligente no Backend)
      const res = await fetch(`${baseUrl}/posts?media_only=true${groupId ? `&group_id=${groupId}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPhotos(await res.json());
      }
    } catch (err) {
      console.log('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View>
             <Text style={[styles.headerTitle, { color: textColor }]}>Álbum Oficial</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>{photos.length} fotos salvas</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/groups/board')}>
            <Feather name="plus" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {loading ? (
            <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
          ) : photos.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.6 }}>
               <Feather name="image" size={48} color={textMuted} style={{ marginBottom: 12 }} />
               <Text style={{ color: textMuted, textAlign: 'center', marginHorizontal: 30 }}>
                 Nenhuma foto encontrada. Envie imagens no Mural do grupo para que elas apareçam aqui!
               </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {photos.map((photo) => (
                <TouchableOpacity key={photo.id} style={styles.photoWrapper} activeOpacity={0.8}>
                  <Image source={{ uri: photo.media_url }} style={[styles.photo, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} />
                  {photo.media_type === 'VIDEO' && (
                    <View style={styles.videoIconOverlay}>
                      <Feather name="play-circle" size={24} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.emptyState}>
             <Feather name="camera" size={24} color={textMuted} style={{ marginBottom: 12, opacity: 0.3 }} />
             <Text style={[styles.emptyStateText, { color: textMuted }]}>
               Todas as fotos enviadas no mural da sua célula são arquivadas automaticamente aqui para gerar história!
             </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 2 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoWrapper: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photo: { borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' },
  videoIconOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },

  emptyState: { alignItems: 'center', padding: 32, marginTop: 40 },
  emptyStateText: { fontSize: 12, textAlign: 'center', lineHeight: 20, opacity: 0.6 }
});
