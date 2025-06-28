import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";

import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function GroupChatScreen() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { topic } = useLocalSearchParams(); // Get the topic from the URL

  const chatMessages = [
    { id: 1, text: "I'm feeling really overwhelmed right now.", sender: null },
    {
      id: 2,
      text: "I'm sorry to hear that.\nWhat's on your mind?",
      sender: "Student_92",
    },
    {
      id: 3,
      text: "It helps me to make a list of priorities",
      sender: "Hopeful Heart",
    },
    { id: 4, text: "Good idea. I'll try that, thanks", sender: "Student_92" },
  ];

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const formattedTopic = topic
    ? topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, " ")
    : "Chatroom";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#f8f9fe"
        barStyle="dark-content"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#4299e1" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Anonymous Peer Chat</Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Info */}
      <View style={styles.chatInfo}>
        <Text style={styles.chatRoom}>{formattedTopic} Chatroom</Text>
        <Text style={styles.yourName}>You're connected as CalmWave</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {chatMessages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender ? styles.otherMessage : styles.yourMessage,
            ]}
          >
            {msg.sender && <Text style={styles.senderName}>{msg.sender}</Text>}
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#a0aec0"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fe",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
  },
  reportButton: {
    backgroundColor: "#f8f9fe",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e53e3e",
  },
  reportText: {
    fontWeight: "500",
    color: "#e53e3e",
  },
  chatInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  chatRoom: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  yourName: {
    fontSize: 14,
    color: "#718096",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#f8f9fe",
  },
  chatContent: {
    padding: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    maxWidth: "80%",
  },
  yourMessage: {
    backgroundColor: "#ebf4ff",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4a5568",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#edf2f7",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
    maxHeight: 120,
    marginRight: 10,
    fontSize: 16,
    color: "#2d3748",
  },
  sendButton: {
    backgroundColor: "#4299e1",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
