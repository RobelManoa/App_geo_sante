import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// Composant pour les cartes de prestataires avec animations
const PrestataireCard = ({ 
  item, 
  onPress 
}: { 
  item: Prestataire; 
  onPress: () => void; 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={stylesearch.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={stylesearch.cardHeader}>
          <View style={stylesearch.cardIcon}>
            <MaterialIcons name="medical-services" size={20} color="#6366f1" />
          </View>
          <View style={stylesearch.cardContent}>
            <Text style={stylesearch.name}>{item.nom}</Text>
            <Text style={stylesearch.info}>
              {item.prestations} • {item.ville}
            </Text>
            {item.adresse && (
              <Text style={stylesearch.adresse} numberOfLines={1}>
                📍 {item.adresse}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
        
        <View style={stylesearch.cardActions}>
          <TouchableOpacity
            style={stylesearch.moreButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={stylesearch.moreButtonText}>Voir détails</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour les filtres avec animations
const FilterButton = ({ 
  title, 
  isSelected, 
  onPress 
}: { 
  title: string; 
  isSelected: boolean; 
  onPress: () => void; 
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isSelected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          stylesearch.filterButton,
          isSelected && stylesearch.filterButtonSelected,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            stylesearch.filterText,
            isSelected && stylesearch.filterTextSelected,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
        const response = await api.get("/");
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

  const handleCardPress = (prestataire: Prestataire) => {
    navigation.navigate("Fiche", { prestataire });
  };

  const renderEmptyState = () => (
    <View style={stylesearch.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#9ca3af" />
      <Text style={stylesearch.emptyTitle}>
        {searchText || selectedVille ? "Aucun résultat trouvé" : "Aucun prestataire disponible"}
      </Text>
      <Text style={stylesearch.emptySubtitle}>
        {searchText || selectedVille 
          ? "Essayez de modifier vos critères de recherche" 
          : "Les prestataires apparaîtront ici une fois disponibles"
        }
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={stylesearch.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text style={stylesearch.errorTitle}>Erreur de chargement</Text>
      <Text style={stylesearch.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={stylesearch.retryButton}
        onPress={() => {
          setError(null);
          setLoading(true);
          // Recharger les données
          api.get("/").then(response => {
            if (Array.isArray(response.data)) {
              setData(response.data);
            }
          }).catch(err => {
            setError(err.message || "Erreur API");
          }).finally(() => {
            setLoading(false);
          });
        }}
      >
        <Text style={stylesearch.retryButtonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={stylesearch.safeArea}>
      <View style={stylesearch.container}>
        {/* Header */}
        <View style={stylesearch.header}>
          <Text style={stylesearch.title}>Recherche de prestataires</Text>
          <Text style={stylesearch.subtitle}>
            Trouvez les services médicaux près de chez vous
          </Text>
        </View>

        {/* Barre de recherche */}
        <View style={stylesearch.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={stylesearch.searchIcon} />
          <TextInput
            style={stylesearch.searchInput}
            placeholder="Rechercher par nom, service ou lieu..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={stylesearch.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres par ville */}
        <View style={stylesearch.filtersContainer}>
          <Text style={stylesearch.filtersTitle}>Filtrer par ville</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={stylesearch.filtersScroll}
          >
            <FilterButton
              title="Toutes"
              isSelected={selectedVille === ""}
              onPress={() => setSelectedVille("")}
            />
            {villes.map((ville) => (
              <FilterButton
                key={ville}
                title={ville}
                isSelected={selectedVille === ville}
                onPress={() => setSelectedVille(ville)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Résultats */}
        <View style={stylesearch.resultsContainer}>
          {error ? (
            renderErrorState()
          ) : loading ? (
            <View style={stylesearch.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={stylesearch.loadingText}>Chargement des prestataires...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <PrestataireCard
                  item={item}
                  onPress={() => handleCardPress(item)}
                />
              )}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={stylesearch.listContent}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
