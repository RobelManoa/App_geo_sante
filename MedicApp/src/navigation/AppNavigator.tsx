import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// Importez vos écrans ici
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MapScreen from "../screens/MapScreen";
import ProviderDetailScreen from "../screens/ProviderDetailScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatScreen from "../screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          const iconSize = focused ? 24 : 22;

          switch (route.name) {
            case "Accueil":
              iconName = focused ? "home-sharp" : "home-outline";
              break;
            case "Recherche":
              iconName = focused ? "search-sharp" : "search-outline";
              break;
            case "Carte":
              iconName = focused ? "map-sharp" : "map-outline";
              break;
            case "Profil":
              iconName = focused ? "person-sharp" : "person-outline";
              break;
            case "Chat":
              iconName = focused
                ? "chatbubble-ellipses"
                : "chatbubble-ellipses-outline";
              break;
            default:
              iconName = "home-outline";
          }

          if (route.name === "Recherche") {
            return (
              <View style={styles.centralButton}>
                <Ionicons name={iconName} size={28} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 90 : 70,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          borderRadius: 15,
          marginHorizontal: 5,
          marginBottom: Platform.OS === "ios" ? 20 : 10,
          height: 50,
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#64748b",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: Platform.OS === "ios" ? 5 : 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />

      <Tab.Screen
        name="Recherche"
        component={SearchScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />

      <Tab.Screen
        name="Carte"
        component={MapScreen}
        options={{ tabBarLabel: "Carte" }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: "Messages" }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 25 : 15,
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    transform: [{ translateY: -10 }],
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
