import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://mindmate-ye33.onrender.com/api",
  ENDPOINTS: {
    MOOD: "/mood",
  },
  TIMEOUT: 10000, // 10 seconds
};

// Mood enum matching backend values
const MoodType = {
  VERY_HAPPY: "VERY_HAPPY",
  HAPPY: "HAPPY",
  NEUTRAL: "NEUTRAL",
  SAD: "SAD",
  VERY_SAD: "VERY_SAD",
};

const MoodCheckInScreen = () => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState("");
  const [showDisabledMessage, setShowDisabledMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);

  // Emojis mapped to enum values with descriptions
  const moodOptions = [
    { emoji: "😄", value: MoodType.VERY_HAPPY, description: "Very Happy" },
    { emoji: "🙂", value: MoodType.HAPPY, description: "Happy" },
    { emoji: "😐", value: MoodType.NEUTRAL, description: "Neutral" },
    { emoji: "🙁", value: MoodType.SAD, description: "Sad" },
    { emoji: "😢", value: MoodType.VERY_SAD, description: "Very Sad" },
  ];

  // Tags with categories
  const tagOptions = [
    { name: "anxious", category: "negative" },
    { name: "calm", category: "positive" },
    { name: "happy", category: "positive" },
    { name: "energetic", category: "positive" },
    { name: "tired", category: "neutral" },
    { name: "sad", category: "negative" },
    { name: "stressed", category: "negative" },
    { name: "focused", category: "positive" },
    { name: "relaxed", category: "positive" },
  ];

  useEffect(() => {
    checkPreviousSubmission();
  }, []);

