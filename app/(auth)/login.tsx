import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Link as ExpoLink, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { signIn, federatedSignIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      alert(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    try {
      await federatedSignIn(provider);
    } catch (error) {
      console.error(error);
    }
  };

  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#2c3444' : '#f1f1f1';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#f1f1f1' : '#2c3444';
  const placeholderColor = isDark ? '#8c949c' : '#747c86';
  
  // Primary brand color based on the logo (adjust if the true hex is different)
  const primaryBrandColor = '#5bc3bb'; 
  const buttonTextColor = '#FFFFFF';
  
  // Decide the best footer logo based on dark/light mode
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
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/Original Logo Symbol.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.headerTextContainer}>
          <ThemedText type="title" style={styles.title}>Bem-vindo</ThemedText>
          <ThemedText style={styles.subtitle}>Conecte-se com a nossa família e continue sua jornada de fé.</ThemedText>
        </View>

        <View style={styles.formContainer}>
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

          <View style={[styles.inputContainer, { backgroundColor: inputBg, marginBottom: 8 }]}>
            <Feather name="lock" size={20} color={placeholderColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Sua senha secreta"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={{ padding: 8 }}
              activeOpacity={0.7}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={placeholderColor} />
            </TouchableOpacity>
          </View>

          <ExpoLink href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.forgotPasswordText}>Esqueci minha senha</ThemedText>
            </TouchableOpacity>
          </ExpoLink>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: primaryBrandColor }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={buttonTextColor} />
            ) : (
              <ThemedText style={[styles.primaryButtonText, { color: buttonTextColor }]}>Acessar Comunidade</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#EAEAEA' }]} />
            <ThemedText style={styles.dividerText}>ou continuar com</ThemedText>
            <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#EAEAEA' }]} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#EAEAEA', borderWidth: 1 }]}
              onPress={() => handleSocialLogin('Google')}
            >
              <FontAwesome name="google" size={20} color={isDark ? '#FFFFFF' : '#DB4437'} />
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                onPress={() => handleSocialLogin('Apple')}
              >
                <FontAwesome name="apple" size={22} color={isDark ? '#000000' : '#FFFFFF'} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>Ainda não faz parte? </ThemedText>
            <ExpoLink href="/(auth)/register" asChild>
              <TouchableOpacity>
                <ThemedText style={styles.footerLink}>Tornar-se Membro</ThemedText>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    opacity: 0.4,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 36,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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



