import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChurchEvent, ChurchCourse } from '@/types/events';

// Mock Data
// Mock Data - Formated exactly as AWS Backend
const eventos: ChurchEvent[] = [
  { id: '1', title: 'Acampamento Jovem', category: 'ACAMPAMENTO', startDate: '12-14 Nov', time: 'Sexta a Domingo', location: 'Sítio Canaã', fullAddress: 'Rodovia das Índias, km 32', color: '#FF9500', route: '/event/signup', totalSpots: 120, filledSpots: 105 },
  { id: '2', title: 'Conferência de Mulheres', category: 'CONFERÊNCIA', startDate: '25 Nov', time: '19:30', location: 'Templo Principal', fullAddress: 'Av. Espiritual, 400 - Centro', color: '#E91E63', route: '/event/signup', totalSpots: 600, filledSpots: 340 },
  { id: '3', title: 'Noite de Casais', category: 'JANTAR', startDate: '10 Dez', time: '20:00', location: 'Salão Social', fullAddress: 'Av. Espiritual, 400 - Centro', color: '#9D64FF', route: '/event/signup', totalSpots: 100, filledSpots: 98 },
];

const cursos: ChurchCourse[] = [
  { id: '4', title: 'Trilha do Discipulado', category: 'FUNDAMENTOS', startDate: '15 Fev', time: '19:00', duration: 'EAD • 8 Módulos', location: 'Online', fullAddress: 'Disponível no Portal', tag: 'INSCRIÇÕES ABERTAS', color: '#5bc3bb', icon: 'book-open', totalSpots: 100, filledSpots: 45, route: '/event/signup' as any },
  { id: '5', title: 'Escola de Liderança', category: 'AVANÇADO', startDate: '04 Mar', time: '09:00', duration: 'Presencial • Sábados', location: 'Templo Principal', fullAddress: 'Av. Espiritual, 400 - Centro', tag: 'ÚLTIMAS VAGAS', color: '#FF3B30', icon: 'award', totalSpots: 50, filledSpots: 48, route: '/event/signup' as any },
];