const checkPreviousSubmission = async () => {
  try {
    const userJson = await AsyncStorage.getItem("user");
    const user = JSON.parse(userJson);
    const userId = user?.id;

    if (!userId) return;

    const lastSubmission = await AsyncStorage.getItem(`lastMoodSubmission_${userId}`);
    if (lastSubmission) {
      const lastDate = new Date(lastSubmission);
      const today = new Date();
      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        setHasSubmittedToday(true);
        setLastSubmissionTime(lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  } catch (error) {
    console.error("Error checking previous submission:", error);
  }
};


  const toggleTag = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async () => {
    if (selectedMood === null) {
      setShowDisabledMessage(true);
      setTimeout(() => setShowDisabledMessage(false), 3000);
      return;
    }

    if (hasSubmittedToday) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMood();
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitMood = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const payload = {
        mood: selectedMood,
        tags: selectedTags,
        note: note,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT
      );

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOOD}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 200 || response.status === 201) {
        // Store submission time
        const userJson = await AsyncStorage.getItem("user");
        const user = JSON.parse(userJson);
        const userId = user?.id;

        if (userId) {
          await AsyncStorage.setItem(
            `lastMoodSubmission_${userId}`,
            new Date().toISOString()
          );
        }


        // Update UI state
        setHasSubmittedToday(true);
        setLastSubmissionTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Clear cached dashboard data
        await SecureStore.deleteItemAsync("dashboardData");
        resetForm();
        
        router.replace("/selfcarescreen");
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Failed to submit mood";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      Alert.alert("Error", errorMessage);
    }
  };

  const resetForm = () => {
    setSelectedMood(null);
    setSelectedTags([]);
    setNote("");
    setShowDisabledMessage(false);
  };

  const getTagStyle = (tagName) => {
    const tag = tagOptions.find((t) => t.name === tagName);
    if (!tag) return styles.tag;

    return [
      styles.tag,
      selectedTags.includes(tagName) && styles.selectedTag,
      tag.category === "positive" && styles.positiveTag,
      tag.category === "negative" && styles.negativeTag,
      selectedTags.includes(tagName) &&
        tag.category === "positive" &&
        styles.selectedPositiveTag,
      selectedTags.includes(tagName) &&
        tag.category === "negative" &&
        styles.selectedNegativeTag,
    ];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#f8fafc"
        barStyle="dark-content"
        translucent={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="chevron-left" size={28} color="#4a5568" />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Daily Mood Check-In</Text>
              <Text style={styles.time}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          {hasSubmittedToday ? (
            <View style={styles.submittedContainer}>
              <View style={styles.submissionNotice}>
                <Ionicons name="checkmark-circle" size={24} color="#38a169" />
                <Text style={styles.submissionNoticeText}>
                  You've already submitted your mood today at {lastSubmissionTime}
                </Text>
              </View>
              <Text style={styles.submittedMessage}>
                Come back tomorrow for your next check-in!
              </Text>
            </View>
          ) : (
            <>
              {/* Mood Selection */}
              <Text style={styles.question}>How are you feeling today?</Text>

              <View style={styles.emojiContainer}>
                {moodOptions.map((moodOption) => (
                  <TouchableOpacity
                    key={moodOption.value}
                    style={[
                      styles.emojiButton,
                      selectedMood === moodOption.value && styles.selectedEmoji,
                    ]}
                    onPress={() => {
                      setSelectedMood(moodOption.value);
                      setShowDisabledMessage(false);
                    }}
                  >
                    <Text style={styles.emoji}>{moodOption.emoji}</Text>
                    <Text style={styles.emojiDescription}>
                      {moodOption.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tags Section */}
              <Text style={styles.sectionTitle}>
                What best describes your mood? (Select up to 3)
              </Text>

              <View style={styles.tagsContainer}>
                {tagOptions.map((tag) => (
                  <TouchableOpacity
                    key={tag.name}
                    style={getTagStyle(tag.name)}
                    onPress={() => toggleTag(tag.name)}
                    disabled={
                      selectedTags.length >= 3 && !selectedTags.includes(tag.name)
                    }
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag.name) && styles.selectedTagText,
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note Section */}
              <Text style={styles.noteLabel}>
                Optional: What's influencing your mood today?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Type your thoughts here..."
                placeholderTextColor="#a0aec0"
                multiline
                numberOfLines={4}
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedMood === null && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={selectedMood === null || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitText}>Submit Mood</Text>
                )}
              </TouchableOpacity>

              {/* Validation Message */}
              {showDisabledMessage && (
                <View style={styles.messageContainer}>
                  <Ionicons name="information-circle" size={20} color="#e53e3e" />
                  <Text style={styles.disabledText}>
                    Please select a mood to submit your check-in
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 6,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: "#718096",
  },
  submittedContainer: {
    marginBottom: 32,
  },
  submissionNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c6f6d5",
    marginBottom: 12,
  },
  submissionNoticeText: {
    color: "#38a169",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  submittedMessage: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 24,
    textAlign: "center",
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    flexWrap: "wrap",
  },
  emojiButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf2f7",
    borderRadius: 16,
    padding: 12,
    width: "18%",
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  selectedEmoji: {
    backgroundColor: "#ebf4ff",
    borderColor: "#90cdf4",
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
  },
  disabledEmoji: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  emojiDescription: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 28,
  },
  tag: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#edf2f7",
  },
  positiveTag: {
    borderColor: "#9ae6b4",
    backgroundColor: "#f0fff4",
  },
  negativeTag: {
    borderColor: "#fed7d7",
    backgroundColor: "#fff5f5",
  },
  selectedTag: {
    borderWidth: 2,
  },
  selectedPositiveTag: {
    borderColor: "#48bb78",
    backgroundColor: "#c6f6d5",
  },
  selectedNegativeTag: {
    borderColor: "#f56565",
    backgroundColor: "#fed7d7",
  },
  disabledTag: {
    opacity: 0.5,
    backgroundColor: "#edf2f7",
  },
  tagText: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  selectedTagText: {
    fontWeight: "600",
  },
  disabledTagText: {
    color: "#a0aec0",
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: "#2d3748",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledInput: {
    backgroundColor: "#f8fafc",
    color: "#a0aec0",
  },
  submitButton: {
    backgroundColor: "#4299e1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4299e1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#e2e8f0",
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledText: {
    color: "#e53e3e",
    fontSize: 14,
    marginLeft: 6,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
});

export default MoodCheckInScreen;