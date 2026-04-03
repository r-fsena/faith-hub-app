import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, Modal, KeyboardAvoidingView, TextInput, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const initialPrayers = [
  { 
    id: 'pr1', 
    author: 'Rafael Sena', 
    avatar: 'https://i.pravatar.cc/150?img=11',
    isAnonymous: false, 
    content: 'Família, peço orações pela cirurgia da minha mãe que acontecerá amanhã de manhã. Estamos confiantes, mas precisamos de intercessão!', 
    time: '2h', 
    likes: 15,
    likedByMe: false,
    comments: [
      { id: 'c1', author: 'Sarah', isPrivate: false, text: 'Estaremos orando pastor! Deus está no controle.' }
    ]
  },
  { 
    id: 'pr2', 
    author: 'Anônimo', 
    avatar: null,
    isAnonymous: true, 
    content: 'Irmãos, tenho passado por uma crise de ansiedade muito forte por conta do meu trabalho. Me sinto esgotado(a). Rezem por mim.', 
    time: '5h', 
    likes: 42,
    likedByMe: true,
    comments: []
  },
  { 
    id: 'pr3', 
    author: 'Lucas Almeida', 
    avatar: 'https://i.pravatar.cc/150?img=33',
    isAnonymous: false, 
    content: 'Gostaria de agradecer a todos que oraram pelo meu emprego, hoje assinei o contrato! Louvado seja Deus!', 
    time: 'Ontem', 
    likes: 89,
    likedByMe: true,
    comments: [
      { id: 'c2', author: 'Você', isPrivate: false, text: 'Glória a Deus meu irmão!!' }
    ]
  }
];

