import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BIBLE_API_URL = 'https://www.abibliadigital.com.br/api';

export default function BibleScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetch(`${BIBLE_API_URL}/books`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Bible books:', err);
        setLoading(false);
      });
  }, []);

  const backgroundColor = colorScheme === 'dark' ? '#1D3D47' : '#A1CEDC';
  const textColor = colorScheme === 'dark' ? '#fff' : '#000';

  if (loading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff' }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Carregando Bíblia...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor }]}>
        <ThemedText type="title" style={styles.headerTitle}>Bíblia Sagrada</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Escolha um livro para começar a leitura</ThemedText>
      </View>
      <FlatList
        data={books}
        keyExtractor={(item) => item.abbrev.pt}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.bookItem, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}>
            <View style={styles.bookInfo}>
              <ThemedText type="defaultSemiBold" style={{ color: textColor }}>{item.name}</ThemedText>
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
