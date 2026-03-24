import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const mockMessages = [
  { id: '1', author: 'Pr. Rafael Sena', role: 'Líder', text: 'Bom dia amados! Olhem a foto incrível do nosso último encontro. 🔥', image: 'https://images.unsplash.com/photo-1543884144-80252b47fc0d?q=80&w=800&auto=format&fit=crop', time: 'Ontem, 14:00', isMe: false, avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', author: 'Você', role: 'Membro', text: 'Que benção pastor! Célula incrível.', time: 'Ontem, 14:30', isMe: true, avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', author: 'Lucas Almeida', role: 'Anfitrião', text: 'Esperamos todos vocês amanhã novamente pra mais!', time: 'Ontem, 16:00', isMe: false, avatar: 'https://i.pravatar.cc/150?img=33' }
];

export default function GroupBoardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [inputText, setInputText] = useState('');

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <View>
             <Text style={[styles.headerTitle, { color: textColor }]}>Mural do Grupo</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>3 novos avisos (+1 Mídia)</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
           <View style={[styles.announcementCard, { backgroundColor: 'rgba(91, 195, 187, 0.15)', borderColor: '#5bc3bb' }]}>
              <Feather name="bell" size={20} color="#5bc3bb" style={{ marginBottom: 8 }} />
              <Text style={[styles.announcementTitle, { color: textColor }]}>Aviso Importante</Text>
              <Text style={[styles.announcementText, { color: isDark ? '#CCC' : '#444' }]}>
                As mídias aqui enviadas (fotos/vídeos) alimentam o Álbum exclusivo do nosso grupo automaticamente!
              </Text>
           </View>

           {mockMessages.map(msg => (
             <View key={msg.id} style={[styles.messageWrapper, msg.isMe ? styles.messageRight : styles.messageLeft]}>
               {!msg.isMe && <Image source={{ uri: msg.avatar }} style={styles.avatar} />}
               <View style={[
                  styles.messageBubble, 
                  { backgroundColor: msg.isMe ? '#5bc3bb' : cardColor },
                  msg.isMe && { borderBottomRightRadius: 4 },
                  !msg.isMe && { borderBottomLeftRadius: 4 },
                  msg.image ? { padding: 4 } : { padding: 12 }
               ]}>
                  {!msg.isMe && !msg.image && (
                    <View style={styles.messageMeta}>
                      <Text style={[styles.messageAuthor, { color: textColor }]}>{msg.author}</Text>
                      {msg.role === 'Líder' && <Text style={styles.roleTag}>LÍDER</Text>}
                    </View>
                  )}
                  
                  {msg.image && (
                    <View style={styles.imageAttachmentBox}>
                      {!msg.isMe && (
                          <View style={[styles.messageMeta, { position: 'absolute', top: 12, left: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
                            <Text style={[styles.messageAuthor, { color: '#FFF' }]}>{msg.author}</Text>
                          </View>
                      )}
                      <Image source={{ uri: msg.image }} style={styles.messageImage} />
                    </View>
                  )}

                  <View style={msg.image ? { padding: 8, paddingTop: 4 } : {}}>
                    <Text style={[styles.messageText, { color: msg.isMe ? '#FFF' : textColor }]}>{msg.text}</Text>
                    <Text style={[styles.messageTime, { color: msg.isMe ? 'rgba(255,255,255,0.7)' : textMuted }]}>{msg.time}</Text>
                  </View>
               </View>
             </View>
           ))}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
           <View style={[styles.inputContainer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
              <TouchableOpacity style={styles.attachBtn}>
                <Feather name="paperclip" size={22} color={textMuted} />
              </TouchableOpacity>
              <TextInput 
                style={[styles.input, { color: textColor, backgroundColor: isDark ? '#1a2130' : '#f0f0f0' }]} 
                placeholder="Escreva ou anexe..."
                placeholderTextColor={textMuted}
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.cameraBtn}>
                <Feather name="camera" size={20} color={textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: inputText.length > 0 ? '#5bc3bb' : textMuted, opacity: inputText.length > 0 ? 1 : 0.5 }]}>
                <Feather name="send" size={18} color="#FFF" />
              </TouchableOpacity>
           </View>
        </KeyboardAvoidingView>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  announcementCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  announcementTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  announcementText: { fontSize: 14, lineHeight: 20 },

  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', maxWidth: '85%' },
  messageLeft: { alignSelf: 'flex-start' },
  messageRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  messageAuthor: { fontSize: 13, fontWeight: '700', marginRight: 8 },
  roleTag: { fontSize: 9, fontWeight: '800', color: '#5bc3bb', backgroundColor: 'rgba(91, 195, 187, 0.2)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 11, alignSelf: 'flex-end', marginTop: 6 },
  imageAttachmentBox: { width: 280, height: 200, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  messageImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, alignItems: 'center' },
  attachBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: -8 },
  input: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 16 }
});
