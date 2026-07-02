import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config/config';
import { WebView } from 'react-native-webview';

interface Prestataire {
  _id: string;
  nom: string;
  categorie?: string;
  prestations?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  localisation?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
}

const OpenStreetMap = ({ 
  latitude, 
  longitude, 
  markerText = '' 
}: {
  latitude: number;
  longitude: number;
  markerText?: string;
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body { margin:0; padding:0; }
          #map { height:100vh; width:100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
          const marker = L.marker([${latitude}, ${longitude}]).addTo(map);
          ${markerText ? `marker.bindPopup('${markerText.replace(/'/g, "\\'")}').openPopup();` : ''}
          map.scrollWheelZoom.disable();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      style={{ height: 280 }}
    />
  );
};

// Composant pour les boutons d'action
const ActionButton = ({ 
  icon, 
  title, 
  onPress, 
  color = "#6366f1",
  disabled = false 
}: {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: disabled ? '#e5e7eb' : color },
          disabled && styles.actionButtonDisabled
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={disabled ? '#9ca3af' : '#fff'} 
        />
        <Text style={[
          styles.actionButtonText,
          disabled && styles.actionButtonTextDisabled
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProviderDetailScreen() {
  const route = useRoute();
  const { prestataire } = route.params as { prestataire: Prestataire };
  const { width } = Dimensions.get('window');
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  if (!prestataire || Object.keys(prestataire).length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Aucun prestataire sélectionné</Text>
          <Text style={styles.errorSubtitle}>
            Veuillez sélectionner un prestataire depuis la liste
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const coordinates = prestataire.localisation || {
    latitude: -18.8792,
    longitude: 47.5079,
  };

  const handleCall = () => {
    if (!prestataire.telephone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
      return;
    }
    Linking.openURL(`tel:${prestataire.telephone}`).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
    });
  };

  const handleOpenMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
    ).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie");
    });
  };

  const renderPhotos = () => {
    if (!prestataire.photos || prestataire.photos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="images-outline" size={48} color="#9ca3af" />
          <Text style={styles.noPhotosText}>Aucune photo disponible</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosContainer}
      >
        {prestataire.photos.map((photoUrl, index) => (
          <View key={`photo-${index}`} style={styles.photoWrapper}>
            <Image
              source={{ uri: `${BASE_URL}/uploads/${photoUrl}` }}
              style={styles.photo}
              resizeMode="cover"
              onLoadStart={() => setLoadingPhotos(true)}
              onLoadEnd={() => setLoadingPhotos(false)}
              onError={() => {
                console.warn('Failed to load image');
                setLoadingPhotos(false);
              }}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec titre */}
        <View style={styles.header}>
          <Text style={styles.title}>{prestataire.nom || 'Nom non disponible'}</Text>
          <Text style={styles.subtitle}>{prestataire.categorie || 'Catégorie non spécifiée'}</Text>
        </View>

        {/* Carte interactive */}
        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.9}>
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <MaterialIcons name="map" size={20} color="#6366f1" />
              <Text style={styles.mapHeaderText}>Localisation</Text>
            </View>
            <OpenStreetMap
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              markerText={prestataire.nom}
            />
          </View>
        </TouchableOpacity>

        {/* Informations du prestataire */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="category" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Catégorie</Text>
              <Text style={styles.infoText}>{prestataire.categorie || 'Non spécifiée'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="medical-services" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Prestations</Text>
              <Text style={styles.infoText}>{prestataire.prestations || 'Non spécifiées'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="location-city" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoText}>{prestataire.ville || 'Non spécifiée'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="place" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Adresse</Text>
              <Text style={styles.infoText}>{prestataire.adresse || 'Non fournie'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="phone" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.infoText, styles.clickableText]}>
                  {prestataire.telephone || 'Non fourni'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon="call"
            title="Appeler"
            onPress={handleCall}
            disabled={!prestataire.telephone}
          />
          <ActionButton
            icon="navigate"
            title="Itinéraire"
            onPress={handleOpenMaps}
            color="#10b981"
          />
        </View>

        {/* Galerie photos */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Galerie Photo</Text>
          {loadingPhotos && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          )}
          {renderPhotos()}
        </View>

        {/* Espace en bas pour éviter l'écrasement par la barre de navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Espace pour la barre de navigation
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  mapContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mapHeaderText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  clickableText: {
    color: '#6366f1',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  photosSection: {
    marginHorizontal: 20,
  },
  photosContainer: {
    paddingHorizontal: 5,
  },
  photoWrapper: {
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: Dimensions.get('window').width * 0.7,
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  noPhotosContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  noPhotosText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
