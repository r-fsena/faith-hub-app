import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const calendarMock = [
  { id: 'd-99', date: '21 de Mar', status: 'completed', title: 'A Alegria do Senhor' },
  { id: 'd-100', date: '22 de Mar', status: 'missed', title: 'O Cultivo da Fé' },
  { id: 'd-101', date: '23 de Mar', status: 'pending', title: 'A Paz que Excede o Entendimento' },
  { id: 'd-102', date: '24 de Mar', status: 'locked', title: 'Graça Abundante' },
  { id: 'd-103', date: '25 de Mar', status: 'locked', title: 'Tempo de Descanso' },
  { id: 'd-104', date: '26 de Mar', status: 'locked', title: 'Raízes Profundas' },
];

export default function DevotionalCalendarScreen() {
  const router = useRouter();
  const { saved, forceRefresh } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [calendarData, setCalendarData] = React.useState(calendarMock);
  const [stats, setStats] = React.useState({ completed: 1, streak: 1, pending: 1 });

  React.useEffect(() => {
    const loadState = async () => {
      try {
        const keys = calendarMock.map(c => `devo_${c.id}`);
        const results = await AsyncStorage.multiGet(keys);
        
        let newCompleted = 0;
        let newPending = 0;
        let currentStreak = 0;

        const newData = calendarMock.map(item => {
           const storageVal = results.find(r => r[0] === `devo_${item.id}`);
           let realStatus = item.status;
           
           if (storageVal && storageVal[1]) {
             const payload = JSON.parse(storageVal[1]);
             if (payload.status === 'completed') realStatus = 'completed';
           }
           
           // Se acabou de salvar, força interface como concluída no ID focado (d-101) ou o que for pendente
           if (saved === 'true' && item.status === 'pending') {
              realStatus = 'completed';
           }

           if (realStatus === 'completed') newCompleted++;
           if (realStatus === 'missed' || realStatus === 'pending') newPending++;
           
           return { ...item, status: realStatus };
        });
        
        // Calcular Sequência (Streak): Conta retroativamente os 'completed' puros antes de encontrar um 'missed'
        let hasBrokenStreak = false;
        for (let i = newData.length - 1; i >= 0; i--) {
          if (newData[i].status === 'locked') continue;
          if (newData[i].status === 'completed' && !hasBrokenStreak) {
            currentStreak++;
          } else {
            hasBrokenStreak = true;
          }
        }

        setCalendarData(newData);
        setStats({ completed: newCompleted, streak: currentStreak, pending: newPending });
      } catch (err) {
        console.error('Failed to load async storage', err);
      }
    };
    loadState();
  }, [saved, forceRefresh]);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const accentColor = '#0a7ea4';

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <Feather name="check-circle" size={20} color="#00C464" />;
      case 'missed': return <Feather name="alert-circle" size={20} color="#FF3B30" />;
      case 'pending': return <Feather name="clock" size={20} color="#FF9500" />;
      case 'locked': return <Feather name="lock" size={20} color={textMuted} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return <Text style={{ color: '#00C464', fontSize: 13, fontWeight: '700' }}>Concluído</Text>;
      case 'missed': return <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '700' }}>Pendente</Text>;
      case 'pending': return <Text style={{ color: '#FF9500', fontSize: 13, fontWeight: '700' }}>Hoje</Text>;
      case 'locked': return <Text style={{ color: textMuted, fontSize: 13, fontWeight: '700' }}>Em Breve</Text>;
      default: return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Seu Calendário</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {saved === 'true' && (
          <View style={[styles.successBanner, { backgroundColor: 'rgba(0, 196, 100, 0.1)' }]}>
             <Feather name="check-circle" size={20} color="#00C464" />
             <Text style={styles.successBannerText}>Devocional de hoje concluído e salvo com sucesso! Parabéns!</Text>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Estatísticas do Mês</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#00C464' }]}>{stats.completed}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Concluídos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.streak}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Sequência</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats.pending}</Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Pendentes</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>Jornada de Março</Text>

        <View style={[styles.listContainer, { backgroundColor: cardColor, borderColor }]}>
          {calendarData.map((item, index) => {
            const isLast = index === calendarData.length - 1;
            
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.listItem, !isLast && { borderBottomColor: borderColor, borderBottomWidth: 1 }]}
                disabled={item.status === 'locked'}
                onPress={() => router.push(`/(tabs)/devotional?id=${item.id}&status=${item.status}&date=${encodeURIComponent(item.date)}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                   <View style={styles.dateBadge}>
                     <Text style={[styles.dateBadgeText, { color: textColor }]}>{item.date.split(' ')[0]}</Text>
                     <Text style={[styles.dateBadgeMonth, { color: textMuted }]}>{item.date.split(' ')[2]}</Text>
                   </View>
                   <View style={styles.itemInfo}>
                     <Text style={[styles.itemTitle, { color: item.status === 'locked' ? textMuted : textColor }]} numberOfLines={1}>
                        {item.title}
                     </Text>
                     {getStatusText(item.status)}
                   </View>
                </View>
                <View style={styles.itemRight}>
                   {getStatusIcon(item.status)}
                   {item.status === 'missed' && (
                     <Feather name="chevron-right" size={20} color={textMuted} style={{ marginLeft: 8 }} />
                   )}
                </View>
              </TouchableOpacity>
            )
          })}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  successBannerText: {
    color: '#00C464',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  summaryCard: {
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  listContainer: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  dateBadgeMonth: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
