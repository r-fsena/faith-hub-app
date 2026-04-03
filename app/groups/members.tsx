import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Image, Linking, Modal, KeyboardAvoidingView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  status: string;
};

export default function GroupMembersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [members, setMembers] = useState<Member[]>([]);
  const [myGroupId, setMyGroupId] = useState<string>('');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#5bc3bb';

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      let groupId = '';

      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          const userRes = await fetch(`${baseUrl}/members/${user.userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.data?.cell_group_id) {
              groupId = userData.data.cell_group_id;
              setMyGroupId(groupId);
            }
          }
        }
      } catch (e) { console.log(e); }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // Buscar Membros da Célula específica
      if (groupId) {
         const res = await fetch(`${baseUrl}/members?group_id=${groupId}`, {
           headers: { 'Authorization': `Bearer ${token}` }
         });
         if (res.ok) {
           const payload = await res.json();
           setMembers(payload.data || []);
         }
      }
    } catch (err) {
      console.log('Error loading members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) {
       Alert.alert("Erro", "O membro não cadastrou o número de telefone.");
       return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
      // Fallback
      Linking.openURL(`tel:${cleanPhone}`);
    });
  };

  const handleSendInvite = async () => {
    if (!inviteName || !inviteEmail) return;
    setIsInviting(true);
    
    try {
       const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
       const session = await fetchAuthSession();
       const token = session.tokens?.idToken?.toString();

       const reqBody = {
         name: inviteName,
         email: inviteEmail.toLowerCase(),
         role: 'MEMBER',
         cellGroupId: myGroupId
       };

       const res = await fetch(`${baseUrl}/members/invite`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(reqBody)
       });

       if (res.ok) {
          Alert.alert("Sucesso!", "O convite oficial com o link de cadastro foi disparado para o e-mail do participante.");
          setShowInviteModal(false);
          setInviteName('');
          setInviteEmail('');
          loadMembers(); // Atualiza a lista pra mostrar ele como Pendente!
       } else {
          const errData = await res.json();
          Alert.alert("Ops", errData.error || "Algo deu errado ao enviar o convite.");
       }
    } catch (err) {
       console.log("Error inviting", err);
       Alert.alert("Ops", "Não foi possível concluir a ação.");
    } finally {
       setIsInviting(false);
    }
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
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>{isLoading ? 'Carregando...' : `${members.length} pessoas`}</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowInviteModal(true)}>
            <Feather name="user-plus" size={22} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isLoading ? (
             <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 40 }} />
          ) : members.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
               <Feather name="users" size={48} color={textMuted} style={{ marginBottom: 12 }} />
               <Text style={{ color: textMuted, textAlign: 'center', marginHorizontal: 30 }}>
                 Sua célula não possui membros ativos cadastrados ainda. Comece enviando convites pelo botão no topo!
               </Text>
             </View>
          ) : members.map((member, index) => {
             const isLast = index === members.length - 1;
             const isLeader = member.role && member.role.includes('LEADER');
             const isPending = member.status === 'Pendente';
             
             return (
               <TouchableOpacity 
                 key={member.id} 
                 style={[styles.memberRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}
                 activeOpacity={isPending ? 1 : 0.7}
                 onPress={() => !isPending && handleWhatsApp(member.phone)}
               >
                 {member.avatar ? (
                   <Image source={{ uri: member.avatar }} style={[styles.avatar, isPending && { opacity: 0.3 }]} />
                 ) : (
                   <View style={[styles.avatarTemp, { backgroundColor: isPending ? borderColor : accentColor }]}>
                      <Text style={{ fontWeight: 'bold', color: isPending ? textMuted : '#FFF' }}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                   </View>
                 )}
                 
                 <View style={styles.memberInfo}>
                   <View style={styles.nameRow}>
                      <Text style={[styles.memberName, { color: textColor, opacity: isPending ? 0.6 : 1 }]}>{member.name}</Text>
                      {isLeader && <Feather name="star" size={14} color="#FF9500" style={{ marginLeft: 6 }} />}
                   </View>
                   <Text style={[styles.memberPhone, { color: textMuted, fontSize: 12 }]}>{isPending ? member.email : member.phone || "Telefone não registrado"}</Text>
                 </View>
                 
                 {!isPending && member.phone ? (
                   <TouchableOpacity style={styles.whatsappBtn} onPress={() => handleWhatsApp(member.phone)}>
                     <Feather name="message-circle" size={20} color="#34C759" />
                   </TouchableOpacity>
                 ) : null}
                 
                 {isPending && (
                   <View style={[styles.roleTag, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                      <Text style={[styles.roleText, { color: '#FF9500' }]}>PENDENTE</Text>
                   </View>
                 )}
               </TouchableOpacity>
             );
          })}
        </ScrollView>

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
                  Envie um convite amigável por e-mail. Quando ela aceitar e se cadastrar no App, automaticamente entrará no seu Grupo!
               </Text>

               <Text style={[styles.inputLabel, { color: textMuted }]}>Nome Completo</Text>
               <TextInput 
                 style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                 placeholder="Ex: João da Silva"
                 placeholderTextColor={textMuted}
                 value={inviteName}
                 onChangeText={setInviteName}
               />

               <Text style={[styles.inputLabel, { color: textMuted, marginTop: 16 }]}>E-mail Oficial</Text>
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
                 disabled={!inviteName || !inviteEmail || isInviting}
               >
                 {isInviting ? (
                   <ActivityIndicator color="#FFF" />
                 ) : (
                   <Text style={styles.modalBtnText}>Disparar E-mail de Convite</Text>
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
  avatarTemp: { width: 48, height: 48, borderRadius: 24, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
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
