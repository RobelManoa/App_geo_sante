import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import stylesearch from "./SearchScreen.styles";
import api from "../api/api";

type RootStackParamList = {
  Fiche: { prestataire: Prestataire };
};

type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Fiche"
>;

interface Prestataire {
  _id: string;
  nom: string;
  prestations: string;
  ville: string;
  adresse?: string;
  telephone?: string;
}

const villes = [
  "Ambanja", "Ambatondrazaka", "Ambilobe", "Amboasary-Atsimo", "Ambositra",
  "Ambovombe-Androy", "Andapa", "Antalaha", "Antananarivo", "Antsirabe",
  "Antsiranana (Diego)", "Antsohihy", "Brickaville", "Farafangana", "Fénérive-Est"
];

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchText, setSearchText] = useState("");
  const [selectedVille, setSelectedVille] = useState("");
  const [data, setData] = useState<Prestataire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrestataires = async () => {
      try {
        setLoading(true);
        const response = await api.get("/prestataires");
        if (!Array.isArray(response.data)) throw new Error("Données invalides");
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Erreur API");
      } finally {
        setLoading(false);
      }
    };
    fetchPrestataires();
  }, []);

  const filteredData = data.filter((item) => {
    const query = searchText.toLowerCase();
    const matchSearch =
      item.nom?.toLowerCase().includes(query) ||
      item.prestations?.toLowerCase().includes(query) ||
      item.ville?.toLowerCase().includes(query) ||
      item.adresse?.toLowerCase().includes(query);
    const matchVille = selectedVille ? item.ville === selectedVille : true;
    return matchSearch && matchVille;
  });

  return (
    <View style={stylesearch.container}>
      <Text style={stylesearch.title}>Recherche de prestataires</Text>

      <TextInput
        style={stylesearch.searchInput}
        placeholder="Rechercher par nom, service ou lieu..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        <TouchableOpacity onPress={() => setSelectedVille("")} style={stylesearch.filterButton}>
          <Text style={stylesearch.filterText}>Toutes</Text>
        </TouchableOpacity>
        {villes.map((ville) => (
          <TouchableOpacity
            key={ville}
            onPress={() => setSelectedVille(ville)}
            style={[
              stylesearch.filterButton,
              selectedVille === ville && stylesearch.filterButtonSelected,
            ]}
          >
            <Text
              style={[
                stylesearch.filterText,
                selectedVille === ville && stylesearch.filterTextSelected,
              ]}
            >
              {ville}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && <Text style={stylesearch.errorText}>{error}</Text>}
      {loading ? (
        <ActivityIndicator size="large" color="#00bfa5" />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={stylesearch.card}>
              <Text style={stylesearch.name}>{item.nom}</Text>
              <Text style={stylesearch.info}>
                {item.prestations} • {item.ville}
              </Text>
              {item.adresse && <Text style={stylesearch.adresse}>{item.adresse}</Text>}
              <TouchableOpacity
                style={stylesearch.moreButton}
                onPress={() => navigation.navigate("Fiche", { prestataire: item })}
              >
                <Text style={stylesearch.moreButtonText}>Voir plus</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
