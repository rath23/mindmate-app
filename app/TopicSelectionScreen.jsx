import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Configurable constants
const TOPIC_CONFIG = {
  BASE_URL: "http://localhost:8080/api", // Can be changed later
  ENDPOINTS: {
    TOPICS: "/topics",
  },
};

const TopicSelectionScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topics, setTopics] = useState([
    { id: 1, name: "Anxiety", icon: "activity", color: "#6366F1" },
    { id: 2, name: "Student Life", icon: "book", color: "#06D6A0" },
    { id: 3, name: "Relationships", icon: "heart", color: "#EF476F" },
    { id: 4, name: "Loneliness", icon: "user", color: "#FF9E6D" },
    { id: 5, name: "Depression", icon: "cloud", color: "#118AB2" },
    { id: 6, name: "Self-Improvement", icon: "trending-up", color: "#FFD166" },
  ]);

  // Fetch topics from API if needed
  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${TOPIC_CONFIG.BASE_URL}${TOPIC_CONFIG.ENDPOINTS.TOPICS}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setError("Failed to load topics. Using default topics instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicPress = (topicName) => {
    try {
      const slug = topicName.toLowerCase().replace(/\s+/g, "-");
      if (!slug) throw new Error("Invalid topic name");
      router.push(`/group/${slug}`);
    } catch (err) {
      console.error("Error navigating to topic:", err);
      setError("Couldn't navigate to topic. Please try again.");
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#EF476F" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTopics}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.retryButtonText}>Retry</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          accessibilityLabel="Support community topics list"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityHint="Navigates to previous screen"
            >
              <Feather name="arrow-left" size={24} color="#6C63FF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Find Your Support Community</Text>
              <Text style={styles.subtitle}>
                Join anonymous group discussions on mental health topics
              </Text>
            </View>
          </View>

          {/* Badge */}
          <View style={styles.anonymityBadge}>
            <Feather name="lock" size={16} color="#6C63FF" />
            <Text style={styles.anonymityText}>Your identity is protected</Text>
          </View>

          {/* Topic Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C63FF" />
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicCard, { backgroundColor: topic.color }]}
                  activeOpacity={0.85}
                  onPress={() => handleTopicPress(topic.name)}
                  accessibilityLabel={`${topic.name} support group`}
                  accessibilityHint={`Navigates to ${topic.name} discussion group`}
                >
                  <View style={styles.iconContainer}>
                    <Feather name={topic.icon} size={28} color="#fff" />
                  </View>
                  <Text style={styles.topicText}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Footer Message */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Feather name="users" size={20} color="#6C63FF" />
            </View>
            <Text style={styles.footerText}>
              Take the first step towards better mental health
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");
const cardSize = (width - 60) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  errorText: {
    fontSize: 18,
    color: "#2D3748",
    textAlign: "center",
    marginVertical: 20,
    lineHeight: 26,
  },
  loadingContainer: {
    height: cardSize * 3, // Approximate height of the grid
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 12,
    marginRight: 15,
    marginTop: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 6,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 15,
    color: "#4A5568",
    lineHeight: 21,
  },
  anonymityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 25,
    alignSelf: "flex-start",
  },
  anonymityText: {
    color: "#6C63FF",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  topicCard: {
    width: cardSize,
    height: cardSize * 0.9,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  topicText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  footerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(108, 99, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 15,
    color: "#4A5568",
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#6C63FF",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TopicSelectionScreen;