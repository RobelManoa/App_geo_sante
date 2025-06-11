import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../api/api'; 

interface Prestataire {
  _id: string;
  nom: string;
  localisation: {
    latitude: number;
    longitude: number;
  };
}

export default function MapScreen() {
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrestataires = async () => {
      try {
        const response = await api.get('/prestataires');
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0077b6" />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -18.8792,
            longitude: 47.5079,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          {prestataires.map((prestataire) => (
            <Marker
              key={prestataire._id}
              coordinate={{
                latitude: prestataire.localisation.latitude,
                longitude: prestataire.localisation.longitude,
              }}
              title={prestataire.nom}
              description={prestataire._id}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
