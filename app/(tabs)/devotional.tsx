import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock de Banco de Dados Flexível:
// Suporta Devocionais Originais da Igreja ou Devocionais Globais (com comentário do Pastor local)
const devotionalData = {
  id: 'd-101',
  date: '23 de Março',
  title: 'A Paz que Excede o Entendimento',
  sourceType: 'GLOBAL', // 'LOCAL' ou 'GLOBAL'
  sourceName: 'Pão Diário Mídia', // Fonte originária se for Global
  centralText: '"E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus." \n— Filipenses 4:7',
  contextText: 'Vivemos em um mundo acelerado onde a ansiedade muitas vezes bate à nossa porta. O apóstolo Paulo nos lembra que existe uma paz sobrenatural, uma paz que a mente humana não consegue explicar nem fabricar artificialmente.\n\nEssa paz não é a ausência de problemas, mas a presença e a garantia de Cristo no meio da tempestade. Quando entregamos nossas preocupações a Ele através da oração e ações de graças, essa paz se torna a sentinela armada protegendo nossas emoções.',
  prayerIndication: 'Senhor, hoje eu Te entrego todas as minhas ansiedades. Ajuda-me a confiar no Teu cuidado e enche o meu coração com a Tua paz que excede todo o entendimento. Que a minha mente esteja protegida em Cristo. Amém.',
  pastoralComment: {
    authorName: 'Pr. Rafael Sena',
    authorRole: 'Pastor Presidente',
    authorAvatar: 'https://i.pravatar.cc/150?img=11', // Foto fictícia do pastor
    comment: 'Amada Igreja, como vimos neste devocional maravilhoso da rede global, a ansiedade tem sido o mal do século. Quero convidar você da nossa congregação que tem se sentido sobrecarregado a nos procurar no final do culto de Domingo. Não tente carregar esse peso sozinho! A família da nossa igreja local está aqui por você.'
  }
};

export default function DevotionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const currentId = typeof params.id === 'string' ? params.id : devotionalData.id;
  const displayDate = typeof params.date === 'string' ? params.date : devotionalData.date;
  const currentStatus = typeof params.status === 'string' ? params.status : 'pending';

  const [personalNotes, setPersonalNotes] = useState('');
  const [internalStatus, setInternalStatus] = useState(currentStatus);
  const [isInitializing, setIsInitializing] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      // Carrega da memoria persistente o que já foi escrito e qual o status de fato
      const loadMemory = async () => {
        try {
          const val = await AsyncStorage.getItem(`devo_${currentId}`);
          if (val) {
            const payload = JSON.parse(val);
            
            // Se estamos acessando a aba normalmente e hoje JÁ ESTÁ CONCLUÍDO
            // redirecionamos automaticamente para a dashboard do calendário
            if (payload.status === 'completed' && !params.status) {
              if (isMounted) router.replace('/devotional/calendar');
              return;
            }

            if (isMounted) {
              if (payload.notes) setPersonalNotes(payload.notes);
              if (payload.status === 'completed') setInternalStatus('completed');
            }
          } else if (internalStatus === 'completed' && isMounted) {
            // Fallback just for mockup testing se não tiver JSON
            setPersonalNotes('Deus falou tremendamente comigo através desta palavra hoje.');
          }
        } catch(e) {}
        
        if (isMounted) setIsInitializing(false);
      };
      
      setIsInitializing(true);
      loadMemory();

      return () => { isMounted = false; };
    }, [currentId, params.status, internalStatus])
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
          
          {/* HEADER DO DEVOCIONAL */}
          <View style={styles.metaDataRow}>
            <Text style={[styles.dateText, { color: accentColor }]}>{displayDate}</Text>
            <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#EAEAEA' }]}>
              <Feather 
                name={devotionalData.sourceType === 'LOCAL' ? "home" : "globe"} 
                size={12} 
                color={textMuted} 
                style={{ marginRight: 4 }} 
              />
              <Text style={[styles.badgeText, { color: textMuted }]}>
                {devotionalData.sourceType === 'LOCAL' ? 'Original da Igreja' : `Comp. de ${devotionalData.sourceName}`}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.mainTitle, { color: textColor }]}>{devotionalData.title}</Text>

          {/* TEXTO CENTRAL (Versículo Tema) */}
          <View style={[styles.card, styles.centralTextCard, { backgroundColor: accentColor }]}>
            <Feather name="book-open" size={20} color="#FFF" style={styles.quoteIcon} />
            <Text style={styles.centralText}>{devotionalData.centralText}</Text>
          </View>

          {/* CONTEXTO DO DEVOCIONAL */}
          <View style={styles.contextContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>O Contexto</Text>
            <Text style={[styles.contextText, { color: textColor }]}>{devotionalData.contextText}</Text>
          </View>

          {/* INDICAÇÃO DE ORAÇÃO */}
          <View style={[styles.card, { backgroundColor: secondaryAccent }]}>
            <View style={styles.cardHeader}>
               <Feather name="heart" size={18} color={accentColor} />
               <Text style={[styles.cardTitle, { color: accentColor }]}>Direção de Oração</Text>
            </View>
            <Text style={[styles.prayerText, { color: isDark ? '#DDD' : '#333' }]}>
              {devotionalData.prayerIndication}
            </Text>
          </View>

          {/* COMENTÁRIO PASTORAL (Voz Local) */}
          {devotionalData.pastoralComment && (
            <View style={[styles.card, styles.pastoralCard, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.pastoralHeader}>
                <Image 
                  source={{ uri: devotionalData.pastoralComment.authorAvatar }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={[styles.authorName, { color: textColor }]}>
                    {devotionalData.pastoralComment.authorName}
                  </Text>
                  <Text style={[styles.authorRole, { color: textMuted }]}>
                    {devotionalData.pastoralComment.authorRole} • Voz Pastoral
                  </Text>
                </View>
              </View>
              <Text style={[styles.pastoralText, { color: textColor }]}>
                "{devotionalData.pastoralComment.comment}"
              </Text>
            </View>
          )}

          {/* ÁREA DE ANOTAÇÕES */}
          <View style={styles.notesContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Minhas Observações</Text>
            <Text style={[styles.notesSubtitle, { color: textMuted }]}>
              O que Deus falou com você através da palavra hoje? Suas notas são privadas.
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
                // Persistent save
                try {
                  await AsyncStorage.setItem(`devo_${currentId}`, JSON.stringify({ 
                    status: 'completed', 
                    notes: personalNotes 
                  }));
                } catch(e) {}
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
                   ? 'Devocional Concluído (Voltar)' 
                   : internalStatus === 'missed' 
                     ? 'Concluir Leitura em Atraso' 
                     : 'Concluir Leitura e Diário'
                }
              </Text>
            </TouchableOpacity>
          </View>

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
  }
});
