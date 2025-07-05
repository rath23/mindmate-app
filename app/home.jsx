import { Feather } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const DashboardScreen = () => {
  const CACHE_KEY = "dashboardData";
  const CACHE_DURATION = 30 * 60 * 1000; 
  const [menuVisible, setMenuVisible] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const router = useRouter();

  // Mood options mapping
  const moodOptions = [
    { emoji: "😄", value: "VERY_HAPPY", label: "Very Happy" },
    { emoji: "🙂", value: "HAPPY", label: "Happy" },
    { emoji: "😐", value: "NEUTRAL", label: "Neutral" },
    { emoji: "🙁", value: "SAD", label: "Sad" },
    { emoji: "😢", value: "VERY_SAD", label: "Very Sad" },
  ];



const fetchDashboardData = async (forceRefresh = false) => {
  try {
    setLoading(true);

    if (forceRefresh) {
      await SecureStore.deleteItemAsync(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_KEY);
    }

    const cachedData = await SecureStore.getItemAsync(CACHE_KEY);
    let shouldUseCache = false;

    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setDashboardData(data);
          shouldUseCache = true;
        }
      } catch (e) {
        console.warn("Failed to parse cached dashboard data", e);
      }
    }

    const token = await AsyncStorage.getItem("token");

    const response = await fetch("https://mindmate-ye33.onrender.com/api/user/home", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const freshData = await response.json();

      // Don't cache if suggestions are missing or backend sent a warning structure
      if (freshData?.suggestions?.length > 0 || freshData?.todayMood) {
        const cachePayload = JSON.stringify({
          data: freshData,
          timestamp: Date.now(),
        });

        await SecureStore.setItemAsync(CACHE_KEY, cachePayload);
        await AsyncStorage.setItem(CACHE_KEY, cachePayload);
      }

      setDashboardData(freshData);

    } else {
      const msg = await response.text();
      console.warn("Failed to fetch fresh data:", msg);

      if (!shouldUseCache) {
        throw new Error("Server error: " + msg);
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);

    if (!dashboardData) {
      try {
        const fallbackData = await AsyncStorage.getItem(CACHE_KEY);
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          setDashboardData(parsed.data);
          console.log("Used AsyncStorage fallback for dashboard data.");
          await AsyncStorage.removeItem(CACHE_KEY); // Clean up fallback
        }
      } catch (e) {
        console.error("Failed to use fallback from AsyncStorage", e);
      }
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };



  useEffect(() => {
    fetchDashboardData();
  }, []);

  const clearDashboardCache = async () => {
  try {
    await SecureStore.deleteItemAsync("dashboardData");
    await AsyncStorage.removeItem("dashboardData");
  } catch (err) {
    console.warn("Failed to clear cache:", err);
  }
};


  const handleMenuPress = async (action) => {
    setMenuVisible(false);
    switch (action) {
      case "profile":
        router.push("/ProfileScreen");
        break;
      case "moodAnalysis":
        router.push("/moodanalysisscreen");
        break;
      case "settings":
        router.push("/settingscreen");
        break;
      case "logout":
        await clearDashboardCache(); 
        await logout();
        router.replace("/login");
        break;
    }
  };

  // Mood Card Component
  const MoodCard = () => {
    if (loading) {
      return (
        <View style={styles.moodCard}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <Text style={styles.moodCardText}>Loading your mood...</Text>
        </View>
      );
    }

    if (!dashboardData?.todayMood) {
      return (
        <TouchableOpacity
          style={styles.moodCard}
          onPress={() => router.push("/moodcheckinscreen")}
        >
          <Text style={styles.moodCardEmoji}>📝</Text>
          <Text style={styles.moodCardText}>Log your mood today</Text>
          <Feather name="chevron-right" size={20} color="#718096" />
        </TouchableOpacity>
      );
    }

    const moodData = moodOptions.find(
      (option) => option.value === dashboardData.todayMood
    );

    return (
      <View style={styles.moodCard}>
        <Text style={styles.moodCardEmoji}>{moodData?.emoji || "😐"}</Text>
        <View style={styles.moodCardContent}>
          <Text style={styles.moodCardLabel}>Today's Mood</Text>
          <Text style={styles.moodCardValue}>
            {moodData?.label || "Neutral"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editMoodButton}
          onPress={() => router.push("/moodcheckinscreen")}
        >
          <Feather name="edit" size={16} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    );
  };

  // Stats Card Component
  const StatsCard = () => {
    if (loading) {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
          <View style={styles.statCard}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Streak</Text>
          <View style={styles.streakCircle}>
            <Text style={styles.streakText}>{dashboardData?.streak || 0}</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>XP Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    Math.floor((dashboardData?.xp || 0) / 3)
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {dashboardData?.xp || 0} XP collected
          </Text>
        </View>
      </View>
    );
  };

  // Suggestion Card Component
  const SuggestionCard = ({ suggestion }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() =>
        router.push({
          pathname: "/selfcarescreen",
          params: { suggestion: JSON.stringify(suggestion) },
        })
      }
    >
      <Text style={styles.suggestionIcon}>{suggestion?.emoji || "💡"}</Text>
      <Text
        style={styles.suggestionTitle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {suggestion?.title || "Self-Care Tip"}
      </Text>
      <Text style={styles.suggestionType}>
        {suggestion?.type || "Activity"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor="#f8f9fe"
          barStyle="dark-content"
          translucent={true}
        />

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.absoluteDropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleMenuPress("profile")}
            >
              <Feather
                name="user"
                size={18}
                color="#2d3748"
                style={styles.dropdownIcon}
              />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleMenuPress("settings")}
            >
              <Feather
                name="settings"
                size={18}
                color="#2d3748"
                style={styles.dropdownIcon}
              />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity> */}
                        <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleMenuPress("moodAnalysis")}
            >
              <Ionicons
                name="analytics"
                size={18}
                color="#2d3748"
                style={styles.dropdownIcon}
              />
              <Text style={styles.dropdownText}>Mood Analysis</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleMenuPress("logout")}
            >
              <Feather
                name="log-out"
                size={18}
                color="#e53e3e"
                style={styles.dropdownIcon}
              />
              <Text style={[styles.dropdownText, { color: "#e53e3e" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#6C63FF"]}
              tintColor="#6C63FF"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name}</Text>
              <Text style={styles.date}>Today</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Feather name="more-vertical" size={24} color="#2d3748" />
            </TouchableOpacity>
          </View>

          {/* Mood Card */}
          <MoodCard />

          {/* Self-Care Suggestions */}
          <Text style={styles.sectionTitle}>Self-Care Suggestions</Text>

          {loading ? (
            <View style={styles.suggestionsContainer}>
              {[1, 2, 3].map((_, index) => (
                <View
                  key={index}
                  style={[styles.suggestionCard, styles.loadingCard]}
                >
                  <ActivityIndicator size="small" color="#6C63FF" />
                </View>
              ))}
            </View>
          ) : dashboardData?.suggestions?.length > 0 ? (
            <View style={styles.suggestionsContainer}>
              {dashboardData.suggestions
                .slice(0, 3)
                .map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} />
                ))}
            </View>
          ) : (
            <Text style={styles.noSuggestionsText}>
              No suggestions available today
            </Text>
          )}

          {/* Stats Container */}
          <StatsCard />

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <ActionButton
              text="Mood Check-In"
              onPress={() => router.push("/moodcheckinscreen")}
            />
            <ActionButton
              text="Journal"
              onPress={() => router.push("/journalnotesscreen")}
            />
            <ActionButton
              text="Talk to"
              onPress={() => router.push("/TopicSelectionScreen")}
            />
            <ActionButton
              text="Progress"
              onPress={() => router.push("/DailyStreak")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// Action Button Component
const ActionButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fe",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3748",
  },
  date: {
    fontSize: 18,
    color: "#718096",
    marginTop: 4,
  },
  moodCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  moodCardEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  moodCardContent: {
    flex: 1,
  },
  moodCardLabel: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 4,
  },
  moodCardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
  },
  moodCardText: {
    fontSize: 16,
    color: "#4a5568",
    marginLeft: 12,
    flex: 1,
  },
  editMoodButton: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 16,
  },
  suggestionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  suggestionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 140,
  },
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 4,
    width: "100%",
  },
  suggestionType: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 15,
  },
  streakCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ebf4ff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  streakText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3b82f6",
  },
  streakLabel: {
    fontSize: 16,
    color: "#718096",
    marginTop: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
  },
  absoluteDropdown: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  noSuggestionsText: {
    color: "#718096",
    textAlign: "center",
    marginBottom: 30,
    fontSize: 16,
  },
});

export default DashboardScreen;
