import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const mockSnacks = [
  { id: '1', person: 'Pr. Rafael', item: 'Bolo de Cenoura', confirmed: true },
  { id: '2', person: 'Sarah Sena', item: 'Refrigerante e Suco', confirmed: true },
  { id: '3', person: 'Lucas Almeida', item: 'Salgadinho Variado', confirmed: false },
  { id: '4', person: 'Marcos Costa', item: 'Pratinhos e Copos', confirmed: false }
];

export default function GroupSnacksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#FF3B30';
  
  const [items, setItems] = useState(mockSnacks);

  const toggleConfirm = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, confirmed: !i.confirmed } : i));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View>
             <Text style={[styles.headerTitle, { color: textColor }]}>Escala do Lanche</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>Comunhão desta terça</Text>
          </View>
          <TouchableOpacity style={styles.backBtn}>
            <Feather name="plus-circle" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.warningCard, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFF0EE', borderColor: 'rgba(255, 59, 48, 0.4)' }]}>
             <Feather name="info" size={20} color={accentColor} style={{ marginRight: 12 }} />
             <Text style={[styles.warningText, { color: isDark ? '#FFD4D1' : '#A31508' }]}>
               Sua confirmação ajuda a evitar desperdícios e faltas!
             </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor }]}>Quem traz o quê?</Text>

          {items.map((item, index) => {
             const isLast = index === items.length - 1;
             
             return (
               <View key={item.id} style={[styles.itemRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}>
                 <TouchableOpacity 
                   style={[styles.checkbox, { borderColor: item.confirmed ? accentColor : textMuted, backgroundColor: item.confirmed ? accentColor : 'transparent' }]}
                   onPress={() => toggleConfirm(item.id)}
                 >
                   {item.confirmed && <Feather name="check" size={14} color="#FFF" />}
                 </TouchableOpacity>
                 
                 <View style={styles.itemInfo}>
                   <Text style={[styles.itemTitle, { color: textColor, textDecorationLine: item.confirmed ? 'line-through' : 'none' }]}>{item.item}</Text>
                   <Text style={[styles.itemPerson, { color: textMuted }]}>Responsável: {item.person}</Text>
                 </View>
               </View>
             );
          })}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, textAlign: 'center', marginTop: 2 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  warningCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  warningText: { fontSize: 14, flex: 1, fontWeight: '600', lineHeight: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  itemPerson: { fontSize: 13, fontWeight: '500' }
});
