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
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import stylesProfile from "./ProfileScreen.styles.tsx";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang] = useState<"fr" | "mg">("fr");

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

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://192.168.88.254:5000/api/utilisateurs/login", {
        nom,
        identifiant,
      });
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch (err) {
      Alert.alert("Erreur", "Nom ou identifiant incorrect.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 50 }}>Chargement...</Text>;
  }

  if (!user) {
    // 🧾 Formulaire de connexion
    return (
      <View style={[stylesProfile.container, { padding: 20 }]}>
        <Text style={stylesProfile.title}>Connexion à MedicApp</Text>

        <TextInput
          placeholder="Nom"
          value={nom}
          onChangeText={setNom}
          style={stylesProfile.input}
        />
        <TextInput
          placeholder="Identifiant"
          value={identifiant}
          onChangeText={setIdentifiant}
          style={stylesProfile.input}
        />

        <TouchableOpacity style={stylesProfile.button} onPress={handleLogin}>
          <Text style={stylesProfile.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Profil utilisateur complet
  return (
    <ScrollView style={stylesProfile.container}>
      <View style={stylesProfile.header}>
        <Image
          source={require("../../assets/logo.png")}
          style={stylesProfile.avatar}
        />
        <Text style={stylesProfile.username}>
          {user.nom} {user.prenom}
        </Text>
        <Text style={stylesProfile.email}>Identifiant : {user.identifiant}</Text>
      </View>

      <View style={stylesProfile.section}>
        <Text style={stylesProfile.sectionTitle}>Informations personnelles</Text>
        <Text style={stylesProfile.infoLine}>Société : {user.societe}</Text>
        <Text style={stylesProfile.infoLine}>Fonction : {user.fonction}</Text>
        <Text style={stylesProfile.infoLine}>Niveau : {user.niveauFonction}</Text>
        <Text style={stylesProfile.infoLine}>Date de naissance : {new Date(user.dateNaissance).toLocaleDateString("fr-FR")}</Text>
        <Text style={stylesProfile.infoLine}>Date d’arrivée : {new Date(user.dateArrivee).toLocaleDateString("fr-FR")}</Text>
      </View>

      <View style={stylesProfile.section}>
        <Text style={stylesProfile.sectionTitle}>Préférences</Text>
        <View style={stylesProfile.prefRow}>
          <Text style={stylesProfile.prefLabel}>Langue</Text>
          <View style={stylesProfile.langButtons}>
            <TouchableOpacity
              onPress={() => setLang("fr")}
              style={[stylesProfile.langButton, lang === "fr" && stylesProfile.langActive]}
            >
              <Text style={stylesProfile.langText}>Français</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setLang("mg")}
              style={[stylesProfile.langButton, lang === "mg" && stylesProfile.langActive]}
            >
              <Text style={stylesProfile.langText}>Malagasy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={stylesProfile.prefRow}>
          <Text style={stylesProfile.prefLabel}>Notifications</Text>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled} />
        </View>
      </View>

      <View style={stylesProfile.section}>
        <Text style={stylesProfile.sectionTitle}>Autres</Text>
        <TouchableOpacity style={stylesProfile.linkItem}>
          <Text>Politique de confidentialité</Text>
        </TouchableOpacity>
        <TouchableOpacity style={stylesProfile.linkItem}>
          <Text>Centre d’aide / Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={stylesProfile.logoutButton}
          onPress={handleLogout}
        >
          <Text style={stylesProfile.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
