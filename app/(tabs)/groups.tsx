import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { APP_CONFIG } from '@/constants/AppConfig';

// Mock do Banco de Dados de Grupos
const availableGroups = [
  { id: 'g1', name: 'Aliança', leader: 'Pr. Rafael Sena', day: 'Terças, 20:00', neighborhood: 'Centro', focus: 'Jovens Adultos' },
  { id: 'g2', name: 'Esperança', leader: 'João e Maria', day: 'Quartas, 19:30', neighborhood: 'Jardim Botânico', focus: 'Casais' },
  { id: 'g3', name: 'Leão de Judá', leader: 'Lucas Almeida', day: 'Sábados, 18:00', neighborhood: 'Zona Sul', focus: 'Jovens e Adolescentes' },
];

export default function GroupsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // O usuário está aprovado pré-definidamente no grupo 'g1'
  const [myGroupId, setMyGroupId] = useState<string | null>('g1');
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  
  // Visão pode ser 'portal' (dentro do próprio grupo) ou 'discover' (explorando outros)
  const [viewMode, setViewMode] = useState<'portal' | 'discover'>(myGroupId ? 'portal' : 'discover');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const bgColor = isDark ? '#1a2130' : '#f5f5f5';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  
  const accentColor = '#5bc3bb';
  const termSingular = APP_CONFIG.terms.smallGroup;
  const termPlural = APP_CONFIG.terms.smallGroupPlural;

  const renderDiscoveryMode = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Explorar {termPlural}</Text>
      <Text style={[styles.sectionSubtitle, { color: textMuted }]}>
        Veja todas as opções na nossa igreja, por bairro, liderança e perfil!
      </Text>

      {availableGroups.map((group) => {
        const isMyGroup = myGroupId === group.id;
        const isPending = pendingGroupId === group.id;

        return (
          <View key={group.id} style={[styles.groupCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.groupCardHeader}>
              <View>
                <Text style={[styles.groupName, { color: textColor }]}>{group.name}</Text>
                <Text style={[styles.groupLeader, { color: textMuted }]}>Líder: {group.leader}</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                <Text style={[styles.tagText, { color: textMuted }]}>{group.focus}</Text>
              </View>
            </View>
            <View style={styles.groupInfoRow}>
              <Feather name="calendar" size={14} color={accentColor} />
              <Text style={[styles.groupInfoText, { color: textColor }]}>{group.day}</Text>
            </View>
            <View style={styles.groupInfoRow}>
              <Feather name="map-pin" size={14} color={accentColor} />
              <Text style={[styles.groupInfoText, { color: textColor }]}>Bairro: {group.neighborhood}</Text>
            </View>
            
            {isMyGroup ? (
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: '#34C759' }]}
                onPress={() => setViewMode('portal')}
              >
                <Text style={[styles.primaryBtnText, { color: '#FFF' }]}>Acessar Meu Grupo</Text>
              </TouchableOpacity>
            ) : isPending ? (
               <View style={[styles.pendingWarning, { borderColor: '#FF9500', borderWidth: 1 }]}>
                  <Feather name="clock" size={16} color="#FF9500" style={{ marginRight: 8 }}/>
                  <Text style={[styles.primaryBtnText, { color: '#FF9500' }]}>Em Análise pelo Líder</Text>
               </View>
            ) : (
              <TouchableOpacity 
                style={[styles.outlineBtn, { borderColor: accentColor }]}
                onPress={() => setPendingGroupId(group.id)}
              >
                <Text style={[styles.outlineBtnText, { color: accentColor }]}>Solicitar Participação</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderActivePortal = () => {
    // Acha os dados do meu grupo real
    const myGroupData = availableGroups.find(g => g.id === myGroupId);

    return (
      <View style={styles.portalContainer}>
        {/* Resumo do Grupo Atual */}
        <View style={[styles.heroCard, { backgroundColor: accentColor }]}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroPreTitle}>{termSingular.toUpperCase()} {myGroupData?.name.split(' ')[0]}</Text>
              <Text style={styles.heroTitle}>{myGroupData?.name}</Text>
            </View>
            <View style={styles.avatarGroup}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarMain} />
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.avatarSecondary} />
            </View>
          </View>
          <Text style={styles.heroParam}>Liderança: {myGroupData?.leader}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroInfoRow}>
            <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroInfoText}>{myGroupData?.day}</Text>
          </View>
          <View style={styles.heroInfoRow}>
            <Feather name="map-pin" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroInfoText}>{myGroupData?.neighborhood} (Sede)</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 10 }]}>Portal Conectado</Text>

        {/* Grid de Ferramentas / Sub-App */}
        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push('/groups/board')}
          >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(91, 195, 187, 0.1)' }]}>
                <Feather name="message-circle" size={24} color={accentColor} />
              </View>
              <Text style={[styles.toolTitle, { color: textColor }]}>Mural do Grupo</Text>
              <Text style={[styles.toolDesc, { color: textMuted }]}>Avisos e Orações</Text>
              <View style={styles.notificationBadge}><Text style={styles.badgeNumber}>2</Text></View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push('/groups/studies')}
          >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                <Feather name="book" size={24} color="#FF9500" />
              </View>
              <Text style={[styles.toolTitle, { color: textColor }]}>Estudos</Text>
              <Text style={[styles.toolDesc, { color: textMuted }]}>Lição da Semana</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push('/groups/members')}
          >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                <Feather name="users" size={24} color="#34C759" />
              </View>
              <Text style={[styles.toolTitle, { color: textColor }]}>Membros</Text>
              <Text style={[styles.toolDesc, { color: textMuted }]}>Ver Participantes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push('/groups/gallery')}
          >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(58, 130, 246, 0.1)' }]}>
                <Feather name="image" size={24} color="#3b82f6" />
              </View>
              <Text style={[styles.toolTitle, { color: textColor }]}>Álbum</Text>
              <Text style={[styles.toolDesc, { color: textMuted }]}>Memórias e Fotos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: bgColor }]}>
        {viewMode === 'discover' && myGroupId ? (
          <TouchableOpacity onPress={() => setViewMode('portal')} style={styles.headerBackBtn}>
            <Feather name="chevron-left" size={28} color={textColor} />
            <Text style={[styles.headerTitle, { color: textColor, marginLeft: 4 }]}>Buscar</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.headerTitle, { color: textColor }]}>Meus {termPlural}</Text>
        )}
        
        {viewMode === 'portal' && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setViewMode('discover')}>
              <Feather name="compass" size={22} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSettingsModal(true)}>
              <Feather name="settings" size={22} color={textColor} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {viewMode === 'discover' && renderDiscoveryMode()}
        {viewMode === 'portal' && renderActivePortal()}
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} animationType="fade" transparent={true}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowSettingsModal(false)}>
          <View style={[styles.settingsContainer, { backgroundColor: cardColor, borderColor }]} onStartShouldSetResponder={() => true}>
             <View style={styles.modalTopBar} />
             <Text style={[styles.settingsTitle, { color: textColor }]}>Configurações</Text>
             
             <TouchableOpacity style={styles.settingsRow}>
               <Feather name="bell" size={20} color={textColor} />
               <Text style={[styles.settingsText, { color: textColor }]}>Silenciar notificações</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.settingsRow}>
               <Feather name="share" size={20} color={textColor} />
               <Text style={[styles.settingsText, { color: textColor }]}>Compartilhar convite do grupo</Text>
             </TouchableOpacity>

             <View style={[styles.settingsDivider, { backgroundColor: borderColor }]} />

             <TouchableOpacity style={styles.settingsRow}>
               <Feather name="log-out" size={20} color="#FF3B30" />
               <Text style={[styles.settingsText, { color: '#FF3B30' }]}>Sair deste Grupo</Text>
             </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  headerBtn: { padding: 8 },
  headerBackBtn: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
  
  // Encontrar
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sectionSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  groupCard: { borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 16 },
  groupCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  groupName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  groupLeader: { fontSize: 13, fontWeight: '600' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  groupInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  groupInfoText: { fontSize: 14, marginLeft: 8, fontWeight: '500' },
  primaryBtn: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  pendingWarning: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center' },

  // Pendente
  pendingContainer: { alignItems: 'center', padding: 30, borderRadius: 16, borderWidth: 1, marginTop: 20 },
  pendingTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  pendingText: { fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  outlineBtn: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, width: '100%' },
  outlineBtnText: { fontWeight: '700', fontSize: 15 },

  // Portal Conectado
  portalContainer: { marginTop: 0 },
  heroCard: { padding: 24, borderRadius: 20, marginBottom: 24, shadowColor: '#5bc3bb', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroPreTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  heroParam: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  avatarGroup: { flexDirection: 'row' },
  avatarMain: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#5bc3bb' },
  avatarSecondary: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#5bc3bb', marginLeft: -20 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  heroInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  heroInfoText: { color: '#FFF', fontSize: 14, marginLeft: 8, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16, position: 'relative' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  toolTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toolDesc: { fontSize: 12 },
  notificationBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FF3B30', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  badgeNumber: { color: '#FFF', fontSize: 11, fontWeight: '800' },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  settingsContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderWidth: 1 },
  modalTopBar: { width: 40, height: 5, backgroundColor: '#CCC', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  settingsTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  settingsText: { fontSize: 16, fontWeight: '600', marginLeft: 16 },
  settingsDivider: { height: 1, marginVertical: 8, opacity: 0.5 }
});
