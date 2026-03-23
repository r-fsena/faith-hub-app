import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function DonateScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Doação</ThemedText>
      <ThemedText style={styles.subtitle}>Contribua com dízimos e projetos da igreja.</ThemedText>
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
