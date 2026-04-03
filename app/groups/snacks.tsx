import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Modal, KeyboardAvoidingView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

type PartilhaItem = {
  id: string;
  item_name: string;
  quantity?: string;
  user_name: string;
  event_date: string;
  is_confirmed: boolean;
};

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
  
  const [items, setItems] = useState<PartilhaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [myUserId, setMyUserId] = useState<string>('');
  const [myName, setMyName] = useState<string>('');
  const [myGroupId, setMyGroupId] = useState<string>('');

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newDate, setNewDate] = useState(''); // ex: 25/12/2026
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserAndPartilhas();
  }, []);

  const loadUserAndPartilhas = async () => {
    setLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      let groupId = '';

      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          setMyUserId(user.userId);
          const userRes = await fetch(`${baseUrl}/members/${user.userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setMyName(userData.data?.name || 'Membro');
            if (userData.data?.cell_group_id) {
              groupId = userData.data.cell_group_id;
              setMyGroupId(groupId);
            }
          }
        }
      } catch (e) { console.log(e); }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (groupId) {
         const res = await fetch(`${baseUrl}/partilhas?group_id=${groupId}`, {
           headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
           setItems(await res.json());
         }
      }
    } catch (err) {
      console.log('Error loading partilhas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartilha = async () => {
    if (!newItem || !newDate) {
       Alert.alert("Ops", "O item e a data são obrigatórios.");
       return;
    }
    
    // Converte data DD/MM/YYYY para YYYY-MM-DD pro BD
    let formattedDate = newDate;
    if (newDate.includes('/')) {
       const [d, m, y] = newDate.split('/');
       if (d && m && y) formattedDate = `${y}-${m}-${d}`;
    }

    setIsSaving(true);
    try {
       const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
       const session = await fetchAuthSession();
       const token = session.tokens?.idToken?.toString();

       const reqBody = {
         cell_group_id: myGroupId,
         user_id: myUserId,
         user_name: myName,
         item_name: newItem,
         quantity: newQuantity,
         event_date: formattedDate
       };

       const res = await fetch(`${baseUrl}/partilhas`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(reqBody)
       });

       if (res.ok) {
          setShowModal(false);
          setNewItem('');
          setNewQuantity('');
          setNewDate('');
          loadUserAndPartilhas(); // Recarrega
       } else {
          Alert.alert("Erro", "Não foi possível salvar.");
       }
    } catch (err) {
       console.log(err);
    } finally {
       setIsSaving(false);
    }
  };

  const toggleConfirm = async (id: string, currentlyConfirmed: boolean) => {
    // Atualiza otimista na UI
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_confirmed: !currentlyConfirmed } : i));

    try {
       const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
       const session = await fetchAuthSession();
       const token = session.tokens?.idToken?.toString();

       await fetch(`${baseUrl}/partilhas/${id}/toggle`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ is_confirmed: !currentlyConfirmed })
       });
    } catch(err) {
       console.log(err);
       // Rollback se falhar
       setItems(prev => prev.map(i => i.id === id ? { ...i, is_confirmed: currentlyConfirmed } : i));
    }
  };

  const formatDateLabel = (dateStr: string) => {
    // YYYY-MM-DD
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Escala da Partilha</Text>
            <Text style={[styles.headerSubtitle, { color: textMuted }]}>Comunhão dos Encontros</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowModal(true)}>
            <Feather name="plus-circle" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.warningCard, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFF0EE', borderColor: 'rgba(255, 59, 48, 0.4)' }]}>
             <Feather name="info" size={20} color={accentColor} style={{ marginRight: 12 }} />
             <Text style={[styles.warningText, { color: isDark ? '#FFD4D1' : '#A31508', flexShrink: 1 }]}>
               Sua confirmação laranja na sexta garante que o alimento oficial não vai faltar na célula!
             </Text>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
          ) : items.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
               <Feather name="coffee" size={48} color={textMuted} style={{ marginBottom: 12 }} />
               <Text style={{ color: textMuted, textAlign: 'center', marginHorizontal: 30 }}>
                 Nenhuma partilha agendada ainda. Que tal levar um bolo no próximo encontro?
               </Text>
             </View>
          ) : (
             <>
               <Text style={[styles.sectionTitle, { color: textColor }]}>Próximos Encontros</Text>
               {items.map((item, index) => {
                  const isLast = index === items.length - 1;
                  
                  return (
                    <View key={item.id} style={[styles.itemRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}>
                      <TouchableOpacity 
                        style={[styles.checkbox, { borderColor: item.is_confirmed ? accentColor : textMuted, backgroundColor: item.is_confirmed ? accentColor : 'transparent' }]}
                        onPress={() => toggleConfirm(item.id, !!item.is_confirmed)}
                      >
                        {!!item.is_confirmed && <Feather name="check" size={14} color="#FFF" />}
                      </TouchableOpacity>
                      
                      <View style={styles.itemInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={[styles.itemTitle, { color: textColor, textDecorationLine: item.is_confirmed ? 'line-through' : 'none' }]}>
                            {item.quantity ? `${item.quantity}x ` : ''}{item.item_name}
                          </Text>
                          <Text style={{ fontSize: 11, color: accentColor, fontWeight: '700' }}>
                            {formatDateLabel(item.event_date)}
                          </Text>
                        </View>
                        <Text style={[styles.itemPerson, { color: textMuted }]}>Responsável: {item.user_name}</Text>
                      </View>
                    </View>
                  );
               })}
             </>
          )}
        </ScrollView>

        <Modal visible={showModal} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
            <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
               <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Nova Partilha</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Feather name="x" size={24} color={textMuted} />
                  </TouchableOpacity>
               </View>

               <Text style={[styles.inputLabel, { color: textMuted }]}>Item ou Alimento</Text>
               <TextInput 
                 style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                 placeholder="Ex: Bolo de Cenoura"
                 placeholderTextColor={textMuted}
                 value={newItem}
                 onChangeText={setNewItem}
               />

               <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.inputLabel, { color: textMuted }]}>Quantidade</Text>
                   <TextInput 
                     style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                     placeholder="Ex: 2 Litros"
                     placeholderTextColor={textMuted}
                     value={newQuantity}
                     onChangeText={setNewQuantity}
                   />
                 </View>
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.inputLabel, { color: textMuted }]}>Data (DD/MM/AAAA)</Text>
                   <TextInput 
                     style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                     placeholder="15/12/2025"
                     placeholderTextColor={textMuted}
                     value={newDate}
                     onChangeText={setNewDate}
                     keyboardType="numbers-and-punctuation"
                   />
                 </View>
               </View>

               <TouchableOpacity 
                 style={[styles.modalBtn, { backgroundColor: (newItem && newDate) ? accentColor : textMuted, marginTop: 24 }]}
                 onPress={handleSavePartilha}
                 disabled={!newItem || !newDate || isSaving}
               >
                 {isSaving ? (
                   <ActivityIndicator color="#FFF" />
                 ) : (
                   <Text style={styles.modalBtnText}>Adicionar à Escala</Text>
                 )}
               </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  itemTitle: { fontSize: 16, fontWeight: '700' },
  itemPerson: { fontSize: 13, fontWeight: '500' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  modalBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
