import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const GITHUB_BIBLE_API = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json';

export default function BibleReaderScreen() {
  const router = useRouter();
  const { book, chapter, name, version } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseFontSize, setBaseFontSize] = useState(18); // Zoom State

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  useEffect(() => {
    const versionMap: Record<string, string> = {
      nvi: 'pt_nvi',
      arc: 'pt_acf', // Using ACF which is equivalent to ARC structure
      ara: 'pt_ara'
    };
    
    const fileVersion = versionMap[(version as string) || 'nvi'] || 'pt_nvi';
    const url = `${GITHUB_BIBLE_API}/${fileVersion}.json`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Find the specific book by its name (e.g. "Gênesis") or fallback to abbrev
        const bookData = data.find((b: any) => 
           b.name.toLowerCase() === (name as string)?.toLowerCase() || 
           b.abbrev.toLowerCase() === (book as string)?.toLowerCase()
        );

        if (bookData && bookData.chapters) {
          const chapterIdx = parseInt(chapter as string) - 1;
          const versesStrings = bookData.chapters[chapterIdx];
          
          if (versesStrings && Array.isArray(versesStrings)) {
            const formatted = versesStrings.map((text: string, i: number) => ({
               number: i + 1,
               text
            }));
            setVerses(formatted);
          } else {
            throw new Error('Capítulo não encontrado na base.');
          }
        } else {
          throw new Error('Livro não encontrado na base de dados.');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching Bible verses from Github:', err);
        setVerses([
          { number: 1, text: "Ocorreu um erro ao baixar a base de dados da Bíblia." },
          { number: 2, text: "Verifique sua conexão com a internet e tente novamente mais tarde." },
        ]);
        setLoading(false);
      });
  }, [book, chapter, name, version]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: cardColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: cardColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: textColor }]}>{name} {chapter}</Text>
            <Text style={[styles.headerSubtitle, { color: textMuted }]}>Versão: {(version as string)?.toUpperCase() || 'NVI'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.zoomBtn, { backgroundColor: isDark ? '#2c3444' : '#EAEAEA' }]}
            onPress={() => setBaseFontSize(prev => Math.max(12, prev - 2))}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={18} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.zoomBtn, { backgroundColor: isDark ? '#2c3444' : '#EAEAEA' }]}
            onPress={() => setBaseFontSize(prev => Math.min(36, prev + 2))}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={18} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={{ marginTop: 16, color: textColor }}>Buscando texto sagrado...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={[styles.readerCard, { backgroundColor: cardColor, borderColor }]}>
            <Text style={[styles.chapterHeading, { color: textColor }]}>
              Capítulo {chapter}
            </Text>

            <View style={styles.versesContainer}>
              {verses.map((v) => (
                <Text 
                  key={v.number} 
                  style={[styles.verseLine, { 
                    color: textColor, 
                    fontSize: baseFontSize, 
                    lineHeight: baseFontSize * 1.5 
                  }]}
                >
                  <Text style={[styles.verseNumber, { color: '#0a7ea4', fontSize: baseFontSize * 0.75 }]}>
                    {v.number} 
                  </Text>
                  {v.text}
                </Text>
              ))}
            </View>
            
            <View style={styles.footerInfo}>
               <Text style={{ color: textMuted, fontStyle: 'italic', fontSize: 13, textAlign: 'center' }}>
                 Base de dados provida pela API abibliadigital.com.br
               </Text>
            </View>
          </View>

        </ScrollView>
      )}
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  readerCard: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  chapterHeading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  versesContainer: {
    gap: 16,
  },
  verseLine: {
    fontWeight: '400',
  },
  verseNumber: {
    fontWeight: '700',
    top: -4, // Superscript effect
  },
  footerInfo: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  }
});
