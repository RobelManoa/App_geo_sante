import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, []);

  const handleButtonPress = (route: string) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(route as never);
    });
  };

  const openITConceptorWebsite = () => {
    Linking.openURL('https://www.itconceptor.com/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec logo */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.mainLogo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>MedicApp</Text>
            <Text style={styles.appSubtitle}>
              Votre compagnon santé à Madagascar
            </Text>
          </View>
        </Animated.View>

        {/* Section de présentation */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>À propos de MedicApp</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              MedicApp est votre application de référence pour trouver rapidement 
              des prestataires de soins à Madagascar. Géolocalisation précise, 
              informations détaillées et interface intuitive pour une expérience 
              de santé optimale.
            </Text>
          </View>
        </Animated.View>

        {/* Boutons d'action principaux */}
        <Animated.View 
          style={[
            styles.actionSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleButtonPress('Recherche')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>
              Rechercher un prestataire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleButtonPress('Carte')}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={24} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>
              Voir la carte interactive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => handleButtonPress('Chat')}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={24} color="#6366f1" />
            <Text style={styles.tertiaryButtonText}>
              Assistant médical IA
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Section fonctionnalités */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Fonctionnalités</Text>
          </View>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="location" size={32} color="#6366f1" />
              <Text style={styles.featureTitle}>Géolocalisation</Text>
              <Text style={styles.featureText}>
                Trouvez les prestataires les plus proches
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="information-circle" size={32} color="#6366f1" />
              <Text style={styles.featureTitle}>Informations détaillées</Text>
              <Text style={styles.featureText}>
                Horaires, spécialités, contacts
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="chatbubble-ellipses" size={32} color="#6366f1" />
              <Text style={styles.featureTitle}>Assistant IA</Text>
              <Text style={styles.featureText}>
                Conseils médicaux personnalisés
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={32} color="#6366f1" />
              <Text style={styles.featureTitle}>Sécurisé</Text>
              <Text style={styles.featureText}>
                Données protégées et fiables
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Section ITConceptor */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Développé par</Text>
          </View>
          <TouchableOpacity 
            style={styles.developerCard}
            onPress={openITConceptorWebsite}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/locosociete.png')}
              style={styles.developerLogo}
              resizeMode="contain"
            />
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>ITConceptor Agency</Text>
              <Text style={styles.developerDescription}>
                Agence de développement web et mobile innovante, spécialisée 
                dans la création d'applications modernes et performantes.
              </Text>
              <View style={styles.developerLink}>
                <Ionicons name="globe" size={16} color="#6366f1" />
                <Text style={styles.developerLinkText}>www.itconceptor.com</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer avec copyright */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.copyrightText}>
            © 2024 MedicApp. Tous droits réservés.
          </Text>
          <Text style={styles.developerCopyright}>
            Développé par{' '}
            <Text style={styles.developerLinkText} onPress={openITConceptorWebsite}>
              ITConceptor Agency
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainLogo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'justify',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  tertiaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 64) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  developerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  developerLogo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  developerDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  developerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  developerLinkText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  copyrightText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  developerCopyright: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 80,
  },
});
