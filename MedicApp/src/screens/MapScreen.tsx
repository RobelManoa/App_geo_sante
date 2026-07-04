import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  SafeAreaView,
  Platform,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import CrossPlatformWebView from '../components/CrossPlatformWebView';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../utils/CrossPlatformAlert';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import api from '../api/api';

type RootStackParamList = {
  Fiche: { prestataire: Prestataire };
};

type MapScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Fiche"
>;

interface Prestataire {
  _id: string;
  nom: string;
  categorie?: string;
  prestations?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  localisation: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrestataire, setSelectedPrestataire] = useState<Prestataire | null>(null);

  useEffect(() => {
    const fetchPrestataires = async () => {
      try {
        setLoading(true);
        const response = await api.get('/');
        const valid = Array.isArray(response.data)
          ? response.data.filter(p => p.localisation?.latitude && p.localisation?.longitude)
          : [];
        setPrestataires(valid);
      } catch (err) {
        console.error('Erreur de chargement des prestataires :', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchPrestataires();
  }, []);

  const handleMarkerClick = (prestataire: Prestataire) => {
    setSelectedPrestataire(prestataire);
  };

  const handleViewDetails = () => {
    if (selectedPrestataire) {
      navigation.navigate("Fiche", { prestataire: selectedPrestataire });
    }
  };

  const handleCall = () => {
    if (selectedPrestataire?.telephone) {
      // Utiliser Linking pour appeler
      const { Linking } = require('react-native');
      Linking.openURL(`tel:${selectedPrestataire.telephone}`).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
      });
    } else {
      Alert.alert("Erreur", "Numéro de téléphone non disponible");
    }
  };

  const handleDirections = () => {
    if (selectedPrestataire?.localisation) {
      const { Linking } = require('react-native');
      const { latitude, longitude } = selectedPrestataire.localisation;
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      ).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie");
      });
    }
  };

  // Générer le HTML pour la carte avec tous les marqueurs
  const generateMapHTML = () => {
    const markers = prestataires.map((prestataire, index) => {
      const { latitude, longitude } = prestataire.localisation;
      const escapedName = prestataire.nom.replace(/'/g, "\\'").replace(/"/g, '\\"');
      const escapedCategorie = (prestataire.categorie || 'Non spécifiée').replace(/'/g, "\\'").replace(/"/g, '\\"');
      const escapedVille = (prestataire.ville || 'Non spécifiée').replace(/'/g, "\\'").replace(/"/g, '\\"');
      
      return `
        const marker${index} = L.marker([${latitude}, ${longitude}]).addTo(map);
        marker${index}.bindPopup(\`
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${escapedName}</h3>
          <p style="margin: 4px 0; color: #6366f1; font-size: 14px; font-weight: 600;">${escapedCategorie}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">📍 ${escapedVille}</p>
          <div style="margin-top: 12px;">
            <button onclick="selectPrestataire('${prestataire._id}')" style="
              background: #6366f1; 
              color: white; 
              border: none; 
              padding: 8px 12px; 
              border-radius: 6px; 
              font-size: 12px; 
              cursor: pointer;
              margin-right: 8px;
            ">Voir détails</button>
          </div>
        </div>
        \`);
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100%; }
            .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .leaflet-popup-content {
              margin: 12px;
              font-family: Arial, sans-serif;
            }
            .leaflet-popup-tip {
              background: white;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <script>
            const map = L.map('map').setView([-18.8792, 47.5079], 10);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);

            ${markers}

            function selectPrestataire(prestataireId) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SELECT_PRESTATAIRE',
                prestataireId: prestataireId
              }));
            }

            // Désactiver le zoom sur scroll pour éviter les conflits
            map.scrollWheelZoom.disable();
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PRESTATAIRE') {
        const prestataire = prestataires.find(p => p._id === data.prestataireId);
        if (prestataire) {
          setSelectedPrestataire(prestataire);
        }
      }
    } catch (error) {
      console.error('Erreur parsing message WebView:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carte des prestataires</Text>
        <Text style={styles.subtitle}>
          {prestataires.length} prestataire{prestataires.length > 1 ? 's' : ''} trouvé{prestataires.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <CrossPlatformWebView
          source={{ html: generateMapHTML() }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleWebViewMessage}
          style={styles.map}
        />
      </View>

      {/* Panneau de détails du prestataire sélectionné */}
      {selectedPrestataire && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsContent}>
              <Text style={styles.prestataireName}>{selectedPrestataire.nom}</Text>
              <Text style={styles.prestataireInfo}>
                {selectedPrestataire.categorie || 'Non spécifiée'} • {selectedPrestataire.ville || 'Non spécifiée'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedPrestataire(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewDetails}
            >
              <Ionicons name="information-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Détails</Text>
            </TouchableOpacity>
            
            {selectedPrestataire.telephone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 20,
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
  detailsPanel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100, // Espace pour la barre de navigation
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsContent: {
    flex: 1,
  },
  prestataireName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  prestataireInfo: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
