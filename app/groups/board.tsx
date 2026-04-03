import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import * as ImagePicker from 'expo-image-picker'; // IMPORT DO EXPO PARA GALERIA

type Post = {
  id: string;
  author_id: string;
  author_name: string;
  content_text: string | null;
  media_url: string | null;
  media_type: 'NONE' | 'IMAGE' | 'VIDEO';
  created_at: string;
};

export default function GroupBoardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [posts, setPosts] = useState<Post[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [myUserId, setMyUserId] = useState<string>('');
  const [myName, setMyName] = useState<string>('');
  const [myGroupId, setMyGroupId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#5bc3bb';

  useEffect(() => {
    loadUserAndPosts();
  }, []);

  const loadUserAndPosts = async () => {
    setLoading(true);
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      let groupId = '';
      let userId = '';
      let userName = 'Membro';

      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          userId = user.userId;
          setMyUserId(userId);
          
          const userRes = await fetch(`${baseUrl}/members/${userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            userName = userData.data?.name || 'Membro';
            setMyName(userName);
            
            if (userData.data?.cell_group_id) {
              groupId = userData.data.cell_group_id;
              setMyGroupId(groupId);
            }
          }
        }
      } catch (e) { console.log(e); }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch(`${baseUrl}/posts${groupId ? `?group_id=${groupId}` : ''}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.log('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setIsSending(true);

    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const newPost = {
        cell_group_id: myGroupId || null,
        author_id: myUserId,
        author_name: myName,
        content_text: inputText.trim(),
        media_type: 'NONE',
        media_url: null
      };

      const res = await fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        setInputText('');
        loadUserAndPosts(); // Reload feed
      } else {
        Alert.alert("Erro", "Não foi possível enviar a mensagem.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachMedia = async () => {
    try {
      // 1. Pede permissão e abre a galeria do celular do Líder/Membro
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSending(true);
        const asset = result.assets[0];
        
        // 2. Extrair o Blob ANTES de gerar a URL, pois precisamos casar o Content-Type perfeitamente
        // no React Native a conversão de `file://` para Blob às vezes gera tipos inesperados (ex: image/jpg ao invés de jpeg)
        const imageBlob = await fetch(asset.uri).then(r => r.blob());
        const exactContentType = imageBlob.type || 'image/jpeg';
        const fileName = asset.fileName || `upload_${Date.now()}.jpg`;

        const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        // 3. Batendo no Backend para gerar o link S3 com o Tipo Exato!
        const getUrlRes = await fetch(`${baseUrl}/upload-url?filename=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(exactContentType)}&target_route=mural_celulas`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!getUrlRes.ok) throw new Error("Falha ao configurar upload AWS S3");
        
        const { uploadUrl, fileUrl } = await getUrlRes.json();

        // 4. Fazendo o UPLOAD DIRETO Do App para o AWS S3
        const s3UploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': exactContentType },
          body: imageBlob
        });

        if (!s3UploadRes.ok) {
           const logErr = await s3UploadRes.text();
           throw new Error("Erro S3: " + logErr);
        }

        // 5. Postar no Banco
        const newPost = {
          cell_group_id: myGroupId || null,
          author_id: myUserId,
          author_name: myName,
          content_text: (inputText.trim().length > 0 ? inputText.trim() : null),
          media_type: 'IMAGE',
          media_url: fileUrl  // URL real pública AWS
        };

        const postRes = await fetch(`${baseUrl}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newPost)
        });

        if (postRes.ok) {
          setInputText('');
          loadUserAndPosts();
        } else {
          Alert.alert("Erro", "Erro ao salvar a postagem com a mídia.");
        }
      }
    } catch (err: any) {
      console.log('Upload error:', err);
      Alert.alert("Ops", err?.message || "Algo deu errado no upload");
    } finally {
      setIsSending(false);
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
             <Text style={[styles.headerTitle, { color: textColor }]}>Mural do Grupo</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>{posts.length} avisos</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets={true}>
           <View style={[styles.announcementCard, { backgroundColor: 'rgba(91, 195, 187, 0.15)', borderColor: '#5bc3bb' }]}>
              <Feather name="bell" size={20} color="#5bc3bb" style={{ marginBottom: 8 }} />
              <Text style={[styles.announcementTitle, { color: textColor }]}>Ambiente Seguro</Text>
              <Text style={[styles.announcementText, { color: isDark ? '#CCC' : '#444' }]}>
                As mensagens enviadas aqui são vistas apenas pelos participantes da sua célula.
              </Text>
           </View>

           {loading ? (
             <ActivityIndicator size="large" color={accentColor} style={{ marginTop: 20 }} />
           ) : posts.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
               <Feather name="message-circle" size={48} color={textMuted} style={{ marginBottom: 8 }} />
               <Text style={{ color: textMuted }}>Nenhuma mensagem ainda.</Text>
             </View>
           ) : (
             posts.slice().reverse().map(msg => {
               const isMe = msg.author_id === myUserId;
               const timeParsed = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               const isSede = msg.author_name === 'Admin' || !msg.author_id;

               return (
                 <View key={msg.id} style={[styles.messageWrapper, isMe ? styles.messageRight : styles.messageLeft]}>
                   {!isMe && (
                     <View style={[styles.avatarTemp, { backgroundColor: isSede ? accentColor : borderColor }]}>
                       <Text style={{ fontWeight: 'bold', color: isSede ? '#FFF' : textMuted }}>{isSede ? 'A' : msg.author_name[0]}</Text>
                     </View>
                   )}
                   
                   <View style={[
                      styles.messageBubble, 
                      { backgroundColor: isMe ? accentColor : cardColor },
                      isMe && { borderBottomRightRadius: 4 },
                      !isMe && { borderBottomLeftRadius: 4 },
                      msg.media_url ? { padding: 4 } : { padding: 12 }
                   ]}>
                      {!isMe && !msg.media_url && (
                        <View style={styles.messageMeta}>
                          <Text style={[styles.messageAuthor, { color: textColor }]}>{isSede ? 'Igreja / Sede' : msg.author_name}</Text>
                        </View>
                      )}
                      
                      {msg.media_url ? (
                        <View style={styles.imageAttachmentBox}>
                          {!isMe && (
                              <View style={[styles.messageMeta, { position: 'absolute', top: 12, left: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }]}>
                                <Text style={[styles.messageAuthor, { color: '#FFF' }]}>{isSede ? 'Igreja' : msg.author_name}</Text>
                              </View>
                          )}
                          <Image source={{ uri: msg.media_url }} style={styles.messageImage} />
                        </View>
                      ) : null}

                      <View style={msg.media_url ? { padding: 8, paddingTop: 4 } : {}}>
                        <Text style={[styles.messageText, { color: isMe ? '#FFF' : textColor }]}>{msg.content_text}</Text>
                        <Text style={[styles.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : textMuted }]}>{timeParsed}</Text>
                      </View>
                   </View>
                 </View>
               );
             })
           )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
           <View style={[styles.inputContainer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
              <TouchableOpacity style={styles.attachBtn} onPress={handleAttachMedia}>
                <Feather name="paperclip" size={22} color={textMuted} />
              </TouchableOpacity>
              
              <TextInput 
                style={[styles.input, { color: textColor, backgroundColor: isDark ? '#1a2130' : '#f0f0f0' }]} 
                placeholder="Escreva algo..."
                placeholderTextColor={textMuted}
                value={inputText}
                onChangeText={setInputText}
                editable={!isSending}
                multiline
              />
              
              <TouchableOpacity style={styles.cameraBtn} onPress={handleAttachMedia}>
                <Feather name="camera" size={20} color={textMuted} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendBtn, { backgroundColor: inputText.length > 0 ? accentColor : textMuted, opacity: inputText.length > 0 && !isSending ? 1 : 0.5 }]}
                onPress={handleSend}
                disabled={inputText.length === 0 || isSending}
              >
                {isSending ? <ActivityIndicator size="small" color="#FFF" /> : <Feather name="send" size={18} color="#FFF" />}
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
  avatarTemp: { width: 36, height: 36, borderRadius: 18, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  messageBubble: { padding: 12, borderRadius: 16, maxWidth: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  messageMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  messageAuthor: { fontSize: 13, fontWeight: '700', marginRight: 8 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 11, alignSelf: 'flex-end', marginTop: 6 },
  imageAttachmentBox: { width: 280, height: 200, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  messageImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  inputContainer: { flexDirection: 'row', padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, alignItems: 'center' },
  attachBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  cameraBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: -8 },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, paddingHorizontal: 16, paddingTop: 12, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 16 }
});