export default function EventHubScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'events' | 'courses'>('events');

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const primaryBrand = '#5bc3bb';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Eventos & Cursos</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'events' && { borderBottomColor: primaryBrand, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'events' ? (isDark ? '#FFF' : '#000') : textMuted, fontWeight: activeTab === 'events' ? '700' : '500' }]}>Eventos de Igreja</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'courses' && { borderBottomColor: primaryBrand, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'courses' ? (isDark ? '#FFF' : '#000') : textMuted, fontWeight: activeTab === 'courses' ? '700' : '500' }]}>Cursos Adicionais</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'events' ? (
          <View style={styles.listContainer}>
            {eventos.map((ev) => (
              <TouchableOpacity 
                key={ev.id} 
                style={[styles.card, { backgroundColor: cardColor, borderColor }]}
                onPress={() => router.push({ 
                  pathname: ev.route, 
                  params: { 
                    title: ev.title, 
                    category: ev.category, 
                    date: ev.startDate, 
                    location: ev.location, 
                    color: ev.color, 
                    price: '150,00' 
                  } 
                } as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.cardTag, { backgroundColor: `${ev.color}20` }]}>
                    <Text style={[styles.cardTagText, { color: ev.color }]}>{ev.category}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: textColor }]}>{ev.title}</Text>
                
                <View style={styles.infoRow}>
                  <View style={[styles.infoPill, { backgroundColor: isDark ? '#1a2130' : '#f5f5f5' }]}>
                    <Feather name="calendar" size={14} color={textMuted} />
                    <Text style={[styles.infoText, { color: textMuted }]}>{ev.startDate}</Text>
                  </View>
                  <View style={[styles.infoPill, { backgroundColor: isDark ? '#1a2130' : '#f5f5f5' }]}>
                    <Feather name="clock" size={14} color={textMuted} />
                    <Text style={[styles.infoText, { color: textMuted }]}>{ev.time}</Text>
                  </View>
                </View>
                
                <View style={styles.addressSection}>
                   <Feather name="map-pin" size={14} color={textMuted} style={{ marginTop: 2, marginRight: 8 }} />
                   <View style={{ flex: 1 }}>
                     <Text style={[styles.locationText, { color: textColor }]}>{ev.location}</Text>
                     <Text style={[styles.fullAddressText, { color: textMuted }]}>{ev.fullAddress}</Text>
                   </View>
                </View>

                {/* VAGAS PROGRESS BAR */}
                <View style={styles.spotsContainer}>
                  <View style={styles.spotsHeader}>
                    <Text style={[styles.spotsLabel, { color: textMuted }]}>Vagas preenchidas</Text>
                    <Text style={[styles.spotsCount, { color: textColor }]}>{ev.filledSpots} / {ev.totalSpots}</Text>
                  </View>
                  <View style={[styles.spotsTrack, { backgroundColor: isDark ? '#1a2130' : '#EAEAEA' }]}>
                    <View style={[styles.spotsFill, { backgroundColor: ev.color, width: `${(ev.filledSpots / ev.totalSpots) * 100}%` }]} />
                  </View>
                  {ev.totalSpots - ev.filledSpots <= 5 && (
                     <Text style={[styles.spotsWarning, { color: '#FF3B30' }]}>🔥 Restam apenas {ev.totalSpots - ev.filledSpots} vagas!</Text>
                  )}
                </View>
                
                <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                  <View style={styles.locationContainer}>
                     <Text style={[styles.locationText, { color: textMuted, opacity: 0 }]}>.</Text>
                  </View>
                  <View style={[styles.actionBtn, { backgroundColor: ev.color }]}>
                     <Text style={styles.actionBtnText}>Inscrever</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
             {cursos.map((curso) => (
              <TouchableOpacity 
                key={curso.id} 
                style={[styles.card, { backgroundColor: cardColor, borderColor }]}
                onPress={() => router.push({ 
                  pathname: curso.route, 
                  params: { 
                    title: curso.title, 
                    category: curso.category, 
                    date: curso.startDate, 
                    location: curso.location, 
                    color: curso.color, 
                    price: '250,00' 
                  } 
                } as any)}
                activeOpacity={0.8}
              >
                <View style={styles.cursoHeader}>
                   <View style={[styles.cursoIcon, { backgroundColor: `${curso.color}20` }]}>
                     <Feather name={curso.icon as any} size={22} color={curso.color} />
                   </View>
                   <View style={[styles.cardTag, { backgroundColor: isDark ? '#1a2130' : '#F5F5F5' }]}>
                      <Text style={[styles.cardTagText, { color: textMuted }]}>{curso.category}</Text>
                   </View>
                </View>
                
                <Text style={[styles.cardTitle, { color: textColor }]}>{curso.title}</Text>
                
                <View style={styles.infoRow}>
                  <View style={[styles.infoPill, { backgroundColor: isDark ? '#1a2130' : '#f5f5f5' }]}>
                    <Feather name="calendar" size={14} color={textMuted} />
                    <Text style={[styles.infoText, { color: textMuted }]}>{curso.startDate}</Text>
                  </View>
                  <View style={[styles.infoPill, { backgroundColor: isDark ? '#1a2130' : '#f5f5f5' }]}>
                    <Feather name="clock" size={14} color={textMuted} />
                    <Text style={[styles.infoText, { color: textMuted }]}>{curso.time}</Text>
                  </View>
                </View>
                
                <View style={styles.addressSection}>
                   <Feather name="map-pin" size={14} color={textMuted} style={{ marginTop: 2, marginRight: 8 }} />
                   <View style={{ flex: 1 }}>
                     <Text style={[styles.locationText, { color: textColor }]}>{curso.location}</Text>
                     <Text style={[styles.fullAddressText, { color: textMuted }]}>{curso.fullAddress}</Text>
                   </View>
                </View>

                <Text style={[styles.cursoDuration, { color: textMuted }]}>{curso.duration}</Text>
                
                {/* VAGAS PROGRESS BAR */}
                <View style={styles.spotsContainer}>
                  <View style={styles.spotsHeader}>
                    <Text style={[styles.spotsLabel, { color: textMuted }]}>Vagas preenchidas</Text>
                    <Text style={[styles.spotsCount, { color: textColor }]}>{curso.filledSpots} / {curso.totalSpots}</Text>
                  </View>
                  <View style={[styles.spotsTrack, { backgroundColor: isDark ? '#1a2130' : '#EAEAEA' }]}>
                    <View style={[styles.spotsFill, { backgroundColor: curso.color, width: `${(curso.filledSpots / curso.totalSpots) * 100}%` }]} />
                  </View>
                  {curso.totalSpots - curso.filledSpots <= 5 && (
                     <Text style={[styles.spotsWarning, { color: '#FF3B30' }]}>🔥 Restam apenas {curso.totalSpots - curso.filledSpots} vagas!</Text>
                  )}
                </View>
                
                <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                  <Text style={[styles.cursoTag, { color: curso.color }]}>{curso.tag}</Text>
                  <View style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: curso.color, paddingVertical: 6 }]}>
                     <Text style={[styles.actionBtnText, { color: curso.color }]}>Saiba Mais</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: { fontSize: 16, letterSpacing: -0.2 },
  scrollContent: { paddingBottom: 60, paddingTop: 24, paddingHorizontal: 20 },
  listContainer: { gap: 16 },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  cardTagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  cardTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 16 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 10 },
  infoPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  infoText: { fontSize: 13, fontWeight: '600' },
  addressSection: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  locationText: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  fullAddressText: { fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 16, marginTop: 4 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  actionBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  cursoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cursoIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cursoDuration: { fontSize: 15, marginBottom: 16, fontWeight: '500' },
  cursoTag: { fontSize: 13, fontWeight: '800' },
  spotsContainer: { marginBottom: 20 },
  spotsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  spotsLabel: { fontSize: 13, fontWeight: '500' },
  spotsCount: { fontSize: 13, fontWeight: '800' },
  spotsTrack: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  spotsFill: { height: '100%', borderRadius: 3 },
  spotsWarning: { fontSize: 12, fontWeight: '800', marginTop: 8, letterSpacing: -0.2 },
});
