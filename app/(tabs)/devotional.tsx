import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function DevotionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const currentId = typeof params.id === 'string' ? params.id : '';
  const displayDate = typeof params.date === 'string' ? params.date : '';
  const [devotionalData, setDevotionalData] = useState<any>(null);
  const [personalNotes, setPersonalNotes] = useState('');
  const [internalStatus, setInternalStatus] = useState('pending');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        setIsInitializing(true);
        try {
          const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
          const user = await getCurrentUser().catch(() => null);
          const session = await fetchAuthSession().catch(() => null);
          const token = session?.tokens?.idToken?.toString() || '';
          
          let userId = '';
          if (user?.userId) userId = user.userId;

          const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
          
          let url = `${baseUrl}/devotionals/today?user_id=${userId}`;
          // Se clicou no calendário em um dia específico, nós passamos o ID como target (Ou a Data)
          // Mas na nossa API, `devotionals/today` suporta ?date=YYYY-MM-DD
          if (params.date && typeof params.date === 'string' && params.date.includes('-')) {
             url += `&date=${params.date}`;
          }

          const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
          
          if (!res.ok) {
            if (isMounted) setErrorMessage("Nenhum devocional foi publicado para este dia.");
          } else {
            const data = await res.json();
            if (isMounted) {
              setDevotionalData(data);
              if (data.user_note?.notes_text) {
                setPersonalNotes(data.user_note.notes_text);
                setInternalStatus(data.user_note.status);
              }
              setErrorMessage('');
            }
          }
        } catch(e) {
          if (isMounted) setErrorMessage("Não foi possível carregar o devocional.");
        } finally {
          if (isMounted) setIsInitializing(false);
        }
      };
      
      loadData();
      return () => { isMounted = false; };
    }, [currentId, params.status, params.date])
  );

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const accentColor = '#0a7ea4';
  const secondaryAccent = isDark ? 'rgba(10, 126, 164, 0.15)' : '#E6F4F8';

  if (isInitializing) {
    return <View style={{ flex: 1, backgroundColor: bgColor }} />; // Blank loader for instantaneous switch
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: bgColor, borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Devocional Diário</Text>
          <TouchableOpacity 
            style={[styles.calendarBtn, { backgroundColor: secondaryAccent }]}
            onPress={() => router.push('/devotional/calendar')}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={18} color={accentColor} />
            <Text style={[styles.calendarText, { color: accentColor }]}>Calendário</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {errorMessage && !devotionalData ? (
             <View style={{ alignItems: 'center', marginTop: 80 }}>
                <Feather name="coffee" size={48} color={textMuted} style={{ marginBottom: 16 }} />
                <Text style={{ color: textMuted, fontSize: 16, textAlign: 'center' }}>
                  {errorMessage}
                </Text>
             </View>
          ) : devotionalData ? (
            <>
              {/* HEADER DO DEVOCIONAL */}
              <View style={styles.metaDataRow}>
                <Text style={[styles.dateText, { color: accentColor }]}>{displayDate || new Date(devotionalData.available_date).toLocaleDateString('pt-BR')}</Text>
                <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#EAEAEA' }]}>
                  <Feather 
                    name={devotionalData.source_type === 'LOCAL' ? "home" : "globe"} 
                    size={12} 
                    color={textMuted} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[styles.badgeText, { color: textMuted }]}>
                    {devotionalData.source_type === 'LOCAL' ? 'Original da Igreja' : `Comp. de ${devotionalData.source_name}`}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.mainTitle, { color: textColor }]}>{devotionalData.title}</Text>

              {/* MÚSICA SUGERIDA */}
              {devotionalData.suggested_song_youtube_id && (
                <View style={[styles.musicCard, { backgroundColor: isDark ? '#2c3444' : '#F9FAFB', borderColor }]}>
                  <View style={styles.musicHeader}>
                    <Feather name="music" size={16} color={accentColor} />
                    <Text style={[styles.musicTitle, { color: textColor }]} numberOfLines={1}>{devotionalData.suggested_song_title || 'Louvor Recomendado'}</Text>
                    <TouchableOpacity onPress={() => setIsPlayingMusic(!isPlayingMusic)} style={[styles.musicPlayBtn, { backgroundColor: accentColor }]}>
                      <Feather name={isPlayingMusic ? "pause" : "play"} size={14} color="#FFF" style={{ marginLeft: isPlayingMusic ? 0 : 2 }} />
                    </TouchableOpacity>
                  </View>
                  {isPlayingMusic && (
                    <View style={{ borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
                      <YoutubePlayer
                        height={180}
                        play={isPlayingMusic}
                        videoId={devotionalData.suggested_song_youtube_id}
                        webViewStyle={{ opacity: 0.99 }} // Android crash fix
                      />
                    </View>
                  )}
                </View>
              )}

              {/* TEXTO CENTRAL (Versículo Tema) */}
              <View style={[styles.card, styles.centralTextCard, { backgroundColor: accentColor }]}>
                <Feather name="book-open" size={20} color="#FFF" style={styles.quoteIcon} />
                <Text style={styles.centralText}>{devotionalData.central_text}</Text>
              </View>

              {/* CONTEXTO DO DEVOCIONAL */}
              <View style={styles.contextContainer}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>O Contexto</Text>
                <Text style={[styles.contextText, { color: textColor }]}>{devotionalData.context_text}</Text>
              </View>

              {/* INDICAÇÃO DE ORAÇÃO */}
              <View style={[styles.card, { backgroundColor: secondaryAccent }]}>
                <View style={styles.cardHeader}>
                   <Feather name="heart" size={18} color={accentColor} />
                   <Text style={[styles.cardTitle, { color: accentColor }]}>Direção de Oração</Text>
                </View>
                <Text style={[styles.prayerText, { color: isDark ? '#DDD' : '#333' }]}>
                  {devotionalData.prayer_indication}
                </Text>
              </View>

              {/* COMENTÁRIO PASTORAL (Voz Local) */}
              {devotionalData.pastoral_comment && (
                <View style={[styles.card, styles.pastoralCard, { backgroundColor: cardColor, borderColor }]}>
                  <View style={styles.pastoralHeader}>
                    <Image 
                      source={{ uri: devotionalData.pastoral_author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(devotionalData.pastoral_author_name)}&background=0a7ea4&color=fff` }} 
                      style={styles.avatar} 
                    />
                    <View>
                      <Text style={[styles.authorName, { color: textColor }]}>
                        {devotionalData.pastoral_author_name}
                      </Text>
                      <Text style={[styles.authorRole, { color: textMuted }]}>
                        {devotionalData.pastoral_author_role} • Voz Pastoral
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.pastoralText, { color: textColor }]}>
                    "{devotionalData.pastoral_comment}"
                  </Text>
                </View>
              )}

              {/* ÁREA DE ANOTAÇÕES */}
              <View style={styles.notesContainer}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Minhas Observações</Text>
                <Text style={[styles.notesSubtitle, { color: textMuted }]}>
                  O que Deus falou com você através da palavra hoje? Suas notas são privadas na base de dados.
                </Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: cardColor, 
                    borderColor: borderColor,
                    color: textColor 
                  }]}
                  multiline
                  numberOfLines={6}
                  placeholder="Digite suas anotações e reflexões aqui..."
                  placeholderTextColor={textMuted}
                  value={personalNotes}
                  onChangeText={setPersonalNotes}
                  textAlignVertical="top"
                />
                <TouchableOpacity 
                  style={[
                    styles.saveBtn, 
                    { opacity: personalNotes.length > 0 ? 1 : 0.6 },
                    internalStatus === 'completed' && { backgroundColor: '#00C464' }
                  ]}
                  disabled={personalNotes.length === 0}
                  onPress={async () => {
                    try {
                      // Save online UPSERT
                      const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
                      const user = await getCurrentUser();
                      const session = await fetchAuthSession();
                      
                      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
                      await fetch(`${baseUrl}/devotionals/notes`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.tokens?.idToken?.toString()}`
                        },
                        body: JSON.stringify({
                          devotional_id: devotionalData.id,
                          user_id: user.userId,
                          notes_text: personalNotes,
                          status: 'completed'
                        })
                      });
                      
                      setInternalStatus('completed');
                    } catch(e) { console.log("Failed to save note online", e) }

                    // Route and force refresh
                    router.push(('/devotional/calendar?saved=true&forceRefresh=' + Date.now()) as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather 
                    name={internalStatus === 'completed' ? "edit-3" : "check"} 
                    size={18} 
                    color="#FFF" 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={styles.saveBtnText}>
                    {internalStatus === 'completed' 
                       ? 'Devocional Concluído (Salvo)' 
                       : internalStatus === 'missed' 
                         ? 'Concluir Leitura em Atraso' 
                         : 'Concluir Leitura e Banco'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  calendarText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },
  metaDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 24,
    letterSpacing: -1,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  centralTextCard: {
    paddingVertical: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
    opacity: 0.1,
    transform: [{ scale: 4 }],
  },
  centralText: {
    color: '#FFF',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  contextContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  contextText: {
    fontSize: 16,
    lineHeight: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  pastoralCard: {
    borderWidth: 1,
    padding: 20,
  },
  pastoralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '800',
  },
  authorRole: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  pastoralText: {
    fontSize: 15,
    lineHeight: 24,
  },
  notesContainer: {
    marginTop: 10,
  },
  notesSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  musicCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  musicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicTitle: {
    flex: 1,
    marginLeft: 8,
    marginRight: 16,
    fontSize: 14,
    fontWeight: '700',
  },
  musicPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
