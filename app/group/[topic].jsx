import AsyncStorage from "@react-native-async-storage/async-storage";


import { Client } from "@stomp/stompjs";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SockJS from "sockjs-client";
import { AuthContext } from '../../context/AuthContext';

const GroupChatScreen = () => {
  const {user } = useContext(AuthContext);
  const { topic } = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const flatListRef = useRef(null);
  const stompClient = useRef(null);

  // Generate unique user ID and nickname
  useEffect(() => {
    const initUser = async () => {
      let storedId = user.id 
      let storedNickname = user.nickName;

      console.log("Stored ID:", storedId);
      console.log("Stored Nickname:", storedNickname);

      // if (!storedId) {
      //   storedId = uuidv4();
      //   await AsyncStorage.setItem("@userId", storedId);
      // }

      // If nickname isn't already saved, fetch from backend
      if (!storedNickname) {

          console.error("Nickname fetch error:", err.message);
          storedNickname = `User${Math.floor(Math.random() * 10000)}`;
          await AsyncStorage.setItem("@nickname", storedNickname);
        }
      

      setUserId(storedId);
      setNickname(storedNickname);
    };

    initUser();
  }, []);

  // Connect to WebSocket
useEffect(() => {
  const connectWebSocket = async () => {
    if (!userId || !nickname) return;

    const token = await AsyncStorage.getItem("token");
    const socket = new SockJS("http://localhost:8080/ws-chat");

    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    stompClient.current.onConnect = () => {
      console.log("Connected to WebSocket");
      stompClient.current.subscribe(`/topic/chat.${topic}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setChatMessages((prev) => [...prev, newMessage]);
      });
    };

    stompClient.current.onStompError = (frame) => {
      console.error("Broker error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    };

    stompClient.current.activate();
  };

  connectWebSocket();

  return () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      console.log("WebSocket disconnected");
    }
  };
}, [topic, userId, nickname]);


  // Fetch chat history
const fetchMessages = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/messages/${topic}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    const messages = await response.json();
    setChatMessages(messages);
  } catch (err) {
    console.error(err.message);
    Alert.alert("Error", "Failed to load chat history");
  } finally {
    setLoading(false);
  }
};


  // Send message via WebSocket
  const sendMessage = () => {
    if (!messageText.trim()) return;

    const message = {
      room: topic,
      senderNickname: nickname,
      content: messageText,
    };

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.publish({
        destination: `/app/chat.send`,
        body: JSON.stringify(message),
      });
      setMessageText("");
    } else {
      Alert.alert("Error", "Not connected to chat server");
    }
  };

  // Report a user when tapping on their message
  const handleReportUser = (reportedNickname) => {
    if (reportedNickname === nickname) {
      Alert.alert("Cannot report yourself");
      return;
    }

    Alert.alert(
      "Report User",
      `Report ${reportedNickname} for inappropriate behavior?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Report",
          onPress: () => submitReport(reportedNickname),
          style: "destructive",
        },
      ]
    );
  };

const submitReport = async (reportedNickname) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      `http://localhost:8080/api/report?reporter=${nickname}&reported=${reportedNickname}&room=${topic}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      Alert.alert("Success", `${reportedNickname} has been reported`);
    } else {
      throw new Error("Failed to report user");
    }
  } catch (err) {
    console.error(err.message);
    Alert.alert("Error", "Failed to report user");
  }
};


  useEffect(() => {
    fetchMessages();
  }, []);

  // Render message with tap-to-report functionality
  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        // Only allow reporting other users
        if (item.senderNickname !== nickname) {
          handleReportUser(item.senderNickname);
        }
      }}
      delayLongPress={300}
    >
      <View
        style={[
          styles.messageBubble,
          item.senderNickname === nickname
            ? styles.myMessage
            : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.senderName,
            item.senderNickname === nickname
              ? styles.mySenderName
              : styles.otherSenderName,
          ]}
        >
          {item.senderNickname === nickname ? "You" : item.senderNickname}
        </Text>
        <Text
          style={[
            styles.messageText,
            item.senderNickname === nickname
              ? styles.myMessageText
              : styles.otherMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.senderNickname === nickname
              ? styles.myTimestamp
              : styles.otherTimestamp,
          ]}
        >
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.roomTitle}>#{topic.replace(/-/g, " ")}</Text>
      <Text style={styles.userInfo}>Your nickname: {nickname}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No messages yet. Be the first to say something!</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  roomTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 8,
    color: "#6C63FF",
  },
  userInfo: {
    textAlign: "center",
    color: "#666",
    marginBottom: 12,
    fontSize: 14,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6C63FF",
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e4e4e4",
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 4,
  },
  mySenderName: {
    color: "rgba(255,255,255,0.8)",
  },
  otherSenderName: {
    color: "rgba(0,0,0,0.6)",
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  myTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  otherTimestamp: {
    color: "rgba(0,0,0,0.5)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
});

export default GroupChatScreen;
