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

const BASE_URL = "http://localhost:8080";

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

  // Get JWT token
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  

  // Handle save/update
  const handleSave = async () => {
    if (!editedHeading.trim() || !editedContent.trim()) {
      Alert.alert("Validation", "Both heading and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please login again");
        return;
      }

      const payload = {
        heading: editedHeading,
        body: editedContent,
      };

      // Update existing entry
      await axios.put(`${BASE_URL}/api/journal/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Success", "Journal updated successfully!");
      // router.back()
      // setIsEditing(false);
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update journal");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please login again");
        return;
      }

      await axios.delete(`${BASE_URL}/api/journal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Deleted", "Entry deleted successfully");
      router.back();
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete the entry");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={24} color="#6C63FF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Journal</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Content Card */}
            <View style={styles.card}>
              {/* Date */}
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={18} color="#6C63FF" />
                <Text style={styles.date}>{formatDate(createdAt)}</Text>
              </View>

              {/* Heading */}
              <View style={styles.quoteContainer}>
                {/* <Feather name="star" size={18} color="#FFD166" style={styles.quoteIcon} /> */}
                {isEditing ? (
                  <TextInput
                    style={styles.quoteInput}
                    value={editedHeading}
                    onChangeText={setEditedHeading}
                    multiline
                    placeholder="Enter your heading..."
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
                    onChangeText={setEditedContent}
                    multiline
                    placeholder="Write your journal entry..."
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
                    onPress={() => setIsEditing(false)}
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
  quoteContainer: {
    backgroundColor: "rgba(255, 209, 102, 0.08)",
    borderLeftWidth: 4,
    borderLeftColor: "#FFD166",
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
  },
  quoteIcon: {
    position: "absolute",
    top: -10,
    left: -10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    borderColor: "#eee",
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A5568",
    marginRight: 15,
  },
  moodIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6C63FF",
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
