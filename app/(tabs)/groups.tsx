import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function GroupsScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Pequenos Grupos</ThemedText>
      <ThemedText style={styles.subtitle}>Encontre uma célula perto de você.</ThemedText>
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
