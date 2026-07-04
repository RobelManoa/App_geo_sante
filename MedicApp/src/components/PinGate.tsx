import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import * as secureStorage from '../utils/secureStorage';

const PIN_HASH_KEY = 'carte_pinHash';
const PIN_SALT_KEY = 'carte_pinSalt';
const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

async function randomSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

type Mode = 'loading' | 'create' | 'confirm' | 'enter';

const TITLES: Record<Mode, string> = {
  loading: '',
  create: 'Créez un code PIN',
  confirm: 'Confirmez votre code PIN',
  enter: 'Entrez votre code PIN',
};

const SUBTITLES: Record<Mode, string> = {
  loading: '',
  create: "Ce code protège l'accès à votre carte d'assuré sur cet appareil.",
  confirm: 'Ressaisissez le même code pour le confirmer.',
  enter: "Votre carte d'assuré est protégée par un code local.",
};

interface Props {
  children: React.ReactNode;
}

// Garde d'accès locale à la carte d'assuré : ne remplace pas une authentification
// serveur, protège uniquement contre un accès occasionnel via l'appareil déverrouillé
// de quelqu'un d'autre. Voir le plan de la carte d'assuré numérique pour le contexte.
const PinGate: React.FC<Props> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('loading');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const existingHash = await secureStorage.getItem(PIN_HASH_KEY);
      setMode(existingHash ? 'enter' : 'create');
    })();
  }, []);

  const isLocked = !!lockedUntil && Date.now() < lockedUntil;

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (pin.length !== PIN_LENGTH) {
      setError(`Le code doit contenir ${PIN_LENGTH} chiffres.`);
      return;
    }

    if (mode === 'create') {
      setFirstPin(pin);
      setPin('');
      setMode('confirm');
      return;
    }

    if (mode === 'confirm') {
      if (pin !== firstPin) {
        setError('Les deux codes ne correspondent pas, recommencez.');
        setFirstPin('');
        setPin('');
        setMode('create');
        return;
      }
      const salt = await randomSalt();
      const hash = await hashPin(pin, salt);
      await secureStorage.setItem(PIN_SALT_KEY, salt);
      await secureStorage.setItem(PIN_HASH_KEY, hash);
      setUnlocked(true);
      return;
    }

    if (isLocked) {
      return;
    }

    const salt = await secureStorage.getItem(PIN_SALT_KEY);
    const storedHash = await secureStorage.getItem(PIN_HASH_KEY);
    const candidateHash = salt ? await hashPin(pin, salt) : null;

    if (candidateHash && candidateHash === storedHash) {
      setAttempts(0);
      setUnlocked(true);
      return;
    }

    setPin('');
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (nextAttempts >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
      setError(`Trop de tentatives. Réessayez dans ${LOCKOUT_MS / 1000}s.`);
    } else {
      setError(`Code incorrect (${nextAttempts}/${MAX_ATTEMPTS}).`);
    }
  }, [pin, mode, firstPin, attempts, isLocked]);

  if (unlocked) {
    return <>{children}</>;
  }

  if (mode === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed" size={48} color="#6366f1" style={styles.icon} />
      <Text style={styles.title}>{TITLES[mode]}</Text>
      <Text style={styles.subtitle}>{SUBTITLES[mode]}</Text>

      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={PIN_LENGTH}
        autoFocus
        editable={!isLocked}
        placeholder="••••••"
        placeholderTextColor="#9ca3af"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, (isLocked || pin.length !== PIN_LENGTH) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLocked || pin.length !== PIN_LENGTH}
      >
        <Text style={styles.buttonText}>
          {mode === 'create' ? 'Continuer' : mode === 'confirm' ? 'Confirmer' : 'Déverrouiller'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
    width: '70%',
    marginBottom: 12,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '70%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PinGate;
