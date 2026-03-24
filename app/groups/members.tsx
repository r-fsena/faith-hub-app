import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Linking, Modal, KeyboardAvoidingView, TextInput, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const initialMembers = [
  { id: '1', name: 'Pr. Rafael Sena', role: 'Líder', phone: '+55 11 99999-1111', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Sarah Sena', role: 'Líder / Adm', phone: '+55 11 99999-2222', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Lucas Almeida', role: 'Anfitrião', phone: '+55 11 99999-3333', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: '4', name: 'Você', role: 'Membro', phone: '+55 11 98888-0000', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '5', name: 'Marcos Costa', role: 'Membro', phone: '+55 11 97777-4444', avatar: 'https://i.pravatar.cc/150?img=60' },
  { id: '6', name: 'Aline Barros', role: 'Membro', phone: '+55 11 96666-5555', avatar: 'https://i.pravatar.cc/150?img=43' },
  { id: '7', name: 'José Silva', role: 'Visitante', phone: '+55 11 95555-6666', avatar: 'https://i.pravatar.cc/150?img=15' },
];

export default function GroupMembersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [members, setMembers] = useState(initialMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#5bc3bb';

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
      // Fallback
      Linking.openURL(`tel:${cleanPhone}`);
    });
  };

  const handleSendInvite = () => {
    if (!inviteName || !inviteEmail) return;
    setIsLoading(true);
    
    // Simulating network delay
    setTimeout(() => {
      const newMember = {
         id: Math.random().toString(),
         name: inviteName,
         role: 'Convite Pendente',
         phone: inviteEmail, // showing email on phone spot temporarily
         avatar: 'https://i.pravatar.cc/150?img=0' // generic
      };
      setMembers([...members, newMember]);
      setIsLoading(false);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    }, 1500);
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
             <Text style={[styles.headerTitle, { color: textColor }]}>Participantes</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>{members.length} pessoas</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowInviteModal(true)}>
            <Feather name="user-plus" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {members.map((member, index) => {
             const isLast = index === members.length - 1;
             const isLeader = member.role.includes('Líder');
             const isPending = member.role === 'Convite Pendente';
             
             return (
               <TouchableOpacity 
                 key={member.id} 
                 style={[styles.memberRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}
                 activeOpacity={isPending ? 1 : 0.7}
                 onPress={() => !isPending && handleWhatsApp(member.phone)}
               >
                 <Image source={{ uri: member.avatar }} style={[styles.avatar, isPending && { opacity: 0.3 }]} />
                 
                 <View style={styles.memberInfo}>
                   <View style={styles.nameRow}>
                      <Text style={[styles.memberName, { color: textColor, opacity: isPending ? 0.6 : 1 }]}>{member.name}</Text>
                      {isLeader && <Feather name="star" size={14} color="#FF9500" style={{ marginLeft: 6 }} />}
                   </View>
                   <Text style={[styles.memberPhone, { color: textMuted }]}>{member.phone}</Text>
                 </View>
                 
                 {!isPending && (
                   <TouchableOpacity style={styles.whatsappBtn} onPress={() => handleWhatsApp(member.phone)}>
                     <Feather name="message-circle" size={20} color="#34C759" />
                   </TouchableOpacity>
                 )}
                 
                 {isPending && (
                   <View style={[styles.roleTag, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                      <Text style={[styles.roleText, { color: '#FF9500' }]}>PENDENTE</Text>
                   </View>
                 )}
               </TouchableOpacity>
             );
          })}
        </ScrollView>

        {/* Modal de Convites */}
        <Modal visible={showInviteModal} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
            <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
               <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Convidar Nova Pessoa</Text>
                  <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                    <Feather name="x" size={24} color={textMuted} />
                  </TouchableOpacity>
               </View>

               <Text style={[styles.modalDesc, { color: textMuted }]}>
                  Envie um convite amigável por e-mail. Quando ela aceitar e se cadastrar no App, automaticamente entrará neste Grupo!
               </Text>

               <Text style={[styles.inputLabel, { color: textMuted }]}>Nome Completo</Text>
               <TextInput 
                 style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                 placeholder="Ex: João da Silva"
                 placeholderTextColor={textMuted}
                 value={inviteName}
                 onChangeText={setInviteName}
               />

               <Text style={[styles.inputLabel, { color: textMuted, marginTop: 16 }]}>E-mail</Text>
               <TextInput 
                 style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                 placeholder="Ex: joao@email.com"
                 placeholderTextColor={textMuted}
                 value={inviteEmail}
                 onChangeText={setInviteEmail}
                 keyboardType="email-address"
                 autoCapitalize="none"
               />

               <TouchableOpacity 
                 style={[styles.modalBtn, { backgroundColor: (inviteName && inviteEmail) ? accentColor : textMuted, marginTop: 24 }]}
                 onPress={handleSendInvite}
                 disabled={!inviteName || !inviteEmail || isLoading}
               >
                 {isLoading ? (
                   <ActivityIndicator color="#FFF" />
                 ) : (
                   <Text style={styles.modalBtnText}>Enviar Convite Oficial</Text>
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
  
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  memberInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  memberName: { fontSize: 16, fontWeight: '700' },
  memberPhone: { fontSize: 13 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '800' },
  whatsappBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(52, 199, 89, 0.1)', justifyContent: 'center', alignItems: 'center' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalDesc: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  modalBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
