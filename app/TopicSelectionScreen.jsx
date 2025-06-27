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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f0f4ff", "#e6e9ff"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
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

          {/* Anonymity Badge */}
          <View style={styles.anonymityBadge}>
            <Feather name="lock" size={16} color="#6C63FF" />
            <Text style={styles.anonymityText}>Your identity is protected</Text>
          </View>

          {/* Topics Grid */}
          <View style={styles.gridContainer}>
            {topics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicCard, { backgroundColor: topic.color }]}
                activeOpacity={0.9}
              >
                <View style={styles.iconContainer}>
                  <Feather name={topic.icon} size={32} color="#fff" />
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
    paddingTop: 30,
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
    fontSize: 26,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 22,
  },
  anonymityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  anonymityText: {
    color: "#6C63FF",
    fontWeight: "500",
    fontSize: 15,
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  topicCard: {
    width: cardSize,
    height: cardSize,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  topicText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  footerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(108, 99, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
});

export default TopicSelectionScreen;