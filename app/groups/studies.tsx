import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const initialStudies = [
  { id: '1', title: 'O Sermão da Montanha', date: '21 Mar, 2026', type: 'PDF', icon: 'file-text' },
  { id: '2', title: 'A Paz que Excede', date: '14 Mar, 2026', type: 'Vídeo', icon: 'youtube' },
  { id: '3', title: 'Fundamentos da Fé', date: '07 Mar, 2026', type: 'PDF', icon: 'file-text' },
  { id: '4', title: 'Como Orar de Verdade', date: '28 Fev, 2026', type: 'PDF', icon: 'file-text' },
];

export default function GroupStudiesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [studies, setStudies] = useState(initialStudies);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newStudyTitle, setNewStudyTitle] = useState('');
  const [isFileAttached, setIsFileAttached] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const accentColor = '#FF9500';

  const handleUpload = () => {
    if (!newStudyTitle || !isFileAttached) return;
    
    const newStudy = {
      id: Math.random().toString(),
      title: newStudyTitle,
      date: 'Hoje',
      type: 'PDF',
      icon: 'file-text'
    };
    
    setStudies([newStudy, ...studies]);
    setShowUploadModal(false);
    setNewStudyTitle('');
    setIsFileAttached(false);
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
             <Text style={[styles.headerTitle, { color: textColor }]}>Estudos</Text>
             <Text style={[styles.headerSubtitle, { color: textMuted }]}>Material Oficial</Text>
          </View>
          <TouchableOpacity onPress={() => setShowUploadModal(true)} style={styles.backBtn}>
            <Feather name="upload-cloud" size={24} color={accentColor} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.highlightCard, { backgroundColor: accentColor }]}>
             <Feather name="star" size={24} color="#FFF" style={{ marginBottom: 12 }} />
             <Text style={[styles.highlightSuperText, { color: 'rgba(255,255,255,0.7)' }]}>LIÇÃO DESTA SEMANA</Text>
             <Text style={[styles.highlightTitle, { color: '#FFF' }]}>Alegria Inabalável em Tempos Difíceis</Text>
             <TouchableOpacity style={[styles.highlightBtn, { backgroundColor: '#FFF' }]}>
               <Text style={[styles.highlightBtnText, { color: accentColor }]}>Baixar PDF Guiado</Text>
             </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor }]}>Histórico de Estudos</Text>

          {studies.map((study, index) => {
             const isLast = index === studies.length - 1;
             
             return (
               <TouchableOpacity 
                 key={study.id} 
                 style={[styles.studyRow, { backgroundColor: cardColor, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: borderColor }]}
                 activeOpacity={0.7}
               >
                 <View style={[styles.iconBox, { backgroundColor: isDark ? '#3a4455' : '#EAEAEA' }]}>
                   <Feather name={study.icon as any} size={22} color={textColor} />
                 </View>
                 
                 <View style={styles.studyInfo}>
                   <Text style={[styles.studyTitle, { color: textColor }]}>{study.title}</Text>
                   <Text style={[styles.studyDate, { color: textMuted }]}>{study.date} • {study.type}</Text>
                 </View>
                 
                 <Feather name="download-cloud" size={20} color={textMuted} />
               </TouchableOpacity>
             );
          })}
        </ScrollView>

        {/* Upload Modal (Líder) */}
        <Modal visible={showUploadModal} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
            <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
               <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Novo Estudo de Célula</Text>
                  <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                    <Feather name="x" size={24} color={textMuted} />
                  </TouchableOpacity>
               </View>

               <Text style={[styles.inputLabel, { color: textMuted }]}>Título da Lição</Text>
               <TextInput 
                 style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: isDark ? '#1a2130' : '#FAFAFA' }]}
                 placeholder="Ex: Vida Guiada pelo Espírito..."
                 placeholderTextColor={textMuted}
                 value={newStudyTitle}
                 onChangeText={setNewStudyTitle}
               />

               <Text style={[styles.inputLabel, { color: textMuted, marginTop: 16 }]}>Arquivo do Estudo</Text>
               <TouchableOpacity 
                 style={[styles.uploadBox, { borderColor: isFileAttached ? '#34C759' : accentColor, backgroundColor: isFileAttached ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.05)' }]}
                 onPress={() => setIsFileAttached(true)}
               >
                 {isFileAttached ? (
                   <>
                     <Feather name="file-text" size={28} color="#34C759" style={{ marginBottom: 8 }} />
                     <Text style={{ color: '#34C759', fontWeight: '600' }}>arquivo_doc_celula_2026.pdf</Text>
                     <Text style={{ color: '#34C759', fontSize: 12, marginTop: 4 }}>1.2 MB anexado com sucesso</Text>
                   </>
                 ) : (
                   <>
                     <Feather name="upload-cloud" size={32} color={accentColor} style={{ marginBottom: 8 }} />
                     <Text style={{ color: accentColor, fontWeight: '600' }}>Toque para escolher um PDF</Text>
                     <Text style={{ color: textMuted, fontSize: 12, marginTop: 4 }}>Tamanho máximo: 10MB</Text>
                   </>
                 )}
               </TouchableOpacity>

               <TouchableOpacity 
                 style={[styles.modalBtn, { backgroundColor: (newStudyTitle && isFileAttached) ? accentColor : textMuted, marginTop: 24 }]}
                 onPress={handleUpload}
                 disabled={!newStudyTitle || !isFileAttached}
               >
                 <Text style={styles.modalBtnText}>Publicar para o Grupo</Text>
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
  
  highlightCard: { padding: 24, borderRadius: 20, marginBottom: 32, shadowColor: '#FF9500', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  highlightSuperText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  highlightTitle: { fontSize: 24, fontWeight: '800', marginBottom: 20, lineHeight: 30 },
  highlightBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  highlightBtnText: { fontWeight: '800', fontSize: 15 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },

  studyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  studyInfo: { flex: 1 },
  studyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  studyDate: { fontSize: 13 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, padding: 32, alignItems: 'center', justifyContent: 'center' },
  modalBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});
