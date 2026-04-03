import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Platform, Alert, Dimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function EventCheckoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#5bc3bb';
  const orangeAccent = '#FF9500';

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/events/${id}`);
      if (res.ok) {
        const json = await res.json();
        setEventData(json.data);
        // Autoselect first available lot
        const firstAvailable = json.data.lots?.find((l:any) => l.available_capacity > 0);
        if (firstAvailable) setSelectedLot(firstAvailable.id);
      }
    } catch (err) {
      console.log('Error loading event details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedLot) return Alert.alert("Ops", "Selecione um Lote de Ingressos válido.");
    
    setIsProcessing(true);
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

      const checkoutRes = await fetch(`${baseUrl}/tickets/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          event_id: id,
          lot_id: selectedLot,
          user_id: user?.userId
        })
      });

      const resData = await checkoutRes.json();

      if (checkoutRes.ok) {
        Alert.alert("Sucesso!", "Seu ingresso foi emitido. Veja seu QR Code na sua Carteira.", [
          { text: "Ver Ingressos", onPress: () => router.replace('/events/wallet' as any) }
        ]);
      } else {
        Alert.alert("Falha na Inscrição", resData.message || "Tente novamente.");
        loadEventDetails(); // Reload capacities
      }

    } catch(err) {
      console.log(err);
      Alert.alert("Erro Técnico", "Não foi possível concluir.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !eventData) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ 
           headerTitle: "Carregando...", 
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
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  const selectedLotDetails = eventData.lots?.find((l:any) => l.id === selectedLot);
  const isFree = selectedLotDetails && parseFloat(selectedLotDetails.price) === 0;

  // Media Headers Logic
  const extractVideoId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([^&?\s]{11})/);
    return match ? match[1] : null;
  };
  
  let galleryArray: string[] = [];
  try {
     if (eventData.gallery_urls) {
        galleryArray = typeof eventData.gallery_urls === 'string' ? JSON.parse(eventData.gallery_urls) : eventData.gallery_urls;
     }
  } catch(e) {}

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ 
         headerTitle: "Detalhes do Evento", 
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

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* MEDIA HEADER */}
        {eventData.video_url ? (
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${extractVideoId(eventData.video_url)}?autoplay=1&mute=1` }}
              style={styles.heroVideo}
              javaScriptEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
            />
        ) : galleryArray.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width} decelerationRate="fast">
               {galleryArray.map((img: string, idx: number) => (
                  <Image key={idx} source={{ uri: img }} style={styles.heroGalleryImage} />
               ))}
            </ScrollView>
        ) : (
            <Image source={{ uri: eventData.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800' }} style={styles.heroImage} />
        )}
        
        <View style={[styles.detailsContainer, { backgroundColor: bgColor }]}>
          <View style={[styles.inlineTypeBadge, { backgroundColor: eventData.type === 1 ? '#0a7ea4' : orangeAccent }]}>
            <Text style={styles.inlineTypeBadgeText}>{eventData.type === 1 ? 'CURSO' : 'EVENTO'}</Text>
          </View>
          <Text style={[styles.title, { color: textColor }]}>{eventData.title}</Text>
          
          <View style={styles.infoRow}>
            <Feather name="calendar" size={18} color={accentColor} style={{ width: 24 }} />
            <Text style={[styles.infoText, { color: textColor }]}>{formatDate(eventData.start_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={18} color={accentColor} style={{ width: 24 }} />
            <Text style={[styles.infoText, { color: textColor }]}>{eventData.location}</Text>
          </View>

          <View style={[styles.descBox, { borderTopColor: borderColor, borderBottomColor: borderColor }]}>
            <Text style={[styles.descTitle, { color: textColor }]}>Sobre o Evento</Text>
            <Text style={[styles.descText, { color: textMuted }]}>{eventData.description || "Descrição não informada."}</Text>
          </View>

          <Text style={[styles.descTitle, { color: textColor }]}>Selecione o Ingresso</Text>
          
          {(() => {
             const activeLotIndex = eventData.lots?.findIndex((l: any) => l.available_capacity > 0);

             return eventData.lots?.map((lot: any, index: number) => {
               // Regra de Lotes em Cascata
               const isEsgotado = activeLotIndex !== -1 && index < activeLotIndex;
               const isRealySoldOut = lot.available_capacity <= 0;
               const isEmBreve = activeLotIndex !== -1 && index > activeLotIndex;
               
               // Só é comprável se for o Lote Ativo 
               // (Ou se activeLotIndex == -1, significa que TODOS esgotaram, então isAvailable false pra tudo)
               const isActiveLot = index === activeLotIndex;
               const isAvailable = isActiveLot && !isRealySoldOut;
               const isSelected = selectedLot === lot.id && isAvailable;
               
               const lotPrice = parseFloat(lot.price);

               let statusLabel = `${lot.available_capacity} vagas restantes`;
               let statusColor = textMuted;
               
               if (isRealySoldOut || isEsgotado) {
                 statusLabel = 'ESGOTADO';
                 statusColor = '#FF3B30';
               } else if (isEmBreve) {
                 statusLabel = 'LOTE BLOQUEADO (EM BREVE)';
                 statusColor = orangeAccent;
               }

               return (
                 <TouchableOpacity 
                   key={lot.id} 
                   style={[styles.lotCard, { 
                     backgroundColor: cardColor, 
                     borderColor: isSelected ? accentColor : borderColor,
                     opacity: isActiveLot ? 1 : 0.6
                   }]}
                   onPress={() => isAvailable && setSelectedLot(lot.id)}
                   activeOpacity={0.7}
                   disabled={!isAvailable}
                 >
                   <View style={styles.lotRadioOuter}>
                     {isSelected && <View style={[styles.lotRadioInner, { backgroundColor: accentColor }]} />}
                   </View>
                   <View style={{ flex: 1, marginRight: 12 }}>
                     <Text style={[styles.lotName, { color: textColor }]}>{lot.name}</Text>
                     <Text style={[styles.lotStock, { color: statusColor, fontWeight: isActiveLot ? '600' : '800' }]}>
                       {statusLabel}
                     </Text>
                   </View>
                   <Text style={[styles.lotPrice, { color: textColor }]}>
                     {lotPrice === 0 ? 'Grátis' : `R$ ${lotPrice.toFixed(2).replace('.', ',')}`}
                   </Text>
                 </TouchableOpacity>
               );
            });
          })()}
        </View>
      </ScrollView>

      {/* FOOTER CHECKOUT */}
      <View style={[styles.footer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
         <View style={{ flex: 1 }}>
           <Text style={{ fontSize: 13, color: textMuted, fontWeight: '600' }}>TOTAL</Text>
           {selectedLotDetails ? (
             <Text style={{ fontSize: 24, fontWeight: '800', color: textColor }}>
                {isFree ? 'Gratuito' : `R$ ${parseFloat(selectedLotDetails.price).toFixed(2).replace('.', ',')}`}
             </Text>
           ) : (
             <Text style={{ fontSize: 16, fontWeight: '800', color: textMuted }}>--</Text>
           )}
         </View>
         <TouchableOpacity 
           style={[styles.checkoutBtn, { backgroundColor: selectedLot ? accentColor : textMuted, shadowColor: selectedLot ? accentColor : 'transparent' }]}
           disabled={!selectedLot || isProcessing}
           onPress={handleCheckout}
         >
           {isProcessing ? <ActivityIndicator color="#FFF" /> : (
             <Text style={styles.checkoutBtnText}>Concluir Inscrição</Text>
           )}
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 140 },
  heroImage: { width: '100%', height: 250, resizeMode: 'cover' },
  heroGalleryImage: { width, height: 250, resizeMode: 'cover' },
  heroVideo: { width: '100%', height: 250 },
  detailsContainer: { padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  inlineTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  inlineTypeBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 15, fontWeight: '500' },
  descBox: { paddingVertical: 24, marginVertical: 24, borderTopWidth: 1, borderBottomWidth: 1 },
  descTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  descText: { fontSize: 15, lineHeight: 24 },
  
  lotCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 12 },
  lotRadioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#5bc3bb', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  lotRadioInner: { width: 12, height: 12, borderRadius: 6 },
  lotName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  lotStock: { fontSize: 13, fontWeight: '500' },
  lotPrice: { fontSize: 18, fontWeight: '800' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 15 },
  checkoutBtn: { paddingHorizontal: 32, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 }
});
