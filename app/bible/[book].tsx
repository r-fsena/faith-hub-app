import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BibleBookScreen() {
  const router = useRouter();
  const { book, name, chapters, version } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const numChapters = parseInt(chapters as string) || 1;
  const chaptersArray = Array.from({ length: numChapters }, (_, i) => i + 1);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>{name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.infoBar}>
        <Text style={[styles.infoText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
          Versão selecionada: <Text style={{ fontWeight: '800', color: '#0a7ea4' }}>{(version as string)?.toUpperCase() || 'NVI'}</Text>
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Escolha o Capítulo</Text>
        
        <View style={styles.grid}>
          {chaptersArray.map((ch) => (
            <TouchableOpacity 
              key={ch} 
              style={[styles.chapterBtn, { backgroundColor: cardColor, borderColor }]}
              onPress={() => router.push(`/bible/read?book=${book}&chapter=${ch}&name=${name}&version=${version}` as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chapterText, { color: textColor }]}>{ch}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chapterBtn: {
    width: '21%', // 4 per row approximately
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chapterText: {
    fontSize: 18,
    fontWeight: '700',
  }
});
