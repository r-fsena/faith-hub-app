import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser } from 'aws-amplify/auth';

export default function MyTicketsWalletScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const accentColor = '#5bc3bb';

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user?.userId) return;

      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/tickets/me?user_id=${user.userId}`);
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data || []);
      }
    } catch (err) {
      console.log('Error loading tickets wallet', err);
    } finally {
      setLoading(false);
    }
  };

  const getQRImage = (token: string) => {
    // API pública para gerar QRCodes On-The-Fly direto pela string do Backend!
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'USED') return '#9BA1A6';
    if (status === 'PAID') return '#34C759';
    return '#FF9500';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'USED') return 'LIDO (CHECK-IN FEITO)';
    if (status === 'PAID') return 'INGRESSO LIBERADO';
    return 'AGUARDANDO PAGAMENTO';
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handlePayRetry = (ticketId: string) => {
    Alert.alert("Pagamento", "Em breve você será redirecionado para o Checkout.");
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ 
         headerTitle: "Minha Carteira", 
         headerStyle: { backgroundColor: bgColor },
         headerTintColor: textColor,
         headerShadowVisible: false,
         headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.canGoBack() ? router.back() : router.replace('/events')} 
              style={{ paddingRight: 20 }}
            >
               <Feather name="chevron-left" size={28} color={textColor} />
            </TouchableOpacity>
         )
      }} />

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="film" size={48} color={textMuted} style={{ marginBottom: 16 }} />
            <Text style={{ color: textColor, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Vazia!</Text>
            <Text style={{ color: textMuted, textAlign: 'center' }}>Você ainda não garantiu participação em nenhum dos nossos eventos.</Text>
            <TouchableOpacity onPress={() => router.replace('/events' as any)} style={[styles.emptyBtn, { backgroundColor: accentColor }]}>
               <Text style={styles.emptyBtnText}>Explorar Eventos</Text>
            </TouchableOpacity>
          </View>
        ) : (
           tickets.map(t => {
             const isUsed = t.status === 'USED';
             const isPaid = t.status === 'PAID';
             const isPending = t.status === 'PENDING' || (!isPaid && !isUsed);
             const isExpanded = expandedId === t.id;

             return (
               <View key={t.id} style={[styles.ticketCard, { backgroundColor: cardColor }]}>
                 {/* Topo da passagem: Cabeçalho Evento */}
                 <TouchableOpacity activeOpacity={0.7} onPress={() => toggleExpand(t.id)} style={styles.ticketHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={1}>{t.event_title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                         <View style={[styles.statusDot, { backgroundColor: getStatusColor(t.status) }]} />
                         <Text style={[styles.lotText, { color: textMuted }]}>{t.lot_name}</Text>
                      </View>
                    </View>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color={textMuted} />
                 </TouchableOpacity>

                 {isExpanded && (
                   <View>
                     <View style={[styles.cuttingLine, { borderColor: bgColor }]} />
                     
                     <View style={[styles.cutoutLeft, { backgroundColor: bgColor }]} />
                     <View style={[styles.cutoutRight, { backgroundColor: bgColor }]} />

                     {/* Meio: Lógica de Exibição */}
                     {isPending ? (
                       <View style={styles.qrContainer}>
                          <Feather name="alert-circle" size={48} color="#FF9500" style={{ marginBottom: 16 }} />
                          <Text style={[styles.eventTitle, { color: textColor, fontSize: 16, textAlign: 'center' }]}>Pagamento Pendente</Text>
                          <Text style={{ color: textMuted, textAlign: 'center', marginVertical: 12, paddingHorizontal: 20 }}>
                            O QR Code só será liberado após a confirmação do pagamento deste ingresso.
                          </Text>
                          <TouchableOpacity 
                            onPress={() => handlePayRetry(t.id)}
                            style={{ backgroundColor: '#FF9500', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, marginTop: 8 }}
                          >
                             <Text style={{ color: '#FFF', fontWeight: '800' }}>Realizar Pagamento</Text>
                          </TouchableOpacity>
                       </View>
                     ) : (
                       <View style={[styles.qrContainer, { opacity: isUsed ? 0.4 : 1 }]}>
                          <Image source={{ uri: getQRImage(t.qrcode_token) }} style={styles.qrImage} />
                          {isUsed && (
                            <View style={styles.usedOverlay}>
                              <Feather name="check-circle" size={48} color="#FFF" />
                              <Text style={styles.usedText}>VALIDADO</Text>
                            </View>
                          )}
                       </View>
                     )}

                     {/* Rodapé do Ticket: Status e Código */}
                     <View style={styles.ticketFooter}>
                        <Text style={[styles.ticketCode, { color: textColor }]}>CÓD: {t.id.substring(0,8).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(t.status)}15` }]}>
                           <View style={[styles.statusDot, { backgroundColor: getStatusColor(t.status) }]} />
                           <Text style={[styles.statusLabel, { color: getStatusColor(t.status) }]}>{getStatusLabel(t.status)}</Text>
                        </View>
                     </View>
                   </View>
                 )}
               </View>
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
  
  ticketCard: { borderRadius: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6, position: 'relative', overflow: 'hidden' },
  emptyBox: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 20 },
  emptyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  ticketHeader: { padding: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  lotText: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  cuttingLine: { borderBottomWidth: 2, borderStyle: 'dashed', marginHorizontal: 20 },
  cutoutLeft: { position: 'absolute', top: -16, left: -16, width: 32, height: 32, borderRadius: 16 },
  cutoutRight: { position: 'absolute', top: -16, right: -16, width: 32, height: 32, borderRadius: 16 },

  qrContainer: { padding: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  qrImage: { width: 220, height: 220 },
  
  usedOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(52, 199, 89, 0.8)', justifyContent: 'center', alignItems: 'center', borderRadius: 12, margin: 24 },
  usedText: { color: '#FFF', fontWeight: '800', fontSize: 16, marginTop: 12, letterSpacing: 2 },

  ticketFooter: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(0,0,0,0.01)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketCode: { fontSize: 16, fontWeight: '800', opacity: 0.8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }
  
});
