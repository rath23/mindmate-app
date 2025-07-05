import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import SockJS from "sockjs-client";
import { AuthContext } from '../../context/AuthContext';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

const GroupChatScreen = () => {
  const { user } = useContext(AuthContext);
  const { topic } = useLocalSearchParams();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);
  const stompClient = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const initUser = async () => {
      let storedId = user.id;
      let storedNickname = user.nickName;

      if (!storedNickname) {
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
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token || !userId || !nickname) {
          console.warn("Missing token or user info, skipping WebSocket connection.");
          return;
        }

        const socket = new SockJS("https://mindmate-ye33.onrender.com/ws-chat");

        stompClient.current = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          debug: (str) => console.log(str),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          onConnect: () => {
            console.log("Connected to WebSocket");

            stompClient.current.subscribe(`/topic/chat.${topic}`, (message) => {
              const newMessage = JSON.parse(message.body);
              setChatMessages(prev => [...prev, newMessage]);
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            });
          },
          onStompError: (frame) => {
            console.error("Broker error:", frame.headers["message"]);
            console.error("Details:", frame.body);
          },
        });

        stompClient.current.activate();
      } catch (err) {
        console.error("WebSocket connection failed:", err);
      }
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
        `https://mindmate-ye33.onrender.com/api/messages/${topic}`,
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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
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
      setInputHeight(50);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
        `https://mindmate-ye33.onrender.com/api/report?reporter=${nickname}&reported=${reportedNickname}&room=${topic}`,
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

  const handleBackPress = () => {
    router.back();
  };

  // Format room title with proper capitalization
  const formatRoomTitle = (title) => {
    return title
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle input content size changes for expanding text input
  const handleContentSizeChange = (event) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(Math.max(50, Math.min(height, 150)));
  };

  const renderMessage = ({ item }) => {
    const MIN_BUBBLE_WIDTH = DEVICE_WIDTH * 0.25;
    const MAX_BUBBLE_WIDTH = DEVICE_WIDTH * 0.8;
    
    const charCount = item.content.length;
    let bubbleWidth = Math.min(
      Math.max(MIN_BUBBLE_WIDTH, charCount * 8), 
      MAX_BUBBLE_WIDTH
    );
    
    if (item.senderNickname !== nickname) {
      bubbleWidth = Math.max(bubbleWidth, MIN_BUBBLE_WIDTH * 1.2);
    }
    
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.senderNickname !== nickname) {
            handleReportUser(item.senderNickname);
          }
        }}
      >
        <View
          style={[
            styles.messageBubble,
            item.senderNickname === nickname
              ? styles.myMessage
              : styles.otherMessage,
            { maxWidth: MAX_BUBBLE_WIDTH, minWidth: MIN_BUBBLE_WIDTH, width: bubbleWidth }
          ]}
        >
          {item.senderNickname !== nickname && (
            <Text style={styles.senderName}>
              {item.senderNickname}
            </Text>
          )}
          <Text style={[
            styles.messageText,
            item.senderNickname === nickname && styles.myMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timestamp,
            item.senderNickname === nickname 
              ? styles.myTimestamp 
              : styles.otherTimestamp
          ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.container}>
        <View style={[
          styles.header,
          Platform.OS === 'android' && styles.androidHeader
        ]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Feather name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.roomTitle}>{formatRoomTitle(topic)}</Text>
            <Text style={styles.userInfo}>Your nickname: {nickname}</Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="chatbubbles" size={48} color="#6C63FF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.chatContainer,
              { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 100 }
            ]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbox-outline" size={64} color="#d3d3d3" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Be the first to say something!</Text>
              </View>
            }
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.select({ 
            ios: 80, 
            android: StatusBar.currentHeight + 20 
          })}
        >
          <View style={[
            styles.inputContainer,
            { marginBottom: keyboardHeight > 0 ? keyboardHeight - (Platform.OS === 'android' ? 20 : 0) : 0 }
          ]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textInput, { height: inputHeight }]}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                onContentSizeChange={handleContentSizeChange}
                multiline
                onFocus={() => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={[styles.sendButton, !messageText.trim() && styles.disabledButton]}
                disabled={!messageText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={messageText.trim() ? "#fff" : "#aaa"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === 'ios' ? 0 : 8
  },
  keyboardAvoidingView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidHeader: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: 'center',
  },
  userInfo: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6C63FF",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 6,
    color: "#555",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    flexWrap: 'wrap',
  },
  myMessageText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 6,
  },
  myTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  otherTimestamp: {
    color: "rgba(0,0,0,0.5)",
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 16,
    minHeight: 50,
    maxHeight: 150,
    color: '#333',
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: "#6C63FF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
});

export default GroupChatScreen;