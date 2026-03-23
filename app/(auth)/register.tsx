import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Link as ExpoLink, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptLGPD, setAcceptLGPD] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States to handle Confirmation Code step
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState('');

  const colorScheme = useColorScheme();
  const { signUp, confirmSignUp } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !phone || !birthDate) {
      alert('Por favor, preencha todos os campos do formulário basico!');
      return;
    }
    if (!acceptLGPD) {
      alert('Você precisa aceitar os termos de comunicação para criar a conta.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, email); // username=email
      // Aqui num cenário real também salvaríamos phone, address, e birthDate no banco de usuários
      setConfirming(true);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code) {
      alert('Preencha o código enviado para o seu e-mail.');
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      alert('Conta criada com sucesso! Faça o login.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      alert(error.message || 'Erro ao confirmar a conta');
    } finally {
      setLoading(false);
    }
  };

  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#2c3444' : '#f1f1f1';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#f1f1f1' : '#2c3444';
  const placeholderColor = isDark ? '#8c949c' : '#747c86';
  const textMuted = isDark ? '#8c949c' : '#747c86';
  
  // Primary brand color mapped to the app identity
  const primaryBrandColor = '#5bc3bb';
  const buttonTextColor = '#FFFFFF';

  const footerLogo = isDark 
    ? require('../../assets/images/Transparent Logo.png') 
    : require('../../assets/images/Original Logo.png');

  if (confirming) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, justifyContent: 'center' }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/Original Logo Symbol.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        <ThemedText style={styles.title}>Confirmar E-mail</ThemedText>
        <ThemedText style={[styles.subtitle, { marginBottom: 32 }]}>
          Enviamos um código para {email}. Digite-o abaixo.
        </ThemedText>
        
        <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
          <Feather name="mail" size={20} color={placeholderColor} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Código de Confirmação"
            placeholderTextColor={placeholderColor}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: primaryBrandColor }]} onPress={handleConfirm} disabled={loading}>
          {loading ? <ActivityIndicator color={buttonTextColor} /> : <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Verificar Código</ThemedText>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardView, { backgroundColor: bgColor }]}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <ExpoLink href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Feather name="chevron-left" size={24} color={textColor} />
            </TouchableOpacity>
          </ExpoLink>
          <View style={styles.logoTitleContainer}>
            <View style={styles.logoSmallWrapper}>
              <Image
                source={require('../../assets/images/Original Logo Symbol.png')}
                style={styles.logoSmall}
                resizeMode="cover"
              />
            </View>
            <ThemedText type="title" style={styles.title}>Tornar-se Membro</ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>Faça parte da nossa família e caminhe conosco.</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Feather name="user" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Nome Completo"
              placeholderTextColor={placeholderColor}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Feather name="mail" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="E-mail"
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Feather name="phone" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Telefone (WhatsApp)"
              placeholderTextColor={placeholderColor}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Feather name="calendar" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Data de Nascimento (dd/mm/aaaa)"
              placeholderTextColor={placeholderColor}
              keyboardType="number-pad"
              value={birthDate}
              onChangeText={setBirthDate}
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
            <Feather name="lock" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Crie uma Senha"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              activeOpacity={0.7}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={placeholderColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            activeOpacity={0.8} 
            onPress={() => setAcceptLGPD(!acceptLGPD)}
          >
            <View style={[styles.checkbox, acceptLGPD && { backgroundColor: primaryBrandColor, borderColor: primaryBrandColor }]}>
              {acceptLGPD && <Feather name="check" size={14} color="#FFF" />}
            </View>
            <ThemedText style={[styles.checkboxLabel, { color: textMuted }]}>
              Aceito receber comunicações sobre eventos, conteúdos e avisos importantes (LGPD).
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: primaryBrandColor, marginTop: 8 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={buttonTextColor} />
            ) : (
              <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Finalizar Cadastro de Membro</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>Já tem uma conta? </ThemedText>
            <ExpoLink href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.footerLink}>Entrar</ThemedText>
              </TouchableOpacity>
            </ExpoLink>
          </View>
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
  logoWrapper: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    marginBottom: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  headerContainer: {
    width: '100%',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    marginBottom: 14,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9BA1A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  logoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoSmallWrapper: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  logoSmall: {
    width: '100%',
    height: '100%',
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


