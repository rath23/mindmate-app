import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://mindmate-ye33.onrender.com/api",
  ENDPOINTS: {
    JOURNAL: "/journal",
  },
  TIMEOUT: 10000, // 10 seconds
};

const JournalNotesScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [promptError, setPromptError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const noteInputRef = useRef(null);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      return token;
    } catch (error) {
      console.error("Token retrieval error:", error);
      throw error;
    }
  };

  const validateForm = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      return false;
    }
    if (!note.trim()) {
      Alert.alert("Validation", "Please add some content to your journal entry");
      return false;
    }
    return true;
  };

  // const handleSave = async () => {
  //   if (!validateForm()) return;

  //   setIsSaving(true);
  //   try {
  //     const token = await getAuthToken();
  //     const payload = { heading: prompt, body: note };

  //     const response = await axios({
  //       method: "post",
  //       url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}`,
  //       data: payload,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       timeout: API_CONFIG.TIMEOUT,
  //     });

  //     if (response.status === 201) {
  //       Alert.alert("Success", "Journal saved successfully!", [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             router.replace("/PastEntriesScreen");
  //             setIsEditing(false);
  //           },
  //         },
  //       ]);
  //     }
  //   } catch (error) {
  //     console.error("Save error:", error);
  //     let errorMessage = "Failed to save journal entry";
      
  //     if (error.response) {
  //       if (error.response.status === 401) {
  //         errorMessage = "Session expired. Please login again.";
  //         await AsyncStorage.removeItem("token");
  //         navigation.navigate("Login");
  //       } else if (error.response.data?.message) {
  //         errorMessage = error.response.data.message;
  //       }
  //     } else if (error.request) {
  //       errorMessage = "Network error. Please check your connection.";
  //     } else if (error.message.includes("timeout")) {
  //       errorMessage = "Request timed out. Please try again.";
  //     }

  //     Alert.alert("Error", errorMessage);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

const handleSave = async () => {
  console.log("Save button pressed");

  if (!validateForm()) {
    console.log("Validation failed");
    return;
  }

  setIsSaving(true);
  try {
    const token = await getAuthToken();
    console.log("Token retrieved:", token);

    const payload = { heading: prompt, body: note };
    console.log("Payload:", payload);

    const response = await axios({
      method: "post",
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}`,
      data: payload,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: API_CONFIG.TIMEOUT,
    });

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    if (response.status === 201 || response.status === 200) {
      Alert.alert("Success", "Journal saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/PastEntriesScreen");
            setIsEditing(false);
          },
        },
      ]);
    } else {
      Alert.alert("Unexpected Response", `Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Save error:", error);

    let errorMessage = "Failed to save journal entry";

    if (error.response) {
      console.log("Error response:", error.response);
      if (error.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
        await AsyncStorage.removeItem("token");
        navigation.navigate("Login");
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      console.log("No response from server:", error.request);
      errorMessage = "Network error. Please check your connection.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
    }

    Alert.alert("Error", errorMessage);
  } finally {
    setIsSaving(false);
  }
};


  const handleDelete = () => {
    Alert.alert(
      "Clear Entry",
      "Are you sure you want to clear this journal entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setNote("");
            setPrompt("");
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      Alert.alert("Validation", "Please enter a title before editing.");
      return;
    }
    setIsEditing(true);
  };

  const handlePastEntriesNavigation = () => {
    router.push("/PastEntriesScreen");
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#f8f9fe" barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={isSaving}
              >
                <Feather name="chevron-left" size={28} color="#4c6ef5" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>Journal Notes</Text>
              </View>
            </View>
          </View>

          {/* Prompt input */}
          <TextInput
            style={[styles.promptInput, promptError && styles.promptInputError]}
            value={prompt}
            onChangeText={(text) => {
              setPrompt(text);
              if (text.trim()) setPromptError(false);
            }}
            placeholder="What's on your mind today?"
            placeholderTextColor="#a0aec0"
            multiline
            blurOnSubmit={false}
            returnKeyType="next"
            onSubmitEditing={() => {
              if (prompt.trim()) {
                noteInputRef.current?.focus();
                setIsEditing(true);
              }
            }}
          />

          <View style={styles.divider} />

          {/* Note input */}
          <TouchableWithoutFeedback
            onPress={() => {
              if (!prompt.trim()) {
                setPromptError(true);
                Alert.alert("Validation", "Please enter a title first.");
              } else {
                noteInputRef.current?.focus();
                setIsEditing(true);
              }
            }}
          >
            <View style={styles.entryContainer}>
              <TextInput
                ref={noteInputRef}
                style={styles.journalInput}
                value={note}
                onChangeText={setNote}
                placeholder="Pour out your thoughts here..."
                placeholderTextColor="#a0aec0"
                multiline
                editable={isEditing}
                textAlignVertical="top"
              />
            </View>
          </TouchableWithoutFeedback>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    dismissKeyboard();
                  }}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (isSaving || !prompt.trim() || !note.trim()) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={isSaving || !prompt.trim() || !note.trim()}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Entry</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={!prompt && !note}
                >
                  <Text style={styles.deleteButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    (!prompt.trim() || !note.trim()) && styles.disabledButton,
                  ]}
                  onPress={handleEdit}
                  disabled={!prompt.trim() || !note.trim()}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.pastEntriesButton}
              onPress={handlePastEntriesNavigation}
            >
              <Text style={styles.pastEntriesText}>View Past Entries →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fe",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  backButton: {
    padding: 8,
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4c6ef5",
    textAlign: "center",
  },
  promptInput: {
    fontSize: 22,
    fontWeight: "500",
    color: "#4a5568",
    textAlign: "center",
    padding: 20,
    backgroundColor: "#f0f4ff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e0e7ff",
    minHeight: 100,
    lineHeight: 30,
  },
  promptInputError: {
    borderColor: "#f87171",
    backgroundColor: "#fef2f2",
  },
  divider: {
    height: 1,
    backgroundColor: "#e8edff",
    marginVertical: 25,
  },
  entryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 25,
    minHeight: 320,
    shadowColor: "#4c6ef5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  journalInput: {
    fontSize: 19,
    lineHeight: 30,
    color: "#4a5568",
    textAlignVertical: "top",
    flex: 1,
    minHeight: 270,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#4c6ef5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 35,
    shadowColor: "#4c6ef5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  editButton: {
    backgroundColor: "#4c6ef5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 35,
    shadowColor: "#4c6ef5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  editButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#f1f3f9",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#fff1f2",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderWidth: 1,
    borderColor: "#ffe4e6",
  },
  deleteButtonText: {
    color: "#f43f5e",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    alignItems: "flex-end",
    marginTop: "auto",
  },
  pastEntriesButton: {
    padding: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
  },
  pastEntriesText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4c6ef5",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default JournalNotesScreen;