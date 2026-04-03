import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function DevotionalCalendarScreen() {
  const router = useRouter();
  const { saved, forceRefresh } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [calendarData, setCalendarData] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ completed: 0, streak: 0, pending: 0 });

  React.useEffect(() => {
    const loadState = async () => {
      try {
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession().catch(() => null);
        
        const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/devotionals`, {
          headers: { 'Authorization': `Bearer ${session?.tokens?.idToken?.toString() || ''}` }
        });
        
        let fetchedData = [];
        if (res.ok) {
          const rawData = await res.json();
          const today = new Date().toISOString().split('T')[0];
          
          fetchedData = rawData.map((d: any) => {
            const dateStr = d.available_date.split('T')[0];
            const dDate = new Date(dateStr);
            const formattedDate = `${dDate.getUTCDate()} de ${dDate.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}`;
            
            let status = 'pending';
            if (dateStr > today) status = 'locked';
            if (dateStr < today) status = 'missed';
            if (dateStr === today) status = 'pending';
            
            return {
              id: d.id,
              dateStr,
              date: formattedDate,
              status,
              title: d.title
            };
          }).sort((a: any, b: any) => a.dateStr.localeCompare(b.dateStr)); // Sort oldest to newest
        }

        const keys = fetchedData.map((c: any) => `devo_${c.id}`);
        const results = await AsyncStorage.multiGet(keys);
        
        let newCompleted = 0;
        let newPending = 0;
        let currentStreak = 0;

        const newData = fetchedData.map((item: any) => {
           const storageVal = results.find(r => r[0] === `devo_${item.id}`);
           let realStatus = item.status;
           
           if (storageVal && storageVal[1]) {
             const payload = JSON.parse(storageVal[1]);
             if (payload.status === 'completed') realStatus = 'completed';
           }
           
           // Se acabou de salvar, força interface como concluída no ID focado ou o que for pendente
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
        console.error('Failed to load async storage or fetch API', err);
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
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={styles.backButton}>
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
                onPress={() => router.push(`/(tabs)/devotional?id=${item.id}&status=${item.status}&date=${encodeURIComponent(item.dateStr)}` as any)}
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
