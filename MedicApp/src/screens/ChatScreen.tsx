import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import api from "../api/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "suggestion" | "prestataire" | "urgence";
  data?: any;
}

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
}

// Types d'intentions détectées
type IntentType = 
  | "recherche_prestataire"
  | "symptome"
  | "conseil_medical"
  | "conversation"
  | "urgence"
  | "contact"
  | "navigation"
  | "rejet"
  | "alternative";

// Mots-clés pour la détection d'intention
const KEYWORDS = {
  recherche_prestataire: [
    "cherche", "recherche", "trouve", "où", "pharmacie", "médecin", "hôpital", 
    "clinique", "dentiste", "échographie", "radiologie", "laboratoire", "consultation"
  ],
  symptome: [
    "mal", "douleur", "fièvre", "nausée", "fatigue", "toux", "rhume", "grippe",
    "enceinte", "accoucher", "enfant", "bébé", "dents", "ventre", "tête"
  ],
  urgence: [
    "urgence", "danger", "grave", "critique", "samu", "pompiers", "ambulance",
    "difficulté respirer", "saignement", "perte connaissance"
  ],
  conseil_medical: [
    "conseil", "médicament", "traitement", "éviter", "prévenir", "comment",
    "quoi faire", "remède", "soin"
  ],
  conversation: [
    "salut", "bonjour", "ça va", "discuter", "parler", "conversation"
  ]
};

// Numéros d'urgence
const NUMEROS_URGENCE = {
  samu: "124",
  pompiers: "118",
  police: "117",
  ambulance: "124"
};

// Types pour les conseils médicaux
type ConseilMedical = {
  conseils: string[];
  prestataires: string[];
};

type ConseilsMedicauxType = {
  [key: string]: ConseilMedical;
};

