import React, { useState } from "react";
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
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [messageId, setMessageId] = useState(1);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messageId,
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessageId((prev) => prev + 1);
    setInputText("");

    try {
      // Demande la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      let userLocation = null;

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        userLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      const res = await axios.post("http://192.168.88.237:5000/api/chat", {
        message: userMessage.text,
        userLocation,
      });

      const botMessage: Message = {
        id: messageId + 1,
        text: res.data.reply || "Désolé, je n’ai pas compris.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
      setMessageId((prev) => prev + 1);
    } catch (err) {
      console.error("Erreur chatbot:", err);
      const errorMsg: Message = {
        id: messageId + 1,
        text: "Une erreur s'est produite. Veuillez réessayer.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setMessageId((prev) => prev + 1);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Commencez une conversation</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Posez votre question..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f3f5",
  },
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 14,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#0077b6",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#222",
  },
  userMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 85,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f3f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#0077b6",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 30,
  },
});
