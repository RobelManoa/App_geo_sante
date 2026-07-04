import AsyncStorage from '@react-native-async-storage/async-storage';

// expo-secure-store n'a pas d'implémentation web ; on retombe sur AsyncStorage,
// déjà utilisé pour le reste de la session côté web. Pas de régression par
// rapport à l'existant — la carte vivante (le seul usage vraiment sensible de
// ce module) reste de toute façon native-only, voir CarteScreen.
export async function setItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function deleteItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