// Conseils médicaux par symptôme
const CONSEILS_MEDICAUX: ConseilsMedicauxType = {
  "mal de tête": {
    conseils: [
      "Reposez-vous dans un endroit calme et sombre",
      "Buvez beaucoup d'eau",
      "Évitez les écrans et la lumière vive",
      "Prenez du paracétamol si nécessaire"
    ],
    prestataires: ["médecin généraliste", "pharmacie"]
  },
  "mal de ventre": {
    conseils: [
      "Évitez les aliments gras et épicés",
      "Buvez des tisanes (camomille, menthe)",
      "Reposez-vous",
      "Consultez si la douleur persiste plus de 24h"
    ],
    prestataires: ["médecin généraliste", "pharmacie"]
  },
  "fièvre": {
    conseils: [
      "Reposez-vous",
      "Buvez beaucoup d'eau",
      "Prenez du paracétamol",
      "Surveillez la température",
      "Consultez si fièvre > 39°C ou persistance > 3 jours"
    ],
    prestataires: ["médecin généraliste", "pharmacie"]
  },
  "grippe": {
    conseils: [
      "Reposez-vous bien",
      "Buvez beaucoup d'eau et de tisanes",
      "Prenez du paracétamol pour la fièvre",
      "Lavez-vous les mains fréquemment",
      "Évitez les contacts avec les autres"
    ],
    prestataires: ["médecin généraliste", "pharmacie"]
  }
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [messageId, setMessageId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prestataires, setPrestataires] = useState<Prestataire[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Message de bienvenue
    const welcomeMessage: Message = {
      id: 1,
      text: "Bonjour ! Je suis votre assistant médical. Je peux vous aider à trouver des prestataires de soins, répondre à vos questions de santé ou vous donner des conseils. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
      type: "text"
    };
    setMessages([welcomeMessage]);
    setMessageId(2);

    // Charger les prestataires
    loadPrestataires();
    
    // Demander la localisation
    requestLocation();
  }, []);

  const loadPrestataires = async () => {
    try {
      const response = await api.get('/');
      if (Array.isArray(response.data)) {
        setPrestataires(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement prestataires:', error);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Erreur localisation:', error);
    }
  };

  const detectIntent = (text: string): IntentType => {
    const lowerText = text.toLowerCase();
    
    // Vérifier les urgences en premier
    if (KEYWORDS.urgence.some(keyword => lowerText.includes(keyword))) {
      return "urgence";
    }
    
    // Vérifier les autres intentions
    if (KEYWORDS.recherche_prestataire.some(keyword => lowerText.includes(keyword))) {
      return "recherche_prestataire";
    }
    
    if (KEYWORDS.symptome.some(keyword => lowerText.includes(keyword))) {
      return "symptome";
    }
    
    if (KEYWORDS.conseil_medical.some(keyword => lowerText.includes(keyword))) {
      return "conseil_medical";
    }
    
    if (KEYWORDS.conversation.some(keyword => lowerText.includes(keyword))) {
      return "conversation";
    }
    
    return "conversation"; // Par défaut
  };

  const extractLocation = (text: string): string | null => {
    const villes = ["Antananarivo", "Antsirabe", "Antsiranana", "Ambanja", "Ambatondrazaka"];
    const lowerText = text.toLowerCase();
    
    for (const ville of villes) {
      if (lowerText.includes(ville.toLowerCase())) {
        return ville;
      }
    }
    
    return null;
  };

  const extractSymptome = (text: string): string | null => {
    const symptomes = Object.keys(CONSEILS_MEDICAUX);
    const lowerText = text.toLowerCase();
    
    for (const symptome of symptomes) {
      if (lowerText.includes(symptome.toLowerCase())) {
        return symptome;
      }
    }
    
    return null;
  };

  const findPrestataires = (type: string, ville?: string): Prestataire[] => {
    let filtered = prestataires;
    
    // Filtrer par type avec recherche plus précise
    if (type && type !== "prestataire") {
      filtered = filtered.filter(p => {
        const nom = p.nom.toLowerCase();
        const categorie = p.categorie?.toLowerCase() || "";
        const prestations = p.prestations?.toLowerCase() || "";
        
        // Recherche plus précise selon le type
        switch (type) {
          case "pharmacie":
            return nom.includes("pharmacie") || categorie.includes("pharmacie");
          case "médecin":
            return nom.includes("médecin") || nom.includes("docteur") || categorie.includes("médecin") || categorie.includes("généraliste");
          case "hôpital":
            return nom.includes("hôpital") || nom.includes("hopital") || categorie.includes("hôpital");
          case "clinique":
            return nom.includes("clinique") || categorie.includes("clinique");
          case "dentiste":
            return nom.includes("dentiste") || nom.includes("dentaire") || categorie.includes("dentiste");
          default:
            return nom.includes(type.toLowerCase()) || categorie.includes(type.toLowerCase()) || prestations.includes(type.toLowerCase());
        }
      });
    }
    
    // Filtrer par ville si spécifiée
    if (ville) {
      filtered = filtered.filter(p => 
        p.ville?.toLowerCase().includes(ville.toLowerCase())
      );
    }
    
    // Si pas de résultats avec la ville, essayer sans filtre de ville
    if (filtered.length === 0 && ville) {
      filtered = prestataires.filter(p => {
        const nom = p.nom.toLowerCase();
        const categorie = p.categorie?.toLowerCase() || "";
        const prestations = p.prestations?.toLowerCase() || "";
        
        switch (type) {
          case "pharmacie":
            return nom.includes("pharmacie") || categorie.includes("pharmacie");
          case "médecin":
            return nom.includes("médecin") || nom.includes("docteur") || categorie.includes("médecin") || categorie.includes("généraliste");
          case "hôpital":
            return nom.includes("hôpital") || nom.includes("hopital") || categorie.includes("hôpital");
          case "clinique":
            return nom.includes("clinique") || categorie.includes("clinique");
          case "dentiste":
            return nom.includes("dentiste") || nom.includes("dentaire") || categorie.includes("dentiste");
          default:
            return nom.includes(type.toLowerCase()) || categorie.includes(type.toLowerCase()) || prestations.includes(type.toLowerCase());
        }
      });
    }
    
    // Limiter à 10 résultats maximum pour le calcul de distance
    return filtered.slice(0, 10);
  };

  const generateResponse = async (intent: IntentType, text: string, startId: number): Promise<Message[]> => {
    const responses: Message[] = [];
    let currentMessageId = startId;
    
    switch (intent) {
      case "urgence":
        responses.push({
          id: currentMessageId++,
          text: "🚨 URGENCE MÉDICALE 🚨\n\nAppelez immédiatement le SAMU au 124 ou les pompiers au 118.\n\nEn attendant, je peux vous localiser l'hôpital le plus proche. Voulez-vous que je le fasse ?",
          sender: "bot",
          timestamp: new Date(),
          type: "urgence"
        });
        break;
        
      case "recherche_prestataire":
        const location = extractLocation(text);
        const searchType = text.toLowerCase().includes("pharmacie") ? "pharmacie" :
                          text.toLowerCase().includes("médecin") ? "médecin" :
                          text.toLowerCase().includes("hôpital") ? "hôpital" :
                          text.toLowerCase().includes("dentiste") ? "dentiste" :
                          text.toLowerCase().includes("clinique") ? "clinique" : "prestataire";
        
        const foundPrestataires = findPrestataires(searchType, location || undefined);
        
        if (foundPrestataires.length > 0) {
          // Trouver le prestataire le plus proche si on a la localisation
          let closestPrestataire = foundPrestataires[0];
          let alternativePrestataires: Prestataire[] = [];
          
          if (userLocation && foundPrestataires.length > 1) {
            // Calculer les distances et trier par proximité
            const prestatairesWithDistance = foundPrestataires
              .filter(p => p.localisation)
              .map(p => ({
                ...p,
                distance: calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  p.localisation!.latitude,
                  p.localisation!.longitude
                )
              }))
              .sort((a, b) => a.distance - b.distance);
            
            if (prestatairesWithDistance.length > 0) {
              closestPrestataire = prestatairesWithDistance[0];
              // Prendre 2 alternatives maximum
              alternativePrestataires = prestatairesWithDistance.slice(1, 3);
            }
          }
          
          // Message principal avec le prestataire le plus proche
          responses.push({
            id: currentMessageId++,
            text: `J'ai trouvé ${closestPrestataire.nom} qui semble être le plus proche de vous :`,
            sender: "bot",
            timestamp: new Date(),
            type: "text"
          });
          
          // Afficher le prestataire principal
          responses.push({
            id: currentMessageId++,
            text: `🏥 ${closestPrestataire.nom}\n📍 ${closestPrestataire.ville || 'Ville non spécifiée'}\n📞 ${closestPrestataire.telephone || 'Téléphone non disponible'}\n${closestPrestataire.categorie ? `🏷️ ${closestPrestataire.categorie}` : ''}`,
            sender: "bot",
            timestamp: new Date(),
            type: "prestataire",
            data: closestPrestataire
          });
          
          // Afficher les alternatives si disponibles
          if (alternativePrestataires.length > 0) {
            responses.push({
              id: currentMessageId++,
              text: "Autres options à proximité :",
              sender: "bot",
              timestamp: new Date(),
              type: "text"
            });
            
            alternativePrestataires.forEach((prestataire, index) => {
              responses.push({
                id: currentMessageId++,
                text: `🏥 ${prestataire.nom}\n📍 ${prestataire.ville || 'Ville non spécifiée'}\n📞 ${prestataire.telephone || 'Téléphone non disponible'}`,
                sender: "bot",
                timestamp: new Date(),
                type: "prestataire",
                data: prestataire
              });
            });
          }
        } else {
          responses.push({
            id: currentMessageId++,
            text: "Je n'ai pas trouvé de prestataire correspondant à votre demande. Pouvez-vous préciser votre recherche ou me dire dans quelle ville vous vous trouvez ?",
            sender: "bot",
            timestamp: new Date(),
            type: "text"
          });
        }
        break;
        
      case "symptome":
        const symptome = extractSymptome(text);
        if (symptome && CONSEILS_MEDICAUX[symptome]) {
          const conseils = CONSEILS_MEDICAUX[symptome];
          responses.push({
            id: currentMessageId++,
            text: `Je comprends que vous avez ${symptome}. Voici mes conseils :\n\n${conseils.conseils.map((c: string) => `• ${c}`).join('\n')}\n\nSouhaitez-vous que je vous localise un prestataire de soins ?`,
            sender: "bot",
            timestamp: new Date(),
            type: "text"
          });
        } else {
          responses.push({
            id: currentMessageId++,
            text: "Je comprends que vous ne vous sentez pas bien. Pour mieux vous aider, pouvez-vous me décrire vos symptômes plus précisément ? Avez-vous de la fièvre, des douleurs, ou d'autres signes particuliers ?",
            sender: "bot",
            timestamp: new Date(),
            type: "text"
          });
        }
        break;
        
      case "conseil_medical":
        responses.push({
          id: currentMessageId++,
          text: "Je peux vous donner des conseils généraux, mais pour un diagnostic précis, il est important de consulter un professionnel de santé. Que souhaitez-vous savoir exactement ?",
          sender: "bot",
          timestamp: new Date(),
          type: "text"
        });
        break;
        
      case "conversation":
      default:
        const greetings = [
          "Salut ! Comment puis-je vous aider aujourd'hui ?",
          "Bonjour ! Je suis là pour vous accompagner dans vos besoins de santé. Que puis-je faire pour vous ?",
          "Salut ! N'hésitez pas à me poser vos questions sur la santé ou à me demander de vous aider à trouver un prestataire de soins."
        ];
        responses.push({
          id: currentMessageId++,
          text: greetings[Math.floor(Math.random() * greetings.length)],
          sender: "bot",
          timestamp: new Date(),
          type: "text"
        });
        break;
    }
    
    return responses;
  };

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance en km
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: messageId,
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentId = messageId + 1;
    setMessageId(currentId);
    setInputText("");
    setLoading(true);

    try {
      // Détecter l'intention
      const intent = detectIntent(inputText);
      
      // Générer la réponse
      const botResponses = await generateResponse(intent, inputText, currentId);
      
      // Ajouter les réponses avec un délai pour simuler la réflexion
      for (let i = 0; i < botResponses.length; i++) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...botResponses[i],
            id: currentId + i
          }]);
        }, i * 500); // Délai de 500ms entre chaque message
      }
      
      // Mettre à jour l'ID pour les prochains messages
      setMessageId(currentId + botResponses.length);
      
    } catch (error) {
      console.error("Erreur chatbot:", error);
      const errorMessage: Message = {
        id: currentId,
        text: "Désolé, une erreur s'est produite. Pouvez-vous reformuler votre question ?",
        sender: "bot",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
      setMessageId(currentId + 1);
    } finally {
      setLoading(false);
    }
  };

  const handlePrestataireAction = (prestataire: Prestataire, action: 'call' | 'directions') => {
    if (action === 'call' && prestataire.telephone) {
      Linking.openURL(`tel:${prestataire.telephone}`).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
      });
    } else if (action === 'directions' && prestataire.localisation) {
      const { latitude, longitude } = prestataire.localisation;
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      ).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application de cartographie");
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageWrapper}>
      <View
        style={[
          styles.messageContainer,
          item.sender === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender === "user" && styles.userMessageText,
          ]}
        >
          {item.text}
        </Text>
        
        {item.type === "prestataire" && item.data && (
          <View style={styles.prestataireActions}>
            {item.data.telephone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePrestataireAction(item.data, 'call')}
              >
                <Ionicons name="call" size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>
            )}
            {item.data.localisation && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handlePrestataireAction(item.data, 'directions')}
              >
                <Ionicons name="navigate" size={16} color="#6366f1" />
                <Text style={styles.actionButtonText}>Itinéraire</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="medical" size={24} color="#6366f1" />
        <Text style={styles.headerTitle}>Assistant Médical</Text>
      </View>
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => `${item.id}-${item.timestamp.getTime()}`}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6366f1" />
            <Text style={styles.loadingText}>En train de réfléchir...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Posez votre question..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
    marginTop: 40,
  },
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "85%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: "#6366f1",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  prestataireActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#6366f1",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
});
