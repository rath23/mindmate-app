import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
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

const BASE_URL = "http://localhost:8080";

const journalnotesscreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [promptError, setPromptError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const noteInputRef = useRef(null);

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!prompt.trim() || !note.trim()) {
      setPromptError(!prompt.trim());
      Alert.alert("Validation", "Please fill in both the heading and body");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please login again");
        navigation.navigate("Login");
        return;
      }

      const payload = { heading: prompt, body: note };

      await axios.post(`${BASE_URL}/api/journal`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Success", "Journal saved successfully!");
      router.replace("/PastEntriesScreen")
      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);
      let errorMessage = "Failed to save journal";
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
          await AsyncStorage.removeItem("userToken");
          navigation.navigate("Login");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      Alert.alert("Validation", "Please enter a prompt first.");
      return;
    }

    Alert.alert("Confirm Delete", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          setNote("");
          setPrompt("");
          setIsEditing(false);
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      Alert.alert("Validation", "Please enter a prompt before editing.");
      return;
    }
    setIsEditing(true);
  };


  const handlePastEntriesScreenNavigation = () => {
    navigation.navigate("PastEntriesScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#f8f9fe" barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with centered title */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
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
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Enter" && prompt.trim()) {
              Keyboard.dismiss();
              noteInputRef.current?.focus();
              setIsEditing(true);
            }
          }}
        />

        <View style={styles.divider} />

        {/* Note input - larger journal area */}
        <TouchableWithoutFeedback
          onPressIn={() => {
            if (!prompt.trim()) {
              setPromptError(true);
              Alert.alert("Validation", "Please enter a prompt first.");
            } else {
              noteInputRef.current?.focus();
            }
          }}
        >
          <View style={styles.entryContainer} pointerEvents="box-none">
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
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.saveButton, 
                  isSaving && styles.disabledButton
                ]} 
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Entry"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEdit}
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
            onPress={handlePastEntriesScreenNavigation}
          >
            <Text style={styles.pastEntriesText}>View Past Entries →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    position: "relative", // Added for proper centering
  },
  backButton: {
    padding: 8,
    position: "absolute", // Position absolutely
    left: 0, // Position on left
    zIndex: 1, // Ensure it's above other elements
  },
  headerTextContainer: {
    flex: 1, // Take up all available space
    alignItems: "center", // Center horizontally
  },
  headerText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4c6ef5",
    textAlign: "center", // Center text
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
    opacity: 0.7,
  }
});

export default journalnotesscreen;