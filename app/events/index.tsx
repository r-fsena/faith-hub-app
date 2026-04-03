import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser } from 'aws-amplify/auth';

export default function EventsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('MEMBER');

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const accentColor = '#5bc3bb';
  const orangeAccent = '#FF9500';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      // Fetch Eventos
      const res = await fetch(`${baseUrl}/events`);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }

      // Fetch User Role for Scanner Visibility
      try {
         const user = await getCurrentUser();
         if (user?.userId) {
            const userRes = await fetch(`${baseUrl}/members/${user.userId}`);
            if (userRes.ok) {
               const userData = await userRes.json();
               if (userData.data?.role) setUserRole(userData.data.role);
            }
         }
      } catch(e){}

    } catch (err) {
      console.log('Error loading events', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ 
         headerTitle: "Eventos & Inscrições", 
         headerStyle: { backgroundColor: bgColor },
         headerTintColor: textColor,
         headerShadowVisible: false,
         headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
              style={{ paddingRight: 20 }}
            >
               <Feather name="chevron-left" size={28} color={textColor} />
            </TouchableOpacity>
         ),
         headerRight: () => (
           <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, gap: 8 }}>
             {(userRole === 'ADMIN' || userRole === 'LEADER') && (
               <TouchableOpacity 
                 onPress={() => router.push('/events/scan')} 
                 style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B3015', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 }}
               >
                  <Feather name="camera" size={16} color="#FF3B30" />
                  <Text style={{ marginLeft: 6, fontWeight: '700', color: '#FF3B30', fontSize: 13 }}>Validar</Text>
               </TouchableOpacity>
             )}
             <TouchableOpacity 
               onPress={() => router.push('/events/wallet')}
               style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#5bc3bb15', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 }}
             >
                <Feather name="tag" size={16} color={accentColor} />
                <Text style={{ marginLeft: 6, fontWeight: '700', color: accentColor, fontSize: 13 }}>Ingressos</Text>
             </TouchableOpacity>
           </View>
         )
      }} />

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
        ) : events.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
            <Feather name="calendar" size={48} color={textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ color: textMuted }}>Nenhum evento com inscrições abertas.</Text>
          </View>
        ) : (
          events.map(ev => {
             // Resumo dos Lotes pra exibir o menor preço ou situação de vagas
             let lowestPrice = 0;
             let totalAvailable = 0;
             if (ev.lots && ev.lots.length > 0) {
                lowestPrice = Math.min(...ev.lots.map((l:any) => parseFloat(l.price)));
                totalAvailable = ev.lots.reduce((acc: number, cur: any) => acc + cur.available_capacity, 0);
             }
             
             const isFree = lowestPrice === 0;
             const isCourse = ev.type === 1;

             return (
               <TouchableOpacity 
                 key={ev.id} 
                 style={[styles.card, { backgroundColor: cardColor }]}
                 activeOpacity={0.8}
                 onPress={() => router.push(`/events/${ev.id}`)}
               >
                 <Image source={{ uri: ev.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800' }} style={styles.image} />
                 
                 <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatDate(ev.start_date)}</Text>
                 </View>

                 <View style={[styles.typeBadge, { backgroundColor: isCourse ? '#0a7ea4' : orangeAccent }]}>
                    <Text style={styles.typeBadgeText}>{isCourse ? 'CURSO' : 'EVENTO'}</Text>
                 </View>

                 <View style={styles.content}>
                   <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>{ev.title}</Text>
                   <Text style={[styles.location, { color: textMuted }]} numberOfLines={1}>
                     <Feather name="map-pin" size={14} /> {ev.location}
                   </Text>
                   
                   <View style={styles.footer}>
                      <View>
                        {totalAvailable > 0 ? (
                          <Text style={{ color: '#34c759', fontWeight: '700', fontSize: 13 }}>Inscrições Abertas</Text>
                        ) : (
                          <Text style={{ color: '#FF3B30', fontWeight: '700', fontSize: 13 }}>ESGOTADO</Text>
                        )}
                      </View>
                      
                      <View style={[styles.priceTag, { backgroundColor: isFree ? 'rgba(91,195,187,0.1)' : 'rgba(0,122,255,0.1)' }]}>
                         <Text style={{ color: isFree ? accentColor : '#0a7ea4', fontWeight: '800' }}>
                           {isFree ? 'Gratuito' : `A partir de R$ ${lowestPrice.toFixed(2).replace('.', ',')}`}
                         </Text>
                      </View>
                   </View>
                 </View>
               </TouchableOpacity>
             );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 28, marginBottom: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8, letterSpacing: -0.3 },
  location: { fontSize: 14, marginBottom: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  dateBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backdropFilter: 'blur(10px)' },
  dateBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  typeBadge: { position: 'absolute', top: 16, left: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  typeBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 }
});
