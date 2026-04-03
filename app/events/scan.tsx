import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EventScannerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const user = await getCurrentUser();
      if (user?.userId) {
         const userRes = await fetch(`${baseUrl}/members/${user.userId}`);
         if (userRes.ok) {
            const userData = await userRes.json();
            setUserRole(userData.data?.role || 'MEMBER');
         }
      }
    } catch(e){}
  };

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    setIsProcessing(true);

    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      const res = await fetch(`${baseUrl}/tickets/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ token: data })
      });

      const json = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso!", json.message || "Voucher Validado.", [{ text: "Próximo", onPress: () => setScanned(false) }]);
      } else {
        Alert.alert("Erro de Validação", json.message || "Tentativa rejeitada.", [{ text: "Tentar outro", onPress: () => setScanned(false) }]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Erro Conexão", "Não foi possível bater com a base de dados.", [{ text: "Voltar", onPress: () => setScanned(false) }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (userRole === 'MEMBER') {
     return (
       <View style={[styles.container, { backgroundColor: '#11181C', justifyContent: 'center' }]}>
         <Feather name="lock" size={48} color="#FF9500" style={{ alignSelf: 'center', marginBottom: 16 }} />
         <Text style={styles.infoText}>Acesso Restrito a Administradores da Recepção.</Text>
         <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
           <Text style={styles.btnText}>Voltar</Text>
         </TouchableOpacity>
       </View>
     );
  }

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: '#11181C', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#5bc3bb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: '#11181C', justifyContent: 'center' }]}>
        <Feather name="camera-off" size={48} color="#FF3B30" style={{ alignSelf: 'center', marginBottom: 16 }} />
        <Text style={styles.infoText}>Sem acesso à câmera.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validar QR Code</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned || isProcessing ? undefined : handleBarCodeScanned}
        />
        
        {/* Máscara Quadrada do Scanner */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer} />
            <View style={styles.focusedContainer}>
              {/* Molduras dos cantos */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.unfocusedContainer} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>
      </View>

      <View style={styles.footer}>
        <Feather name="maximize" size={24} color="#5bc3bb" style={{ marginBottom: 12 }} />
        <Text style={styles.footerText}>Aponte a câmera para o Ingresso/Voucher dentro do retângulo central para check-in.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 50, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  infoText: { color: '#FFF', textAlign: 'center', fontSize: 16, marginBottom: 20 },
  btn: { backgroundColor: '#5bc3bb', paddingHorizontal: 30, paddingVertical: 14, alignSelf: 'center', borderRadius: 12 },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },

  cameraWrapper: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  middleContainer: { flexDirection: 'row', flex: 1.5 },
  focusedContainer: { flex: 2.5, position: 'relative' },
  
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#5bc3bb' },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 30, paddingBottom: Platform.OS === 'ios' ? 50 : 30, backgroundColor: '#11181C', alignItems: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  footerText: { color: '#A0A0A0', textAlign: 'center', lineHeight: 22, fontSize: 14 }
});
