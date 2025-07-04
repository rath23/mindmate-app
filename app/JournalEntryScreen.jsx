import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  ENDPOINTS: {
    JOURNAL: "/journal",
  },
  TIMEOUT: 10000, // 10 seconds
};

const JournalEntryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, heading, body, createdAt, editMode } = params;

  // State management
  const [isEditing, setIsEditing] = useState(editMode === "true");
  const [editedHeading, setEditedHeading] = useState(heading || "");
  const [editedContent, setEditedContent] = useState(body || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Get JWT token with error handling
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

  // Handle save/update with validation
  const handleSave = async () => {
    try {
      // Validate inputs
      if (!editedHeading.trim()) {
        setValidationError("Heading is required");
        return;
      }
      if (!editedContent.trim()) {
        setValidationError("Content is required");
        return;
      }
      setValidationError("");

      setIsSaving(true);
      const token = await getAuthToken();

      const payload = {
        heading: editedHeading,
        body: editedContent,
      };

      const response = await axios({
        method: "put",
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}/${id}`,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      Alert.alert("Success", "Journal updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace({
              pathname: "/journal/[id]",
              params: {
                id,
                heading: editedHeading,
                body: editedContent,
                createdAt,
                editMode: "false",
              },
            });
            setIsEditing(false);
          },
        },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Failed to update journal";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this journal entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              const token = await getAuthToken();

              await axios({
                method: "delete",
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}/${id}`,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                timeout: API_CONFIG.TIMEOUT,
              });

              Alert.alert("Success", "Entry deleted successfully", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error("Delete error:", error);
              let errorMessage = "Failed to delete the entry";
              
              if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
              } else if (error.request) {
                errorMessage = "Network error. Please check your connection.";
              }

              Alert.alert("Error", errorMessage);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "No date";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isSaving || isDeleting}
              >
                <Feather name="arrow-left" size={24} color="#6C63FF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {isEditing ? "Edit Journal" : "Journal Entry"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Content Card */}
            <View style={styles.card}>
              {/* Date */}
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={18} color="#6C63FF" />
                <Text style={styles.date}>{formatDate(createdAt)}</Text>
              </View>

              {/* Validation Error */}
              {validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}

              {/* Heading */}
              <View style={styles.quoteContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.quoteInput}
                    value={editedHeading}
                    onChangeText={(text) => {
                      setEditedHeading(text);
                      if (validationError) setValidationError("");
                    }}
                    multiline
                    placeholder="Enter your heading..."
                    placeholderTextColor="#A0AEC0"
                    maxLength={200}
                  />
                ) : (
                  <Text style={styles.quote}>{editedHeading}</Text>
                )}
              </View>

              {/* Body Text */}
              <View style={styles.contentContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.contentInput}
                    value={editedContent}
                    onChangeText={(text) => {
                      setEditedContent(text);
                      if (validationError) setValidationError("");
                    }}
                    multiline
                    placeholder="Write your journal entry..."
                    placeholderTextColor="#A0AEC0"
                    textAlignVertical="top"
                  />
                ) : (
                  <Text style={styles.bodyText}>{editedContent}</Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Feather name="save" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setValidationError("");
                      setEditedHeading(heading || "");
                      setEditedContent(body || "");
                    }}
                    disabled={isSaving}
                  >
                    <Feather name="x" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                    disabled={isDeleting}
                  >
                    <Feather name="edit-3" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Edit Entry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Feather name="trash-2" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Delete Entry</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "rgba(108, 99, 255, 0.05)",
    padding: 12,
    borderRadius: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6C63FF",
    marginLeft: 10,
  },
  errorText: {
    color: "#EF476F",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  quoteContainer: {
    backgroundColor: "rgba(255, 209, 102, 0.08)",
    borderLeftWidth: 4,
    borderLeftColor: "#FFD166",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
  },
  quote: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#2D3748",
    lineHeight: 26,
  },
  quoteInput: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "italic",
    color: "#2D3748",
    lineHeight: 26,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contentContainer: {
    marginBottom: 30,
  },
  bodyText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 26,
  },
  contentInput: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 26,
    padding: 15,
    minHeight: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 15,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#6C63FF",
  },
  deleteButton: {
    backgroundColor: "#EF476F",
  },
  saveButton: {
    backgroundColor: "#06D6A0",
  },
  cancelButton: {
    backgroundColor: "#4A5568",
  },
});

export default JournalEntryScreen;