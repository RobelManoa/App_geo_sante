import React from "react";
import { Platform, View, StyleSheet, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MapScreen from "../screens/MapScreen";
import ProviderDetailScreen from "../screens/ProviderDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatScreen from "../screens/ChatScreen";

const Tab = createBottomTabNavigator();

// Types pour les icônes Ionicons
type IconName = keyof typeof Ionicons.glyphMap;

// Types pour la configuration des onglets
type TabConfig = {
  label: string;
  iconFocused: IconName;
  iconUnfocused: IconName;
  isCentral?: boolean;
};

// Configuration des onglets
const TAB_CONFIG: Record<string, TabConfig> = {
  Accueil: {
    label: "Accueil",
    iconFocused: "home-sharp" as IconName,
    iconUnfocused: "home-outline" as IconName,
  },
  Recherche: {
    label: "Recherche",
    iconFocused: "search-sharp" as IconName,
    iconUnfocused: "search-outline" as IconName,
    isCentral: true,
  },
  Carte: {
    label: "Carte",
    iconFocused: "map-sharp" as IconName,
    iconUnfocused: "map-outline" as IconName,
  },
  Chat: {
    label: "Messages",
    iconFocused: "chatbubble-ellipses" as IconName,
    iconUnfocused: "chatbubble-ellipses-outline" as IconName,
  },
  Profil: {
    label: "Profil",
    iconFocused: "person-sharp" as IconName,
    iconUnfocused: "person-outline" as IconName,
  },
};

// Composant pour l'icône animée
const AnimatedIcon = ({ 
  name, 
  size, 
  color, 
  focused, 
  isCentral = false 
}: {
  name: IconName;
  size: number;
  color: string;
  focused: boolean;
  isCentral?: boolean;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [focused]);

  if (isCentral) {
    return (
      <Animated.View 
        style={[
          styles.centralButton,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Ionicons name={name} size={28} color="#fff" />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size, focused }) => {
          const config = TAB_CONFIG[route.name as keyof typeof TAB_CONFIG];
          
          if (!config) {
            return <Ionicons name="home-outline" size={size} color={color} />;
          }

          const iconName = focused ? config.iconFocused : config.iconUnfocused;
          const iconSize = focused ? 24 : 22;

          return (
            <AnimatedIcon
              name={iconName}
              size={iconSize}
              color={color}
              focused={focused}
              isCentral={config.isCentral}
            />
          );
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 95 : 75,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 10,
          paddingBottom: Platform.OS === "ios" ? 25 : 15,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 3,
          marginBottom: Platform.OS === "ios" ? 20 : 10,
          height: 55,
          paddingVertical: 5,
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#64748b",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          paddingBottom: Platform.OS === "ios" ? 5 : 0,
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ 
          tabBarLabel: TAB_CONFIG.Accueil.label,
          tabBarAccessibilityLabel: "Accéder à l'écran d'accueil"
        }}
      />

      <Tab.Screen
        name="Recherche"
        component={SearchScreen}
        options={{
          tabBarLabel: () => null,
          tabBarAccessibilityLabel: "Rechercher des services médicaux"
        }}
      />

      <Tab.Screen
        name="Carte"
        component={MapScreen}
        options={{ 
          tabBarLabel: TAB_CONFIG.Carte.label,
          tabBarAccessibilityLabel: "Voir la carte des services"
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ 
          tabBarLabel: TAB_CONFIG.Chat.label,
          tabBarAccessibilityLabel: "Accéder aux messages"
        }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ 
          tabBarLabel: TAB_CONFIG.Profil.label,
          tabBarAccessibilityLabel: "Accéder au profil utilisateur"
        }}
      />

      <Tab.Screen
        name="Fiche"
        component={ProviderDetailScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centralButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 30 : 20,
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    transform: [{ translateY: -15 }],
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
