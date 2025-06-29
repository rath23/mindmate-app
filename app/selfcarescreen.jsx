import { Feather, Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

const SelfCareScreen = () => {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestion = async () => {
    try {
      setRefreshing(true);

      const cachedData = await AsyncStorage.getItem("selfCareSuggestion");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        if (new Date().getTime() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
          setSuggestion(parsedData.data);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/user/ai-suggest",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Suggestions:", data);
      setSuggestion(data);

      await AsyncStorage.setItem(
        "selfCareSuggestion",
        JSON.stringify({ data, timestamp: new Date().getTime() })
      );
    } catch (err) {
      setError("Failed to fetch suggestions. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestion();
  }, []);

  const onRefresh = () => {
    fetchSuggestion();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>
            Finding the perfect self-care activity for you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6C63FF"]}
            />
          }
        >
          <Ionicons name="sad-outline" size={60} color="#EF476F" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSuggestion}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const firstSuggestion = suggestion?.suggestions?.[0];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={24} color="#2D3748" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C63FF"]}
          />
        }
      >
        <Text style={styles.header}>Self Care Recommendation</Text>
        <Text style={styles.subHeader}>Personalized just for you</Text>

        {firstSuggestion && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.emoji}>{firstSuggestion.emoji}</Text>
              <View>
                <Text style={styles.cardTitle}>{firstSuggestion.title}</Text>
                <Text style={styles.cardCategory}>{firstSuggestion.type}</Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.contentTitle}>How to practice:</Text>
              <Text style={styles.contentText}>{firstSuggestion.content}</Text>
            </View>

            <View style={styles.benefitContainer}>
              <Ionicons
                name="sparkles"
                size={24}
                color="#FFD166"
                style={styles.benefitIcon}
              />
              <Text style={styles.benefitText}>Why this helps:</Text>
            </View>
            <Text style={styles.benefitDescription}>
              {firstSuggestion.reason}
            </Text>
          </View>
        )}

        <View style={styles.tipContainer}>
          <Ionicons name="bulb" size={24} color="#FFD166" />
          <Text style={styles.tipText}>
            For best results, practice this activity in a quiet space without
            distractions.
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#6C63FF" />
          <Text style={styles.refreshButtonText}>Get New Suggestion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    fontSize: 18,
    color: "#4A5568",
    marginTop: 20,
    textAlign: "center",
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
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 5,
  },
  cardCategory: {
    fontSize: 16,
    color: "#6C63FF",
    fontWeight: "600",
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  contentContainer: {
    marginBottom: 25,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
  },
  benefitContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  benefitDescription: {
    fontSize: 16,
    color: "#4A5568",
    lineHeight: 24,
    paddingLeft: 34,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 209, 102, 0.15)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: "#B45309",
    marginLeft: 12,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(108, 99, 255, 0.1)",
  },
  refreshButtonText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
backButton: {
  position: "absolute",
  top: 15,
  left: 15,
  zIndex: 10,
},

});

export default SelfCareScreen;
