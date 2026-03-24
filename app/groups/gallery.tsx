import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 40 - (8 * (COLUMN_COUNT - 1))) / COLUMN_COUNT; // 40 is padding horizontal

const mockPhotos = [
  { id: '1', url: 'https://images.unsplash.com/photo-1543884144-80252b47fc0d?q=80&w=800&auto=format&fit=crop' },
  { id: '2', url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop' },
  { id: '3', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop' },
  { id: '4', url: 'https://images.unsplash.com/photo-1529070538774-1843cb1c117d?q=80&w=800&auto=format&fit=crop' },
  { id: '5', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop' },
  { id: '6', url: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=800&auto=format&fit=crop' },
  { id: '7', url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?q=80&w=800&auto=format&fit=crop' },
  { id: '8', url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop' },
];

export default function GroupGalleryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
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
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>{mockPhotos.length} fotos salvas</Text>
          </View>
          <TouchableOpacity style={styles.backBtn}>
            <Feather name="upload-cloud" size={22} color="#5bc3bb" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.gridContainer}>
            {mockPhotos.map((photo, index) => (
              <TouchableOpacity key={photo.id} style={styles.photoWrapper} activeOpacity={0.8}>
                <Image source={{ uri: photo.url }} style={[styles.photo, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.emptyState}>
             <Feather name="camera" size={32} color={textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
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
  photoWrapper: { borderRadius: 12, overflow: 'hidden' },
  photo: { borderRadius: 12 },

  emptyState: { alignItems: 'center', padding: 32, marginTop: 40 },
  emptyStateText: { fontSize: 13, textAlign: 'center', lineHeight: 20, opacity: 0.8 }
});
