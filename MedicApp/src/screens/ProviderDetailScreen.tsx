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
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
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

const OpenStreetMap = ({ latitude, longitude, markerText = '' }) => {
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
      style={{ height: 250 }}
    />
  );
};

export default function ProviderDetailScreen() {
  const route = useRoute();
  const { prestataire } = route.params as { prestataire: Prestataire };
  const { width } = Dimensions.get('window');
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  if (!prestataire || Object.keys(prestataire).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Aucun prestataire sélectionné</Text>
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
      return <Text style={styles.noPhotosText}>Aucune photo disponible</Text>;
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {prestataire.photos.map((photoUrl, index) => (
          <Image
            key={`photo-${index}`}
            source={{ uri: `${BASE_URL}/uploads/${photoUrl}` }}
            style={[styles.photo, { width: width * 0.8 }]}
            resizeMode="cover"
            onLoadStart={() => setLoadingPhotos(true)}
            onLoadEnd={() => setLoadingPhotos(false)}
            onError={() => {
              console.warn('Failed to load image');
              setLoadingPhotos(false);
            }}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{prestataire.nom || 'Nom non disponible'}</Text>

        <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.9}>
          <View style={styles.mapContainer}>
            <OpenStreetMap
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              markerText={prestataire.nom}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="category" size={24} color="#0077b6" />
            <Text style={styles.infoText}>{prestataire.categorie || 'Non spécifiée'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={24} color="#0077b6" />
            <Text style={styles.infoText}>{prestataire.prestations || 'Non spécifiées'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-city" size={24} color="#0077b6" />
            <Text style={styles.infoText}>{prestataire.ville || 'Non spécifiée'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={24} color="#0077b6" />
            <Text style={styles.infoText}>{prestataire.adresse || 'Non fournie'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={24} color="#0077b6" />
            <TouchableOpacity onPress={handleCall}>
              <Text style={[styles.infoText, styles.clickableText]}>
                {prestataire.telephone || 'Non fourni'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Galerie Photo</Text>
        {loadingPhotos && <ActivityIndicator size="small" color="#0077b6" />}
        {renderPhotos()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 80,
    color: '#0077b6',
    textAlign: 'center',
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  infoContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
    flexShrink: 1,
  },
  clickableText: {
    color: '#0077b6',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 20,
    color: '#0077b6',
  },
  photo: {
    height: 200,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  noPhotosText: {
    textAlign: 'center',
    margin: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});
