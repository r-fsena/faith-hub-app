import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Dimensions, StatusBar, Modal, Image, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Mock data
const quickAccess = [
  { id: 'store', title: 'Loja', icon: 'shopping-bag', route: '/store', type: 'feather' },
  { id: 'bible', title: 'Bíblia', icon: 'book', route: '/(tabs)/bible', type: 'feather' },
  { id: 'donate', title: 'Contribuir', icon: 'heart', route: '/(tabs)/donate', type: 'feather' },
  { id: 'groups', title: 'Células', icon: 'users', route: '/(tabs)/groups', type: 'feather' },
  { id: 'prayers', title: 'Orações', icon: 'message-square', route: '/(tabs)/prayers', type: 'feather' },
  { id: 'devotional', title: 'Devocional', icon: 'sun', route: '/(tabs)/devotional', type: 'feather' },
];

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isPlayingLive, setIsPlayingLive] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState<boolean>(true);
  const liveVideoId = "jfKfPfyJRdk"; // Replace with your church's actual YouTube live video ID 
  
  useEffect(() => {
    const loadState = async () => {
      const savedAvatar = await AsyncStorage.getItem('user_avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);
      
      const savedLgpd = await AsyncStorage.getItem('lgpd_consent');
      if (savedLgpd !== null) setLgpdConsent(savedLgpd === 'true');
    };
    loadState();
  }, []);

  const changeAvatar = async () => {
    // Simulador super fluído de escolha de avatar do usuário até conectarmos a camêra/galeria Real (Para escapar do erro de Kernel NPM instalation EPERM)
    const mockAvatars = [
      'https://i.pravatar.cc/150?img=11',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=47',
      'https://i.pravatar.cc/150?img=68'
    ];
    const currentIndex = avatarUrl ? mockAvatars.indexOf(avatarUrl) : -1;
    const nextIndex = (currentIndex + 1) % mockAvatars.length;
    const nextAvatar = mockAvatars[nextIndex];
    setAvatarUrl(nextAvatar);
    await AsyncStorage.setItem('user_avatar', nextAvatar);
  };

  const toggleLgpd = async (value: boolean) => {
    setLgpdConsent(value);
    await AsyncStorage.setItem('lgpd_consent', value ? 'true' : 'false');
  };

  const bgColor = isDark ? '#2c3444' : '#f1f1f1'; 
  const cardColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#333333' : '#EAEAEA';

  // Get user first name
  const getUserName = () => {
    // try to get from user object
    let name = 'Rafael'; // Default for the screenshot
    if (user && user.signInDetails && user.signInDetails.loginId) {
       // logic can be extended to use real names later
    }
    return name;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setShowProfile(true)} style={[styles.avatar, avatarUrl ? { backgroundColor: 'transparent' } : {}]} activeOpacity={0.8}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 22 }} />
              ) : (
                <Text style={styles.avatarText}>R</Text>
              )}
            </TouchableOpacity>
            <View>
              <Text style={[styles.greetingText, { color: textMuted }]}>Boa noite,</Text>
              <Text style={[styles.userName, { color: textColor }]}>{getUserName()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowNotifications(true)} style={[styles.bellContainer, { borderColor }]}>
            <Feather name="bell" size={20} color={textColor} />
            <View style={[styles.bellBadge, { borderColor: bgColor }]} />
          </TouchableOpacity>
        </View>



        {/* FEATURED CARDS (HORIZONTAL SCROLL) */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.cardsScroll}
          snapToInterval={width * 0.85 + 16}
          decelerationRate="fast"
        >
          {/* Card 1 - LIVE STREAM */}
          <View style={[styles.featuredCard, { backgroundColor: '#5bc3bb', overflow: 'hidden', padding: isPlayingLive ? 0 : 24 }]}>
            {isPlayingLive ? (
              <View style={{ width: '100%', height: '100%', borderRadius: 28, overflow: 'hidden' }}>
                <YoutubePlayer
                  height={250}
                  play={true}
                  videoId={liveVideoId}
                  webViewStyle={{ opacity: 0.99 }} // fixing android rendering quirks
                />
                <TouchableOpacity 
                  style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 }}
                  onPress={() => setIsPlayingLive(false)}
                >
                  <Feather name="x" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>AO VIVO</Text>
                </View>
                <Text style={styles.cardTitle}>Culto de Celebração</Text>
                <Text style={styles.cardSubtitle}>
                  Acompanhe a palavra ao vivo agora mesmo com a nossa família.
                </Text>
                <TouchableOpacity style={styles.cardButton} activeOpacity={0.8} onPress={() => setIsPlayingLive(true)}>
                  <View style={styles.cardButtonIcon}>
                    <Feather name="play" size={14} color="#5bc3bb" style={{ marginLeft: 3 }} />
                  </View>
                  <Text style={styles.cardButtonText}>Assistir Transmissão</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Card 2 */}
          <View style={[styles.featuredCard, { backgroundColor: '#FF9500' }]}>
            <View style={[styles.liveBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Feather name="calendar" size={12} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.liveText}>EVENTO</Text>
            </View>
            <Text style={styles.cardTitle}>Acampamento Jovem</Text>
            <Text style={styles.cardSubtitle}>
              Lote virando em poucas horas! Garanta sua vaga agora mesmo.
            </Text>
            <TouchableOpacity 
              style={styles.cardButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/event/signup' as any)}
            >
              <View style={[styles.cardButtonIcon, { backgroundColor: '#FFF' }]}>
                <Feather name="chevron-right" size={16} color="#FF9500" />
              </View>
              <Text style={styles.cardButtonText}>Fazer Inscrição</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ACESSO RÁPIDO */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Acesso Rápido</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.quickAccessScroll}
        >
          {quickAccess.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickAccessItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: cardColor, borderColor }]}>
                <Feather name={item.icon as any} size={22} color={textColor} />
              </View>
              <Text style={[styles.quickAccessText, { color: textMuted }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EVENTOS & CURSOS HUB BANNER */}
        <TouchableOpacity 
          style={[styles.hubBanner, { backgroundColor: isDark ? '#1E1E1E' : '#e4f5f4', borderColor: isDark ? '#333' : 'transparent', borderWidth: 1 }]}
          onPress={() => router.push('/event' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.hubBannerContent}>
            <Text style={[styles.hubBannerTitle, { color: isDark ? '#FFF' : '#2c3444' }]}>Eventos & Cursos</Text>
            <Text style={[styles.hubBannerSub, { color: textMuted }]}>Explore nosso calendário completo e garanta sua vaga.</Text>
          </View>
          <View style={[styles.hubBannerIcon, { backgroundColor: '#5bc3bb' }]}>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* ÚLTIMAS MENSAGENS */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Últimas Mensagens</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messagesContainer}>
          {/* Message 1 */}
          <TouchableOpacity style={[styles.messageCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.messageIconContainer, { backgroundColor: isDark ? 'rgba(91, 195, 187, 0.2)' : '#e4f5f4' }]}>
              <Feather name="video" size={20} color="#5bc3bb" />
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageTag}>DOMINGO PASSADO</Text>
              <Text style={[styles.messageTitle, { color: textColor }]} numberOfLines={2}>Os Frutos do Espírito na Prática</Text>
              <Text style={[styles.messageAuthor, { color: textMuted }]}>Pr. Cláudio Duarte</Text>
            </View>
            <View style={[styles.playButtonOutline, { borderColor }]}>
              <Feather name="play" size={14} color={textColor} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>

          {/* Message 2 */}
          <TouchableOpacity style={[styles.messageCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.messageIconContainer, { backgroundColor: isDark ? 'rgba(157, 100, 255, 0.2)' : '#F0E6FF' }]}>
              <Feather name="headphones" size={20} color="#9D64FF" />
            </View>
            <View style={styles.messageContent}>
              <Text style={[styles.messageTag, { color: '#9D64FF' }]}>EPISÓDIO DO PODCAST</Text>
              <Text style={[styles.messageTitle, { color: textColor }]} numberOfLines={2}>Vencendo a Ansiedade</Text>
              <Text style={[styles.messageAuthor, { color: textMuted }]}>Pra. Helena Silva</Text>
            </View>
            <View style={[styles.playButtonOutline, { borderColor }]}>
              <Feather name="play" size={14} color={textColor} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* User Profile Modal */}
      <Modal visible={showProfile} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Meu Perfil</Text>
              <TouchableOpacity onPress={() => setShowProfile(false)}>
                <Feather name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={changeAvatar} style={[styles.avatarLarge, { backgroundColor: avatarUrl ? 'transparent' : '#5bc3bb' }]}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
                  ) : (
                    <Text style={styles.avatarLargeText}>R</Text>
                  )}
                  <View style={styles.editAvatarBadge}>
                     <Feather name="camera" size={14} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.profileName, { color: textColor }]}>{getUserName()} Sena</Text>
                <Text style={[styles.profilePhone, { color: textMuted }]}>(11) 98888-7777</Text>
              </View>

              <View style={[styles.profileBlock, { borderBottomColor: borderColor }]}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>E-mail</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>rafael.sena@email.com</Text>
              </View>

              <View style={[styles.profileBlock, { borderBottomColor: borderColor }]}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>CPF</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>***.123.456-**</Text>
              </View>

              <View style={[styles.profileBlock, { borderBottomColor: borderColor }]}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>Endereço Completo</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>Rua das Flores, 123, Sala 4, São Paulo - SP</Text>
              </View>

              <View style={[styles.profileBlock, { borderBottomColor: borderColor }]}>
                <Text style={[styles.infoLabel, { color: textMuted }]}>Célula / Grupo</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>Nenhum grupo associado.</Text>
                <TouchableOpacity onPress={() => { setShowProfile(false); router.push('/(tabs)/groups'); }}>
                  <Text style={{ color: '#5bc3bb', fontWeight: '800', marginTop: 8 }}>Encontrar uma Célula próxima</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileRow}>
                <View style={[styles.profileBlock, { borderBottomColor: borderColor, flex: 1, borderBottomWidth: 0 }]}>
                  <Text style={[styles.infoLabel, { color: textMuted }]}>Data de Batismo</Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>12/04/2018</Text>
                </View>
                <View style={[styles.profileBlock, { borderBottomColor: borderColor, flex: 1, borderBottomWidth: 0 }]}>
                  <Text style={[styles.infoLabel, { color: textMuted }]}>Membro desde</Text>
                  <Text style={[styles.infoValue, { color: '#5bc3bb', fontWeight: '800' }]}>Há 6 anos</Text>
                </View>
              </View>

              <View style={[styles.switchRow, { borderBottomColor: borderColor }]}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={[styles.infoLabel, { color: textMuted }]}>Notificações e LGPD</Text>
                  <Text style={[styles.lgpdDesc, { color: textColor }]}>Aceito receber avisos oficiais, devocionais ou tesouraria por SMS, Push ou E-mail.</Text>
                </View>
                <Switch 
                  value={lgpdConsent} 
                  onValueChange={toggleLgpd}
                  trackColor={{ true: '#5bc3bb', false: isDark ? '#333' : '#EAEAEA' }}
                />
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={() => { setShowProfile(false); signOut(); }}>
                <Feather name="log-out" size={20} color="#FF3B30" />
                <Text style={styles.logoutBtnText}>Sair da Conta (Logout)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="fade" transparent={true}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor, minHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Notificações</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Feather name="x" size={24} color={textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {[
                { id: '1', title: 'Culto de Celebração', message: 'O culto ao vivo começa em 15 minutos! Assista agora.', time: 'Há 15 min', icon: 'youtube', color: '#FF3B30', unread: true },
                { id: '2', title: 'Doação Aprovada', message: 'Seu comprovante de contribuição ao Projeto Construção foi validado.', time: 'Há 2 horas', icon: 'check-circle', color: '#00C464', unread: true },
                { id: '3', title: 'Comunidade / Célula', message: 'Pr. Rafael enviou um convite pendente para o Pequeno Grupo Aliança.', time: 'Ontem', icon: 'users', color: '#5bc3bb', unread: false },
                { id: '4', title: 'Painel de Orações', message: '5 membros da igreja acabaram de deixar um "Amém" na sua causa.', time: 'Sexta-feira', icon: 'message-square', color: '#9D64FF', unread: false },
              ].map((notif) => (
                <TouchableOpacity key={notif.id} style={[styles.notificationCard, { borderBottomColor: borderColor, backgroundColor: notif.unread ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent' }]} activeOpacity={0.7}>
                  <View style={[styles.notificationIconBg, { backgroundColor: `${notif.color}15` }]}>
                    <Feather name={notif.icon as any} size={20} color={notif.color} />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={[styles.notificationTitle, { color: textColor }]} numberOfLines={1}>{notif.title}</Text>
                      <Text style={[styles.notificationTime, { color: textMuted }]}>{notif.time}</Text>
                    </View>
                    <Text style={[styles.notificationText, { color: textMuted }]} numberOfLines={2}>{notif.message}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#303E48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bellContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
  },
  cardsScroll: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 10,
  },
  featuredCard: {
    width: width * 0.85,
    borderRadius: 28,
    padding: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.85,
    marginBottom: 24,
    lineHeight: 20,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5bc3bb',
  },
  quickAccessScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  quickAccessItem: {
    alignItems: 'center',
    width: 76,
    marginRight: 12,
  },
  quickAccessIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  hubBanner: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hubBannerContent: {
    flex: 1,
    marginRight: 16,
  },
  hubBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  hubBannerSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  hubBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  messageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  messageContent: {
    flex: 1,
    marginRight: 12,
  },
  messageTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5bc3bb',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  playButtonOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal Perfil
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '85%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative' },
  avatarLargeText: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF3B30', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  profileName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  profilePhone: { fontSize: 16, fontWeight: '500' },
  profileBlock: { paddingVertical: 16, borderBottomWidth: 1 },
  infoLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  infoValue: { fontSize: 16, fontWeight: '600' },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  lgpdDesc: { fontSize: 14, lineHeight: 20 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: 'rgba(255, 59, 48, 0.1)', marginTop: 32 },
  logoutBtnText: { color: '#FF3B30', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  
  // Notification Modal Styles
  notificationCard: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 1, borderRadius: 12 },
  notificationIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notificationTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  notificationTime: { fontSize: 12, fontWeight: '500' },
  notificationText: { fontSize: 14, lineHeight: 20 },
});
