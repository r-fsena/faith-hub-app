import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { APP_CONFIG } from '@/constants/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export default function GroupsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [myGroupId, setMyGroupId] = useState<string | null>(null);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Visão pode ser 'portal' (dentro do próprio grupo) ou 'discover' (explorando outros)
  const [viewMode, setViewMode] = useState<'portal' | 'discover'>('discover');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // O cache de AsyncStorage não é mais confiável do que a API
      // Vamos usar os dados reais do banco de dados na etapa 2!

      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      
      // 1. Fetch all cell groups
      const groupsRes = await fetch(`${baseUrl}/cell-groups?t=${Date.now()}`);
      if (groupsRes.ok) {
        const groupsJson = await groupsRes.json();
        setAvailableGroups(groupsJson);
      }

      // 2. Fetch logged user profile to find their cell mapping
      try {
        const user = await getCurrentUser();
        if (user?.userId) {
          const userRes = await fetch(`${baseUrl}/members/${user.userId}?t=${Date.now()}`);
          if (userRes.ok) {
             const userData = await userRes.json();
             const userCell = userData.data?.cell_group_id;
             const userPending = userData.data?.pending_cell_group_id;
             
             if (userCell) {
               setMyGroupId(userCell);
               setViewMode('portal');
               setPendingGroupId(null);
             } else if (userPending) {
               setMyGroupId(null);
               setPendingGroupId(userPending);
               setViewMode('discover');
             } else {
               setMyGroupId(null);
               setPendingGroupId(null);
               setViewMode('discover');
             }
             // Limpeza final do cache fantasma que estava travando testadores
             await AsyncStorage.removeItem('pendingGroupId');
          }
        }
      } catch (e) {
         console.log(e);
      }
    } catch (err) {
      console.log('Error pulling groups', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRequestJoin = async (id: string) => {
    // Dispara a API para gravar a intenção real no BD da plataforma primeiro
    try {
      const user = await getCurrentUser();
      if (user?.userId) {
        const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/members/${user.userId}/request-cell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cellGroupId: id })
        });
        
        if (response.ok) {
           setPendingGroupId(id);
           // Não precisamos mais usar AsyncStorage! O banco guardou!
        } else {
           console.log("Erro interno ao solicitar.", await response.text());
        }
      }
    } catch (err) {
      console.log('Erro ao solicitar célula', err);
    }
  };

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
      <Text style={[styles.sectionSubtitle, { color: textMuted, marginTop: 4 }]}>
        Veja todas as opções na nossa igreja, por bairro, liderança e perfil!
      </Text>

      {availableGroups.map((group) => {
        const isMyGroup = myGroupId === group.id;
        const isPending = pendingGroupId === group.id;

        return (
          <View key={group.id} style={[styles.groupCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.groupCardHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.groupName, { color: textColor }]}>{group.name}</Text>
                <Text style={[styles.groupLeader, { color: textMuted }]}>
                  Líder: {group.leader_name || 'A definir'}
                </Text>
              </View>
              {group.focus && (
                <View style={[styles.tag, { backgroundColor: isDark ? '#333' : '#f0f0f0', maxWidth: 100 }]}>
                  <Text style={[styles.tagText, { color: textMuted }]} numberOfLines={1}>{group.focus}</Text>
                </View>
              )}
            </View>
            <View style={styles.groupInfoRow}>
              <Feather name="calendar" size={14} color={accentColor} />
              <Text style={[styles.groupInfoText, { color: textColor }]}>{group.meeting_day || 'Dia a combinar'} às {group.meeting_time || '--'}</Text>
            </View>
            <View style={styles.groupInfoRow}>
              <Feather name="map-pin" size={14} color={accentColor} />
              <Text style={[styles.groupInfoText, { color: textColor }]}>Bairro: {group.neighborhood || 'Local Principal'}</Text>
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
                onPress={() => handleRequestJoin(group.id)}
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
              <Text style={styles.heroPreTitle}>{termSingular.toUpperCase()} {myGroupData?.name?.split(' ')[0]}</Text>
              <Text style={styles.heroTitle}>{myGroupData?.name}</Text>
            </View>
            <View style={styles.avatarGroup}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarMain} />
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.avatarSecondary} />
            </View>
          </View>
          <Text style={styles.heroParam}>Liderança: {myGroupData?.leader_name || 'Sede'}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroInfoRow}>
            <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroInfoText}>{myGroupData?.meeting_day} às {myGroupData?.meeting_time}</Text>
          </View>
          <View style={styles.heroInfoRow}>
            <Feather name="map-pin" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroInfoText}>{myGroupData?.address || 'Igreja / Base'} - {myGroupData?.neighborhood}</Text>
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

          <TouchableOpacity 
            style={[styles.toolCard, { backgroundColor: cardColor, borderColor }]}
            onPress={() => router.push('/groups/snacks')}
          >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                <Feather name="coffee" size={24} color="#FF3B30" />
              </View>
              <Text style={[styles.toolTitle, { color: textColor }]}>Partilha</Text>
              <Text style={[styles.toolDesc, { color: textMuted }]}>Gerenciar Lanches</Text>
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
          <Text style={[styles.headerTitle, { color: textColor }]}>Explorar {termPlural}</Text>
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
        {viewMode === 'discover' && (
          <TouchableOpacity style={[styles.headerBtn, { padding: 4 }]} onPress={onRefresh} disabled={refreshing}>
            <Feather name="refresh-cw" size={24} color={refreshing ? textMuted : accentColor} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
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
      {/* Global Loading Overlay */}
      {refreshing && (
        <Modal transparent={true} animationType="fade" visible={refreshing}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: cardColor, padding: 30, borderRadius: 16, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: textColor }}>Sincronizando...</Text>
            </View>
          </View>
        </Modal>
      )}

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
