import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EventSignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit'>('pix');

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const primaryColor = (params.color as string) || '#FF9500';
  const displayTitle = (params.title as string) || 'Acampamento Jovem 2026';
  const displayCategory = (params.category as string) || 'ACAMPAMENTO';
  const displayDate = (params.date as string) || '12-14 Nov';
  const displayLocation = (params.location as string) || 'Sítio Canaã';
  const displayPrice = (params.price as string) || '150,00';

  const handlePaymentSelection = (method: 'pix' | 'credit') => {
    if (method === 'credit') {
      Alert.alert(
        "Em breve!",
        "O pagamento via cartão estará disponível na próxima atualização. Por enquanto, a inscrição é garantida via PIX.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      setPaymentMethod('pix');
    }
  };

  const handleRegister = () => {
    Alert.alert(
      "Inscrição Confirmada!",
      `Sua inscrição para "${displayTitle}" foi registrada. Verifique seu email para mais detalhes.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Inscrição no Evento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* EVENT BANNER HEADER */}
        <View style={[styles.eventBanner, { backgroundColor: primaryColor }]}>
          <View style={[styles.eventBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name="calendar" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.eventBadgeText}>{displayCategory}</Text>
          </View>
          <Text style={styles.eventTitle}>{displayTitle}</Text>
          <View style={styles.eventInfoRow}>
            <View style={styles.eventInfoItem}>
               <Feather name="calendar" size={14} color="#FFF" style={{ marginRight: 6 }} />
               <Text style={styles.eventInfoText}>{displayDate}</Text>
            </View>
            <View style={styles.eventInfoItem}>
               <Feather name="map-pin" size={14} color="#FFF" style={{ marginRight: 6 }} />
               <Text style={styles.eventInfoText}>{displayLocation}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
            {/* TICKET DETAILS */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>Resumo do Ingresso</Text>
            
            <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
              <View style={styles.ticketRow}>
                <View>
                  <Text style={[styles.ticketName, { color: textColor }]}>Lote Atual</Text>
                  <Text style={[styles.ticketDesc, { color: textMuted }]}>Inscrição padrão individual</Text>
                </View>
                <Text style={styles.ticketPrice}>R$ {displayPrice}</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              
              <View style={styles.ticketRow}>
                <Text style={[styles.ticketTotalLabel, { color: textColor }]}>Total a pagar</Text>
                <Text style={[styles.ticketTotalValue, { color: primaryColor }]}>R$ {displayPrice}</Text>
              </View>
            </View>

            {/* PAYMENT METHOD */}
            <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24 }]}>Forma de Pagamento</Text>
            
            <View style={[styles.card, { backgroundColor: cardColor, borderColor, padding: 0, overflow: 'hidden' }]}>
              {/* PIX Option */}
              <TouchableOpacity 
                style={[
                  styles.paymentOption, 
                  { borderBottomWidth: 1, borderBottomColor: borderColor },
                  paymentMethod === 'pix' && { backgroundColor: isDark ? 'rgba(255,149,0,0.1)' : '#FFF6E5' }
                ]}
                onPress={() => handlePaymentSelection('pix')}
                activeOpacity={0.7}
              >
                <View style={styles.paymentOptionLeft}>
                  <View style={[
                    styles.radioContainer, 
                    { borderColor: paymentMethod === 'pix' ? primaryColor : borderColor }
                  ]}>
                    {paymentMethod === 'pix' && <View style={[styles.radioDot, { backgroundColor: primaryColor }]} />}
                  </View>
                  <View style={[styles.paymentIconContainer, { backgroundColor: '#E4FFF0' }]}>
                    <Feather name="box" size={20} color="#00C464" />
                  </View>
                  <View>
                    <Text style={[styles.paymentMethodTitle, { color: textColor }]}>PIX</Text>
                    <Text style={[styles.paymentMethodDesc, { color: textMuted }]}>Aprovação imediata</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Credit Card Option */}
              <TouchableOpacity 
                style={[styles.paymentOption, { opacity: 0.6 }]}
                onPress={() => handlePaymentSelection('credit')}
                activeOpacity={0.7}
              >
                <View style={styles.paymentOptionLeft}>
                  <View style={[styles.radioContainer, { borderColor }]}>
                    {/* Empty radio */}
                  </View>
                  <View style={[styles.paymentIconContainer, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}>
                    <Feather name="credit-card" size={20} color={textMuted} />
                  </View>
                  <View>
                    <Text style={[styles.paymentMethodTitle, { color: textColor }]}>Cartão de Crédito</Text>
                    <Text style={[styles.paymentMethodDesc, { color: primaryColor, fontWeight: '600' }]}>Em breve!</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* ACTION BUTTON */}
            <TouchableOpacity 
              style={[styles.payButton, { backgroundColor: primaryColor }]} 
              activeOpacity={0.8}
              onPress={handleRegister}
            >
              <Text style={styles.payButtonText}>Gerar PIX e Inscrever-se</Text>
              <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <Text style={[styles.secureText, { color: textMuted }]}>
              <Feather name="lock" size={12} color={textMuted} /> Pagamento protegido por criptografia de ponta a ponta.
            </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 60,
  },
  eventBanner: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eventTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  eventInfoText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 13,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  ticketTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  ticketTotalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  paymentOption: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 12,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 11,
  }
});
