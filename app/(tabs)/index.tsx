import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Dimensions, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

// Mock data
const quickAccess = [
  { id: 'bible', title: 'Bíblia', icon: 'book', route: '/(tabs)/bible', type: 'feather' },
  { id: 'donate', title: 'Contribuir', icon: 'heart', route: '/(tabs)/donate', type: 'feather' },
  { id: 'groups', title: 'Células', icon: 'users', route: '/(tabs)/menu', type: 'feather' },
  { id: 'prayers', title: 'Orações', icon: 'message-square', route: '/(tabs)/menu', type: 'feather' },
  { id: 'devotional', title: 'Devocional', icon: 'sun', route: '/(tabs)/devotional', type: 'feather' },
];

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [isPlayingLive, setIsPlayingLive] = React.useState(false);
  const liveVideoId = "jfKfPfyJRdk"; // Replace with your church's actual YouTube live video ID 

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
            <TouchableOpacity onPress={signOut} style={styles.avatar} activeOpacity={0.8}>
              <Text style={styles.avatarText}>R</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.greetingText, { color: textMuted }]}>Boa noite,</Text>
              <Text style={[styles.userName, { color: textColor }]}>{getUserName()}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.bellContainer, { borderColor }]}>
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
        <View style={styles.quickAccessGrid}>
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
        </View>

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
  quickAccessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  quickAccessItem: {
    alignItems: 'center',
    width: '18%',
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
});