export default function PrayersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [prayers, setPrayers] = useState<any[]>(initialPrayers);
  
  // New Prayer State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPrayerText, setNewPrayerText] = useState('');
  const [isAnonymousPost, setIsAnonymousPost] = useState(false);

  // Comment State
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePrayer, setActivePrayer] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [isPrivateComment, setIsPrivateComment] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#EC4899'; // Pink/Rose for prayers
  
  const handleLike = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const handlePostPrayer = () => {
    if (!newPrayerText.trim()) return;
    const newPrayer = {
      id: Math.random().toString(),
      author: isAnonymousPost ? 'Anônimo' : 'Você',
      avatar: isAnonymousPost ? null : 'https://i.pravatar.cc/150?img=12',
      isAnonymous: isAnonymousPost,
      content: newPrayerText,
      time: 'Agora',
      likes: 0,
      likedByMe: false,
      comments: []
    };
    setPrayers([newPrayer, ...prayers]);
    setShowNewModal(false);
    setNewPrayerText('');
    setIsAnonymousPost(false);
  };

  const openCommentModal = (prayer: any) => {
    setActivePrayer(prayer);
    setCommentText('');
    setIsPrivateComment(false);
    setShowCommentModal(true);
  };

  const handlePostComment = () => {
    if (!commentText.trim() || !activePrayer) return;
    
    setPrayers(prev => prev.map(p => {
      if (p.id === activePrayer.id) {
        return {
          ...p,
          comments: [...p.comments, { 
            id: Math.random().toString(), 
            author: 'Você', 
            isPrivate: isPrivateComment, 
            text: commentText 
          }]
        };
      }
      return p;
    }));
    
    setShowCommentModal(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: bgColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Orações</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowNewModal(true)}>
           <Feather name="edit-3" size={24} color={accentColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.infoBanner, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : '#FDF2F8' }]}>
           <Feather name="info" size={20} color={accentColor} style={{ marginTop: 2 }} />
           <Text style={[styles.infoBannerText, { color: isDark ? '#FBCFE8' : '#831843' }]}>
             Este é um ambiente seguro. Você pode publicar anonimamente, e comentários privados ficarão visíveis apenas para quem fez o pedido.
           </Text>
        </View>

        {prayers.map(prayer => (
          <View key={prayer.id} style={[styles.postCard, { backgroundColor: cardColor, borderColor }]}>
             <View style={styles.postHeader}>
                {prayer.isAnonymous ? (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#3f4b5f' : '#E5E7EB' }]}>
                    <Feather name="user" size={20} color={textMuted} />
                  </View>
                ) : (
                  <Image source={{ uri: prayer.avatar! }} style={styles.avatarImage} />
                )}
                
                <View style={styles.postMeta}>
                   <Text style={[styles.postAuthor, { color: textColor }]}>{prayer.author}</Text>
                   <Text style={[styles.postTime, { color: textMuted }]}>{prayer.time}</Text>
                </View>
             </View>

             <Text style={[styles.postContent, { color: textColor }]}>{prayer.content}</Text>

             {/* Action Bar */}
             <View style={[styles.actionBar, { borderTopColor: borderColor }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(prayer.id)}>
                   <Feather name="heart" size={20} color={prayer.likedByMe ? accentColor : textMuted} />
                   <Text style={[styles.actionBtnText, { color: prayer.likedByMe ? accentColor : textMuted }]}>
                     {prayer.likes} Amém
                   </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => openCommentModal(prayer)}>
                   <Feather name="message-circle" size={20} color={textMuted} />
                   <Text style={[styles.actionBtnText, { color: textMuted }]}>
                     {prayer.comments.length} Comentários
                   </Text>
                </TouchableOpacity>
             </View>

             {/* Render 1-2 latest comments preview */}
             {prayer.comments.length > 0 && (
               <View style={[styles.commentsSection, { backgroundColor: isDark ? '#232a35' : '#F9FAFB' }]}>
                 {prayer.comments.map((comment: any) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <Text style={styles.commentContent}>
                        <Text style={[styles.commentAuthor, { color: textColor }]}>{comment.author}: </Text>
                        
                        {comment.isPrivate ? (
                          <Text style={{ color: textMuted, fontStyle: 'italic' }}>
                            <Feather name="lock" size={12} /> Mensagem privada para o autor.
                          </Text>
                        ) : (
                          <Text style={{ color: textMuted }}>{comment.text}</Text>
                        )}
                      </Text>
                    </View>
                 ))}
               </View>
             )}
          </View>
        ))}
      </ScrollView>


      {/* NOVO PEDIDO MODAL */}
      <Modal visible={showNewModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
             <View style={styles.modalHeaderRow}>
               <Text style={[styles.modalTitle, { color: textColor }]}>Novo Pedido de Oração</Text>
               <TouchableOpacity onPress={() => setShowNewModal(false)}>
                 <Feather name="x" size={24} color={textMuted} />
               </TouchableOpacity>
             </View>

             <TextInput 
               style={[styles.textArea, { color: textColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA', borderColor }]}
               placeholder="Como podemos orar por você?"
               placeholderTextColor={textMuted}
               multiline
               maxLength={300}
               value={newPrayerText}
               onChangeText={setNewPrayerText}
             />

             <View style={styles.switchRow}>
               <View style={{ flex: 1, marginRight: 16 }}>
                 <Text style={[styles.switchLabel, { color: textColor }]}>Ocultar minha identidade</Text>
                 <Text style={[styles.switchDesc, { color: textMuted }]}>Seu nome ficará como "Anônimo"</Text>
               </View>
               <Switch 
                 value={isAnonymousPost} 
                 onValueChange={setIsAnonymousPost}
                 trackColor={{ true: accentColor }}
               />
             </View>

             <TouchableOpacity 
               style={[styles.submitBtn, { backgroundColor: newPrayerText.length > 5 ? accentColor : textMuted, opacity: newPrayerText.length > 5 ? 1 : 0.5 }]}
               onPress={handlePostPrayer}
               disabled={newPrayerText.length < 5}
             >
               <Text style={[styles.submitBtnText, { color: '#FFF' }]}>Publicar Pedido</Text>
             </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* COMENTAR MODAL */}
      <Modal visible={showCommentModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
             <View style={styles.modalHeaderRow}>
               <Text style={[styles.modalTitle, { color: textColor }]}>Adicionar Comentário</Text>
               <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                 <Feather name="x" size={24} color={textMuted} />
               </TouchableOpacity>
             </View>

             <View style={[styles.originalPostBox, { backgroundColor: isDark ? '#1a2130' : '#F9FAFB', borderColor }]}>
                <Text style={[styles.originalPostAuthor, { color: textColor }]}>{activePrayer?.author}</Text>
                <Text style={[styles.originalPostText, { color: textMuted }]} numberOfLines={2}>"{activePrayer?.content}"</Text>
             </View>

             <TextInput 
               style={[styles.textArea, { height: 100, color: textColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA', borderColor }]}
               placeholder="Escreva uma palavra de apoio ou oração..."
               placeholderTextColor={textMuted}
               multiline
               value={commentText}
               onChangeText={setCommentText}
             />

             <View style={styles.switchRow}>
               <View style={{ flex: 1, marginRight: 16 }}>
                 <Text style={[styles.switchLabel, { color: textColor }]}>Comentário Invisível (Privado)</Text>
                 <Text style={[styles.switchDesc, { color: textMuted }]}>Apenas o autor do pedido verá o que você escreveu.</Text>
               </View>
               <Switch 
                 value={isPrivateComment} 
                 onValueChange={setIsPrivateComment}
                 trackColor={{ true: accentColor }}
               />
             </View>

             <TouchableOpacity 
               style={[styles.submitBtn, { backgroundColor: commentText.length > 2 ? accentColor : textMuted, opacity: commentText.length > 2 ? 1 : 0.5 }]}
               onPress={handlePostComment}
               disabled={commentText.length < 2}
             >
               <Text style={[styles.submitBtnText, { color: '#FFF' }]}>{isPrivateComment ? 'Enviar Confidencialmente' : 'Postar Comentário'}</Text>
             </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 16, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
  
  infoBanner: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 24, alignItems: 'flex-start' },
  infoBannerText: { flex: 1, marginLeft: 12, fontSize: 13, lineHeight: 20, fontWeight: '500' },

  postCard: { borderWidth: 1, borderRadius: 16, marginBottom: 20, paddingBottom: 0, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarImage: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  postMeta: { flex: 1 },
  postAuthor: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  postTime: { fontSize: 12 },
  postContent: { fontSize: 15, lineHeight: 24, paddingHorizontal: 16, marginBottom: 16 },

  actionBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionBtnText: { fontSize: 14, fontWeight: '600', marginLeft: 8 },

  commentsSection: { padding: 16, paddingTop: 12 },
  commentRow: { marginBottom: 8 },
  commentContent: { fontSize: 14, lineHeight: 20 },
  commentAuthor: { fontWeight: '700' },

  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  
  textArea: { borderWidth: 1, borderRadius: 12, padding: 16, height: 140, fontSize: 16, textAlignVertical: 'top' },
  
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 24 },
  switchLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  switchDesc: { fontSize: 13, lineHeight: 18 },

  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { fontWeight: '800', fontSize: 16 },

  originalPostBox: { padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginBottom: 20 },
  originalPostAuthor: { fontWeight: '800', fontSize: 14, marginBottom: 4 },
  originalPostText: { fontStyle: 'italic', fontSize: 13, lineHeight: 18 }
});
