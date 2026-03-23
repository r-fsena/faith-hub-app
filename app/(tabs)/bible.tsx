import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

const BIBLE_API_URL = 'https://www.abibliadigital.com.br/api';

import { BIBLE_BOOKS } from '@/constants/BibleBooks';

export default function BibleScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>(BIBLE_BOOKS);
  const [version, setVersion] = useState<'nvi' | 'arc' | 'ara'>('nvi');
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === 'dark' ? '#1D3D47' : '#A1CEDC';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor }]}>
        <ThemedText type="title" style={styles.headerTitle}>Bíblia Sagrada</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Selecione a versão e o livro</ThemedText>
      </View>
      
      {/* VERSION SELECTOR */}
      <View style={styles.versionSelector}>
        <TouchableOpacity 
          style={[styles.versionBtn, version === 'nvi' && { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' }]} 
          onPress={() => setVersion('nvi')}
        >
          <ThemedText style={[styles.versionText, version === 'nvi' && { color: '#FFF' }]}>NVI</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.versionBtn, version === 'arc' && { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' }]} 
          onPress={() => setVersion('arc')}
        >
          <ThemedText style={[styles.versionText, version === 'arc' && { color: '#FFF' }]}>ARC</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.versionBtn, version === 'ara' && { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' }]} 
          onPress={() => setVersion('ara')}
        >
          <ThemedText style={[styles.versionText, version === 'ara' && { color: '#FFF' }]}>ARA</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.abbrev}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.bookItem, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}
            onPress={() => router.push(`/bible/${item.abbrev}?name=${item.name}&chapters=${item.chapters}&version=${version}` as any)}
          >
            <View style={styles.bookInfo}>
              <ThemedText type="defaultSemiBold" style={{ color: textColor, fontSize: 16 }}>{item.name}</ThemedText>
              <ThemedText style={[styles.author, { color: textColor }]}>{item.author}</ThemedText>
            </View>
            <View style={styles.chaptersBadge}>
              <ThemedText style={styles.chaptersText}>{item.chapters} cap.</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#0a7ea4" />
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  versionSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 6,
    gap: 12,
  },
  versionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  versionText: {
    color: '#0a7ea4',
    fontWeight: '700',
    fontSize: 13,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  bookInfo: {
    flex: 1,
  },
  author: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  chaptersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chaptersText: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
