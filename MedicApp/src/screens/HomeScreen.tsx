import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './HomeScreen.styles';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />    

      <Text style={styles.title}>MedicApp</Text>
      <Text style={styles.subtitle}>Trouvez rapidement un prestataire de soins à Madagascar</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('Recherche')}
        >
          <Text style={styles.buttonText}>🔍 Rechercher un prestataire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Carte')}
        >
          <Text style={styles.buttonText}>🗺️ Voir la carte interactive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.languageSwitch}>
        <Text style={styles.langLabel}>Langue :</Text>
        <TouchableOpacity style={styles.langButton}>
          <Text style={styles.langText}>Français</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langButton}>
          <Text style={styles.langText}>Malagasy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
