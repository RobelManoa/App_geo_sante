import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PinGate from '../components/PinGate';
import { fetchCarteToken } from '../api/carte';
import Alert from '../utils/CrossPlatformAlert';

interface User {
  _id: string;
  nom: string;
  prenom: string;
  societe: string;
  fonction: string;
  numeroCarte?: string;
  carteValideJusquau?: string;
  photo?: string;
}

const TOKEN_TTL_SECONDS = 60;
const REFRESH_MARGIN_MS = 15000;

function CarteContent() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL_SECONDS);

  const loadToken = useCallback(async () => {
    try {
      const result = await fetchCarteToken();
      setToken(result.token);
      setExpiresAt(new Date(result.expiresAt).getTime());
    } catch (err) {
      Alert.alert('Erreur', "Impossible de générer votre carte pour l'instant. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    })();
    loadToken();
  }, [loadToken]);

  // Rafraîchit visuellement le compte à rebours chaque seconde
  useEffect(() => {
    if (!expiresAt) return;
    const tick = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(tick);
  }, [expiresAt]);

  // Redemande un jeton un peu avant l'expiration du précédent
  useEffect(() => {
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - REFRESH_MARGIN_MS, 1000);
    const refresh = setTimeout(loadToken, delay);
    return () => clearTimeout(refresh);
  }, [expiresAt, loadToken]);

  const progress = Math.max(0, Math.min(1, secondsLeft / TOKEN_TTL_SECONDS));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma carte d'assuré</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.card}>
        <View style={styles.identityRow}>
          <Image
            source={user?.photo ? { uri: user.photo } : require('../../assets/users.png')}
            style={styles.avatar}
          />
          <View style={styles.identityInfo}>
            <Text style={styles.name}>{user ? `${user.nom} ${user.prenom}` : '—'}</Text>
            <Text style={styles.societe}>{user?.societe || '—'}</Text>
            <Text style={styles.fonction}>{user?.fonction || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>N° de carte</Text>
          <Text style={styles.infoValue}>{user?.numeroCarte || '—'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Validité</Text>
          <Text style={styles.infoValue}>
            {user?.carteValideJusquau
              ? new Date(user.carteValideJusquau).toLocaleDateString('fr-FR')
              : 'Non renseignée'}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          {loading && !token ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : token ? (
            <QRCode value={token} size={200} backgroundColor="#fff" color="#1f2937" />
          ) : (
            <TouchableOpacity onPress={loadToken} style={styles.retryButton}>
              <Ionicons name="refresh" size={20} color="#6366f1" />
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          )}
        </View>

        {token && (
          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Se renouvelle dans {secondsLeft}s — ce QR devient inutilisable après ce délai
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.footnote}>
        Présentez ce QR à un prestataire du réseau pour bénéficier du tiers payant.
      </Text>
    </SafeAreaView>
  );
}

export default function CarteScreen() {
  return (
    <PinGate>
      <CarteContent />
    </PinGate>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  identityInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  societe: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 2,
  },
  fonction: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 220,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  progressWrapper: {
    marginTop: 16,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  footnote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
});
