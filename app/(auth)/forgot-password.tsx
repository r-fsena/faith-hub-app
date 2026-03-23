import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { resetPassword, confirmResetPassword } = useAuth();

  const handleRequestCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Erro', 'Por favor, insira seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setStep(2);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao enviar o código de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, insira o código recebido.');
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha a nova senha e a confirmação.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    
    setLoading(true);
    try {
      await confirmResetPassword(trimmedEmail, trimmedCode, newPassword);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        { text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#2c3444' : '#f1f1f1';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#f1f1f1' : '#2c3444';
  const placeholderColor = isDark ? '#8c949c' : '#747c86';
  const primaryBrandColor = '#5bc3bb';
  const buttonTextColor = '#FFFFFF';
  
  const footerLogo = isDark 
    ? require('../../assets/images/Transparent Logo.png')
    : require('../../assets/images/Original Logo.png');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/Original Logo Symbol.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={styles.title}>
            {step === 1 && 'Recuperar Senha'}
            {step === 2 && 'Validar Código'}
            {step === 3 && 'Nova Senha'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {step === 1 && 'Informe seu e-mail para receber um código de recuperação.'}
            {step === 2 && 'Digite o código de 6 dígitos enviado para seu e-mail.'}
            {step === 3 && 'Digite sua nova senha e confirme para redefinir o acesso.'}
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          {step === 1 && (
            <>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Feather name="mail" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Digite seu e-mail"
                  placeholderTextColor={placeholderColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryBrandColor, marginTop: 16 }]}
                onPress={handleRequestCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={buttonTextColor} />
                ) : (
                  <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Enviar Código</ThemedText>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Feather name="shield" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Código numérico"
                  placeholderTextColor={placeholderColor}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryBrandColor, marginTop: 16 }]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Continuar</ThemedText>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <View style={[styles.inputContainer, { backgroundColor: inputBg, marginBottom: 14 }]}>
                <Feather name="lock" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Sua nova senha"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                  <Feather name={showNewPassword ? "eye" : "eye-off"} size={20} color={placeholderColor} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
                <Feather name="lock" size={20} color={placeholderColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color={placeholderColor} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: primaryBrandColor, marginTop: 16 }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={buttonTextColor} />
                ) : (
                  <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Alterar Senha</ThemedText>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else router.back();
            }}
          >
            <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.creditContainer}>
          <ThemedText style={styles.creditText}>Desenvolvido por</ThemedText>
          <Image
            source={footerLogo}
            style={styles.creditLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerTextContainer: {
    width: '100%',
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  eyeButton: {
    padding: 8,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
  },
  creditContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
    paddingBottom: 10,
  },
  creditText: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 8,
  },
  creditLogo: {
    width: 90,
    height: 28,
  },
});
