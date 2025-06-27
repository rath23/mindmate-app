import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TopicSelectionScreen = () => {
  const topics = [
    { id: 1, name: "Anxiety", icon: "activity", color: "#6366F1" },
    { id: 2, name: "Student Life", icon: "book", color: "#06D6A0" },
    { id: 3, name: "Relationships", icon: "heart", color: "#EF476F" },
    { id: 4, name: "Loneliness", icon: "user", color: "#FF9E6D" },
    { id: 5, name: "Depression", icon: "cloud", color: "#118AB2" },
    { id: 6, name: "Self-Improvement", icon: "trending-up", color: "#FFD166" },
  ];

const handleTopicPress = (topicName) => {
    router.push(`/group/${topicName.toLowerCase().replace(/\s+/g, "-")}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

          {/* Grid */}
          <View style={styles.gridContainer}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicCard, { backgroundColor: topic.color }]}
                activeOpacity={0.85}
                onPress={() => handleTopicPress(topic.name)}
              >
                <View style={styles.iconContainer}>
                  <Feather name={topic.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.topicText}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
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
    height: cardSize * 0.9, // Reduced height
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
});

export default TopicSelectionScreen;
