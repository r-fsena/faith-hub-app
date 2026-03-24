import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, Modal, KeyboardAvoidingView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const mockProjects = [
  { 
    id: 'p1', 
    title: 'Reforma do Telhado Infantil', 
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800&auto=format&fit=crop', 
    goal: 15000, 
    raised: 8500, 
    desc: 'O telhado das salas das crianças foi danificado nas últimas chuvas. Precisamos nos unir para reconstruir e garantir segurança!',
    pix: 'cnpj: 12.345.678/0001-90'
  },
  { 
    id: 'p2', 
    title: 'Missões África 2026', 
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop', 
    goal: 50000, 
    raised: 12400, 
    desc: 'Buscamos enviar recursos para a construção de 2 chafarizes em vilarejos afetados pela seca extrema. Cada gota conta!',
    pix: 'email: missoes@faithhub.com'
  }
];

export default function DonateScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachContext, setAttachContext] = useState<string>(''); // 'dizimo' or 'projectName'
  const [isFileAttached, setIsFileAttached] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const accentColor = '#34C759'; // Green symbolizes giving/money
  
  const formatMoney = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`;

  const openInfo = (project: any) => {
    setSelectedProject(project);
    setShowInfoModal(true);
  };

  const openAttach = (contextName: string) => {
    setAttachContext(contextName);
    setIsFileAttached(false);
    setShowAttachModal(true);
  };

  const handleSendReceipt = () => {
    // In actual code, upload the receipt to AWS S3/Backend
    setIsFileAttached(false);
    setShowAttachModal(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: bgColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Contribuições</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Dízimos e Ofertas Oficiais */}
        <View style={[styles.titheCard, { backgroundColor: '#1C1C1E', borderColor: isDark ? '#333' : '#000', borderWidth: isDark ? 1 : 0 }]}>
           <Feather name="shield" size={32} color={accentColor} style={{ marginBottom: 12 }} />
           <Text style={styles.titheSuper}>INSTITUCIONAL</Text>
           <Text style={styles.titheTitle}>Dízimos e Ofertas</Text>
           <Text style={styles.titheDesc}>Semeie na casa do Senhor de forma segura e transparente. Toda contribuição sustenta o corpo local.</Text>
           
           <View style={styles.pixRow}>
              <View style={styles.pixKeyBox}>
                 <Text style={styles.pixKeyLabel}>CHAVE PIX CNPJ</Text>
                 <Text style={styles.pixKeyValue}>22.333.444/0001-55</Text>
              </View>
              <TouchableOpacity style={[styles.copyBtn, { backgroundColor: accentColor }]}>
                 <Feather name="copy" size={18} color="#000" />
              </TouchableOpacity>
           </View>
           
           <TouchableOpacity style={styles.attachReceiptBtn} onPress={() => openAttach('Dízimos e Ofertas')}>
              <Feather name="camera" size={16} color={accentColor} style={{ marginRight: 8 }} />
              <Text style={{ color: accentColor, fontWeight: '700', fontSize: 13 }}>Anexar Comprovante (Opcional)</Text>
           </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor }]}>Projetos EspeciaiS</Text>
        <Text style={[styles.sectionSub, { color: textMuted }]}>
          Abrace causas ativas que a comunidade está apoiando coletivamente nesta temporada.
        </Text>

        {/* Projetos List */}
        {mockProjects.map(project => {
          const progress = project.raised / project.goal;
          const pct = Math.min(Math.round(progress * 100), 100);

          return (
            <View key={project.id} style={[styles.projectCard, { backgroundColor: cardColor, borderColor }]}>
               <Image source={{ uri: project.image }} style={styles.projectImage} />
               <View style={styles.projectBody}>
                  
                  <View style={styles.projectHeaderRow}>
                    <Text style={[styles.projectTitle, { color: textColor, flex: 1 }]} numberOfLines={2}>{project.title}</Text>
                    <TouchableOpacity style={[styles.infoBtn, { backgroundColor: isDark ? '#3a4455' : '#EAEAEA' }]} onPress={() => openInfo(project)}>
                      <Feather name="info" size={16} color={textColor} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressDataRow}>
                    <Text style={[styles.progressVal, { color: accentColor }]}>{formatMoney(project.raised)}</Text>
                    <Text style={[styles.progressGoal, { color: textMuted }]}>de {formatMoney(project.goal)}</Text>
                  </View>

                  {/* Barra de Progresso */}
                  <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#3a4455' : '#EAEAEA' }]}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: accentColor }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: textMuted }]}>{pct}% alcançado</Text>

                  {/* Buttons */}
                  <View style={styles.projectActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accentColor }]} onPress={() => openInfo(project)}>
                      <Feather name="heart" size={16} color="#000" />
                      <Text style={[styles.actionBtnText, { color: '#000' }]}>Apoiar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.outlineBtn, { borderColor: accentColor }]} onPress={() => openAttach(`Projeto: ${project.title}`)}>
                      <Feather name="upload" size={16} color={accentColor} />
                      <Text style={[styles.outlineBtnText, { color: accentColor }]}>Comprovante</Text>
                    </TouchableOpacity>
                  </View>

               </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Info Modal */}
      <Modal visible={showInfoModal} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor, padding: 0, paddingBottom: 40 }]}>
             {selectedProject && (
               <>
                 <Image source={{ uri: selectedProject.image }} style={{ width: '100%', height: 200, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
                 <TouchableOpacity style={styles.modalCloseOverlay} onPress={() => setShowInfoModal(false)}>
                   <Feather name="x-circle" size={32} color="#FFF" />
                 </TouchableOpacity>

                 <View style={{ padding: 24 }}>
                   <Text style={[styles.modalTitle, { color: textColor }]}>{selectedProject.title}</Text>
                   <Text style={[styles.modalDesc, { color: textMuted, marginTop: 12 }]}>{selectedProject.desc}</Text>
                   
                   <View style={[styles.pixHighlightBox, { backgroundColor: 'rgba(52, 199, 89, 0.1)', borderColor: accentColor }]}>
                     <Text style={[styles.pixHighlightLabel, { color: accentColor }]}>CHAVE DO PROJETO</Text>
                     <Text style={[styles.pixHighlightVal, { color: textColor }]}>{selectedProject.pix}</Text>
                   </View>
                 </View>
               </>
             )}
          </View>
        </View>
      </Modal>

      {/* Upload/Attach Receipt Modal */}
      <Modal visible={showAttachModal} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor, padding: 24, paddingBottom: 40 }]}>
             <View style={styles.modalTopBar} />
             <Text style={[styles.modalTitle, { color: textColor, marginBottom: 8 }]}>Anexar Comprovante</Text>
             <Text style={[styles.modalDesc, { color: textMuted, marginBottom: 24 }]}>
               Destino: <Text style={{ fontWeight: '700', color: textColor }}>{attachContext}</Text>
             </Text>

             <TouchableOpacity 
               style={[styles.uploadBox, { borderColor: isFileAttached ? '#34C759' : accentColor, backgroundColor: isFileAttached ? 'rgba(52, 199, 89, 0.1)' : 'rgba(52, 199, 89, 0.05)' }]}
               onPress={() => setIsFileAttached(true)}
             >
               {isFileAttached ? (
                 <>
                   <Feather name="check-circle" size={32} color="#34C759" style={{ marginBottom: 12 }} />
                   <Text style={{ color: '#34C759', fontWeight: '700', fontSize: 16 }}>Comprovante Anexado</Text>
                   <Text style={{ color: '#34C759', fontSize: 12, marginTop: 4 }}>comp_transferencia_029.pdf</Text>
                 </>
               ) : (
                 <>
                   <Feather name="upload-cloud" size={36} color={accentColor} style={{ marginBottom: 12 }} />
                   <Text style={{ color: accentColor, fontWeight: '700', fontSize: 16 }}>Tocar para anexar (Galeria/PDF)</Text>
                 </>
               )}
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.submitBtn, { backgroundColor: isFileAttached ? accentColor : textMuted, opacity: isFileAttached ? 1 : 0.5 }]}
               onPress={handleSendReceipt}
               disabled={!isFileAttached}
             >
               <Text style={[styles.submitBtnText, { color: isFileAttached ? '#000' : '#FFF' }]}>Enviar para a Tesouraria</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setShowAttachModal(false)}>
               <Text style={{ color: textMuted, fontWeight: '600' }}>Cancelar</Text>
             </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
  
  // Dízimos (Dark Block Fixed Style)
  titheCard: { borderRadius: 20, padding: 24, marginBottom: 32, shadowColor: '#34C759', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15 },
  titheSuper: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  titheTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  titheDesc: { color: '#CCC', fontSize: 14, lineHeight: 22, marginBottom: 24 },
  pixRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 12, padding: 12, marginBottom: 16 },
  pixKeyBox: { flex: 1 },
  pixKeyLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  pixKeyValue: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  copyBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  attachReceiptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#34C759', borderRadius: 12, borderStyle: 'dashed' },

  sectionTitle: { fontSize: 18, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  sectionSub: { fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 24 },

  projectCard: { borderWidth: 1, borderRadius: 20, marginBottom: 24, overflow: 'hidden' },
  projectImage: { width: '100%', height: 160, resizeMode: 'cover' },
  projectBody: { padding: 20 },
  projectHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  projectTitle: { fontSize: 18, fontWeight: '800', lineHeight: 24, paddingRight: 16 },
  infoBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  progressDataRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  progressVal: { fontSize: 20, fontWeight: '800', marginRight: 8 },
  progressGoal: { fontSize: 13, fontWeight: '600' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPct: { fontSize: 11, fontWeight: '700', alignSelf: 'flex-end', marginBottom: 24 },

  projectActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12 },
  actionBtnText: { fontWeight: '800', fontSize: 14, marginLeft: 8 },
  outlineBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  outlineBtnText: { fontWeight: '700', fontSize: 13, marginLeft: 8 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTopBar: { width: 40, height: 5, backgroundColor: '#CCC', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalCloseOverlay: { position: 'absolute', top: 20, right: 20, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 4 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  modalDesc: { fontSize: 15, lineHeight: 24 },
  pixHighlightBox: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  pixHighlightLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  pixHighlightVal: { fontSize: 16, fontWeight: '700' },

  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { fontWeight: '800', fontSize: 16 }
});
