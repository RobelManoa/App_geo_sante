import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from "react-native-image-picker";
import stylesProfile from "./ProfileScreen.styles";
import mapConfig from "../config/mapConfig";
import Alert from "../utils/CrossPlatformAlert";
import * as secureStorage from "../utils/secureStorage";
import { SESSION_TOKEN_KEY } from "../api/carte";

interface User {
  _id: string;
  nom: string;
  prenom: string;
  identifiant: string;
  societe: string;
  fonction: string;
  niveauFonction: string;
  dateNaissance: string;
  dateArrivee: string;
  photo?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang] = useState<"fr" | "mg">("fr");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permission d'accès à la caméra",
            message: "L'application a besoin d'accéder à votre caméra pour prendre une photo de profil.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Permission d'accès aux photos",
            message: "L'application a besoin d'accéder à vos photos pour sélectionner une image de profil.",
            buttonNeutral: "Demander plus tard",
            buttonNegative: "Annuler",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert("Erreur", "Impossible d'accéder à l'image sélectionnée.");
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        uploadProfilePhoto(imageUri);
      }
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert("Permission refusée", "Nous avons besoin de votre permission pour accéder à vos photos.");
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, handleImagePickerResponse);
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission refusée", "Nous avons besoin de votre permission pour accéder à votre caméra.");
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
      saveToPhotos: true,
    };

    launchCamera(options, handleImagePickerResponse);
  };

  const uploadProfilePhoto = async (imageUri: string) => {
    setUploadingPhoto(true);
    try {
      // Simuler un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, photo: imageUri };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        Alert.alert("Succès", "Photo de profil mise à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur upload:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la photo de profil.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      "Modifier la photo de profil",
      "Choisissez une option",
      [
        {
          text: "Prendre une photo",
          onPress: takePhotoWithCamera,
        },
        {
          text: "Choisir depuis la galerie",
          onPress: pickImageFromGallery,
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!nom.trim() || !identifiant.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await axios.post(`${mapConfig.API_BASE_URL}/utilisateurs/login`, {
        nom,
        identifiant,
      });
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      await secureStorage.setItem(SESSION_TOKEN_KEY, res.data.sessionToken);
      setUser(res.data.user);
    } catch (err) {
      Alert.alert("Erreur", "Nom ou identifiant incorrect.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("user");
            await secureStorage.deleteItem(SESSION_TOKEN_KEY);
            setUser(null);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Ionicons name="person-circle" size={80} color="#6366f1" />
            <Text style={styles.loginTitle}>Connexion à MedicApp</Text>
            <Text style={styles.loginSubtitle}>
              Connectez-vous pour accéder à votre profil
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                placeholder="Nom d'utilisateur"
                value={nom}
                onChangeText={setNom}
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="key" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                placeholder="Identifiant"
                value={identifiant}
                onChangeText={setIdentifiant}
                style={styles.input}
                placeholderTextColor="#9ca3af"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Header avec photo de profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                user.photo
                  ? { uri: user.photo }
                  : require("../../assets/users.png")
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={showPhotoOptions}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.username}>
            {user.nom} {user.prenom}
          </Text>
          <Text style={styles.userRole}>{user.fonction}</Text>
          <Text style={styles.userCompany}>{user.societe}</Text>
        </View>

        {/* Carte d'assuré numérique */}
        <TouchableOpacity
          style={styles.carteButton}
          onPress={() => navigation.navigate("CarteAssure" as never)}
          activeOpacity={0.85}
        >
          <View style={styles.carteButtonIcon}>
            <Ionicons name="qr-code" size={24} color="#fff" />
          </View>
          <View style={styles.carteButtonText}>
            <Text style={styles.carteButtonTitle}>Ma carte d'assuré</Text>
            <Text style={styles.carteButtonSubtitle}>QR sécurisé pour le tiers payant</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="id-card" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Identifiant</Text>
              <Text style={styles.infoValue}>{user.identifiant}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="business" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Société</Text>
              <Text style={styles.infoValue}>{user.societe}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="briefcase" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Fonction</Text>
              <Text style={styles.infoValue}>{user.fonction}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="star" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Niveau</Text>
              <Text style={styles.infoValue}>{user.niveauFonction}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Date de naissance</Text>
              <Text style={styles.infoValue}>
                {new Date(user.dateNaissance).toLocaleDateString("fr-FR")}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#9ca3af" />
              <Text style={styles.infoLabel}>Date d'arrivée</Text>
              <Text style={styles.infoValue}>
                {new Date(user.dateArrivee).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>
          
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="language" size={16} color="#9ca3af" />
                <Text style={styles.preferenceLabel}>Langue</Text>
              </View>
              <View style={styles.langButtons}>
                <TouchableOpacity
                  onPress={() => setLang("fr")}
                  style={[
                    styles.langButton,
                    lang === "fr" && styles.langButtonActive
                  ]}
                >
                  <Text style={[
                    styles.langButtonText,
                    lang === "fr" && styles.langButtonTextActive
                  ]}>
                    Français
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLang("mg")}
                  style={[
                    styles.langButton,
                    lang === "mg" && styles.langButtonActive
                  ]}
                >
                  <Text style={[
                    styles.langButtonText,
                    lang === "mg" && styles.langButtonTextActive
                  ]}>
                    Malagasy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceInfo}>
                <Ionicons name="notifications" size={16} color="#9ca3af" />
                <Text style={styles.preferenceLabel}>Notifications</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: "#e5e7eb", true: "#6366f1" }}
                thumbColor={notifEnabled ? "#fff" : "#f3f4f6"}
              />
            </View>
          </View>
        </View>

        {/* Liens utiles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Aide et support</Text>
          </View>
          
          <View style={styles.linksCard}>
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="shield-checkmark" size={16} color="#9ca3af" />
              <Text style={styles.linkText}>Politique de confidentialité</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="help-buoy" size={16} color="#9ca3af" />
              <Text style={styles.linkText}>Centre d'aide</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkItem}>
              <Ionicons name="mail" size={16} color="#9ca3af" />
              <Text style={styles.linkText}>Nous contacter</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Espace pour la barre de navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  loginButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f4f6",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6366f1",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
    marginBottom: 4,
  },
  userCompany: {
    fontSize: 14,
    color: "#6b7280",
  },
  carteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  carteButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  carteButtonText: {
    flex: 1,
  },
  carteButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  carteButtonSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  preferencesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  preferenceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  langButtons: {
    flexDirection: "row",
    gap: 8,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  langButtonActive: {
    backgroundColor: "#6366f1",
  },
  langButtonText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  langButtonTextActive: {
    color: "#fff",
  },
  linksCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
