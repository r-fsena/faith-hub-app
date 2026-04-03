import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator, Linking, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Study = {
  id: string;
  title: string;
  description: string;
  content_type: 'VIDEO' | 'PDF' | 'TEXT';
  link: string;
  date_published: string;
  content_text?: string;
  target_group_name?: string;
};

export default function GroupStudiesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [studies, setStudies] = useState<Study[]>([]);
  const [readStudyIds, setReadStudyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTextStudy, setSelectedTextStudy] = useState<Study | null>(null);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const accentColor = '#8A2BE2'; 

  useEffect(() => {
    loadStudies();
    loadReadHistory();
  }, []);

  const loadReadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('@faithhub_read_studies');
      if (saved) {
        setReadStudyIds(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading read history', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      if (!readStudyIds.includes(id)) {
        const updated = [...readStudyIds, id];
        setReadStudyIds(updated);
        await AsyncStorage.setItem('@faithhub_read_studies', JSON.stringify(updated));
      }
    } catch (e) {
      console.log('Error saving read history', e);
    }
  };

  const loadStudies = async () => {
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
      } catch (e) { console.log("Failed to fetch user group for studies:", e); }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch(`${baseUrl}/studies${groupId ? `?group_id=${groupId}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStudies(data);
      }
    } catch (err) {
      console.log('Error loading studies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStudy = (study: Study) => {
    markAsRead(study.id);
    if (study.content_type === 'TEXT') {
      setSelectedTextStudy(study);
    } else if (study.link) {
      Linking.openURL(study.link).catch((err) => console.error("Couldn't open URL:", err));
    }
  };

  const getFormatProps = (type: string) => {
    switch(type) {
      case 'VIDEO': return { icon: 'youtube', color: '#FF3B30', label: 'Vídeo' };
      case 'PDF': return { icon: 'file-text', color: '#34C759', label: 'PDF' };
      default: return { icon: 'align-left', color: '#5bc3bb', label: 'Texto' };
    }
  };
  
  // Dividir a lista em Não Lidos (Destaques) e Histórico (Lidos)
  const unreadStudies = studies.filter(s => !readStudyIds.includes(s.id));
  const historyStudies = studies.filter(s => readStudyIds.includes(s.id));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View>
             <Text style={[styles.headerTitle, { color: textColor }]}>Estudos de Célula</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>Material Oficial</Text>
          </View>
          <View style={styles.backBtn}><Feather name="book" size={24} color="transparent" /></View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
          ) : studies.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Feather name="book-open" size={48} color={borderColor} style={{ marginBottom: 16 }} />
              <Text style={{ color: textMuted, fontSize: 16, textAlign: 'center' }}>
                Nenhum estudo cadastrado ainda.
              </Text>
            </View>
          ) : (
            <>
              {/* Carrossel de Destaques (Não Lidos / Novos) */}
              {unreadStudies.length > 0 && (
                <View style={{ marginHorizontal: -20, marginBottom: 32 }}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    decelerationRate="fast"
                    snapToInterval={316} // 300 (width) + 16 (marginRight)
                    snapToAlignment="start"
                  >
                    {unreadStudies.map((study, idx) => {
                      const format = getFormatProps(study.content_type);
                      return (
                        <View key={study.id} style={[styles.highlightCard, { backgroundColor: format.color, width: 300, marginRight: 16, marginBottom: 0 }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Feather name="star" size={24} color="#FFF" style={{ marginBottom: 12 }} />
                            {study.target_group_name && (
                              <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>Restrito p/ seu grupo</Text>
                              </View>
                            )}
                          </View>
                          
                          <Text style={[styles.highlightSuperText, { color: 'rgba(255,255,255,0.8)' }]}>
                            {idx === 0 ? "NOVIDADE - NÃO LIDO" : "ESTUDO PENDENTE"}
                          </Text>
                          <Text style={[styles.highlightTitle, { color: '#FFF' }]} numberOfLines={2}>{study.title}</Text>
                          
                          {(study.link || study.content_type === 'TEXT') && (
                            <TouchableOpacity 
                              style={[styles.highlightBtn, { backgroundColor: '#FFF', marginTop: 'auto' }]}
                              onPress={() => handleOpenStudy(study)}
                            >
                              <Text style={[styles.highlightBtnText, { color: format.color }]}>
                                Acessar {format.label}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Sempre Mostrar Sessão de Histórico */}
              <View style={{ marginTop: unreadStudies.length === 0 ? 10 : 0 }}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Histórico de Estudos</Text>
              </View>

              {historyStudies.length === 0 ? (
                 <View style={{ alignItems: 'center', marginTop: 30, padding: 20, borderWidth: 1, borderColor: borderColor, borderStyle: 'dashed', borderRadius: 16 }}>
                   <Feather name="archive" size={32} color={textMuted} style={{ marginBottom: 12, opacity: 0.5 }} />
                   <Text style={{ color: textMuted, textAlign: 'center', fontSize: 13 }}>
                     Ainda não há histórico a ser exibido.{'\n'}Abra um estudo no carrossel acima para que ele venha para cá.
                   </Text>
                 </View>
              ) : (
                historyStudies.map((study, index) => {
                  const isLast = index === historyStudies.length - 1;
                  const format = getFormatProps(study.content_type);
                  
                  return (
                    <TouchableOpacity 
                      key={study.id} 
                      style={[styles.studyRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}
                      activeOpacity={0.7}
                      onPress={() => handleOpenStudy(study)}
                    >
                      <View style={[styles.iconBox, { backgroundColor: isDark ? '#3a4455' : 'rgba(0,0,0,0.05)' }]}>
                        <Feather name="check-circle" size={22} color="#34C759" />
                      </View>
                      
                      <View style={styles.studyInfo}>
                        <Text style={[styles.studyTitle, { color: textColor }]}>{study.title}</Text>
                        <Text style={[styles.studyDate, { color: textMuted }]}>
                          Lido • {format.label}
                        </Text>
                      </View>
                      
                      <Feather name="refresh-cw" size={20} color={textMuted} />
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}
        </ScrollView>

        <Modal visible={!!selectedTextStudy} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedTextStudy(null)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
              <TouchableOpacity onPress={() => setSelectedTextStudy(null)} style={styles.backBtn}>
                <Feather name="x" size={24} color={textColor} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: textColor, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
                {selectedTextStudy?.title}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: textColor, marginBottom: 12 }}>
                {selectedTextStudy?.title}
              </Text>
              <Text style={{ fontSize: 14, color: textMuted, marginBottom: 30 }}>
                {selectedTextStudy?.date_published?.split('-').reverse().join('/')}
              </Text>
              <Text style={{ fontSize: 17, lineHeight: 28, color: textColor }}>
                {selectedTextStudy?.content_text || 'O conteúdo do estudo ainda não foi redigido pelo autor.'}
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>

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
  
  highlightCard: { padding: 24, borderRadius: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  highlightSuperText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  highlightTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20, lineHeight: 30 },
  highlightBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  highlightBtnText: { fontWeight: '800', fontSize: 15 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10 },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },

  studyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  studyInfo: { flex: 1, paddingRight: 10 },
  studyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  studyDate: { fontSize: 13 },
});
