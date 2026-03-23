import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function MenuScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Menu da Igreja</ThemedText>
      <ThemedText style={styles.subtitle}>Oração, Check-in de Visitantes, e Mais.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
