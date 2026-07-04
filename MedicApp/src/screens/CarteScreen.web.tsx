import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// La carte vivante (QR dynamique + verrou PIN chiffré) est native uniquement :
// expo-secure-store n'a pas d'équivalent web fiable, et un onglet de navigateur
// n'a pas vocation à être présenté comme pièce d'identité à un guichet.
// Voir le plan de la carte d'assuré numérique pour le détail de ce choix.
export default function CarteScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma carte d'assuré</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Ionicons name="phone-portrait-outline" size={64} color="#6366f1" />
        <Text style={styles.title}>Disponible sur l'application mobile</Text>
        <Text style={styles.subtitle}>
          Votre carte d'assuré numérique (QR dynamique) est réservée à l'application
          mobile MedicApp, verrouillée par un code PIN sur votre appareil. Installez
          l'app sur votre téléphone pour y accéder.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
