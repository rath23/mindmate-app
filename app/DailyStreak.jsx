import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";

// Configuration constants
const API_CONFIG = {
  BASE_URL: "https://mindmate-ye33.onrender.com/api",
  ENDPOINTS: {
    PROGRESS: "/user/progress",
    TASK_COMPLETED: "/user/task-completed",
  },
  TIMEOUT: 10000, // 10 seconds timeout
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const DailyStreak = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchWithTimeout = async (url, options = {}, timeout = API_CONFIG.TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const fetchProgress = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const data = await fetchWithTimeout(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROGRESS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setXp(data.xp || 0);
      setStreak(data.streak || 0);
      setDailyTasks(data.dailyTasks || []);
      
      setBadges(
        (data.unlockedBadges || []).map((badge) => ({
          name: badge.name || "Unknown Badge",
          desc: badge.description || "",
          color: [badge.colorStart || "#CBD5E0", badge.colorEnd || "#A0AEC0"],
          unlocked: badge.unlocked || false,
        }))
      );
    } catch (error) {
      console.error("Error fetching progress:", error);
      setError(error.message || "Failed to fetch progress data");
      
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Could not load your progress data",
        position: "bottom",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleTaskComplete = async (taskId) => {
    if (!taskId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid task ID",
        position: "bottom",
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      await fetchWithTimeout(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TASK_COMPLETED}/${taskId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchProgress();

      Toast.show({
        type: "success",
        text1: "Task Completed!",
        text2: "Great job on taking care of your wellness 💪",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error completing task:", error);
      
      let errorMessage = "Failed to complete task";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Network request failed")) {
        errorMessage = "Network error. Please check your connection.";
      }

      Toast.show({
        type: "error",
        text1: "Oops!",
        text2: errorMessage,
        position: "bottom",
      });
    }
  };

  const getBadgeIcon = (unlocked) => {
    return unlocked ? "military-tech" : "lock";
  };

  const getIconColor = (unlocked) => {
    return unlocked ? "#FFD700" : "#A0AEC0";
  };

  const actionableTasks = dailyTasks.filter(
    (task) =>
      task?.taskText &&
      !task.taskText
        .toLowerCase()
        .includes("here are 3 daily mental wellness tasks")
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text>Loading your progress...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Icon name="error-outline" size={48} color="#E53E3E" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProgress}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#f7f9fc", "#eef2f7"]}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header with Back Button */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Icon name="chevron-left" size={32} color="#2D3748" />
                </TouchableOpacity>
                <Text style={styles.title}>Daily Check-In Streak</Text>
                <View style={{ width: 32 }} />
              </View>
              <LinearGradient
                colors={["#FF9E44", "#FF7A00"]}
                style={styles.streakContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.streakText}>{streak} days</Text>
                <View style={styles.fireIcon}>
                  <Icon name="whatshot" size={24} color="#FFF" />
                </View>
              </LinearGradient>
            </View>

            {/* XP Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Earned Wellness XP</Text>
              <Animated.View
                style={[styles.xpContainer, { transform: [{ scale: pulseAnim }] }]}
              >
                <Text style={styles.xpText}>{xp}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </Animated.View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={["#5A8EFF", "#3A5BFF"]}
                  style={[styles.progressFill, { width: `${Math.min(100, (xp % 1000) / 10)}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>

            {/* Badges */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Unlockable Badges</Text>
              {badges.length === 0 ? (
                <Text style={styles.emptyMessage}>No badges available</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.badgesContainer}
                >
                  {badges.map((badge, index) => (
                    <LinearGradient
                      key={index}
                      colors={badge.unlocked ? badge.color : ["#CBD5E0", "#A0AEC0"]}
                      style={[styles.badge, !badge.unlocked && styles.lockedBadge]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Icon
                        name={getBadgeIcon(badge.unlocked)}
                        size={28}
                        color={getIconColor(badge.unlocked)}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          !badge.unlocked && styles.lockedBadgeText,
                        ]}
                      >
                        {badge.name}
                      </Text>
                    </LinearGradient>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Daily Tasks */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Tasks</Text>
              {actionableTasks.length === 0 ? (
                <Text style={styles.emptyMessage}>No tasks available today</Text>
              ) : (
                actionableTasks.map((task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <Text style={styles.taskText}>{task.taskText}</Text>
                    {task.completed ? (
                      <View style={styles.completedBadge}>
                        <Icon name="check" size={20} color="#FFF" />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => handleTaskComplete(task.id)}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </LinearGradient>
        <Toast />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  background: { 
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  scrollContent: {
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc"
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f9fc"
  },
  errorText: {
    fontSize: 16,
    color: "#E53E3E",
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#5A8EFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#718096",
    marginVertical: 10,
  },
  header: { 
    marginBottom: 25, 
    alignItems: "center" 
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
    textAlign: "center",
  },
  streakContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  streakText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginRight: 10,
  },
  fireIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    padding: 5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#A0AEC0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 15,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 15,
  },
  xpText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#2D3748",
  },
  xpLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5A8EFF",
    marginLeft: 8,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#EDF2F7",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  badgesContainer: {
    paddingVertical: 5,
  },
  badge: {
    width: screenWidth * 0.4,
    height: 120,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginRight: 12,
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  lockedBadgeText: {
    color: "#F7FAFC",
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: "#4A5568",
    marginRight: 10,
  },
  doneButton: {
    backgroundColor: "#5A8EFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  doneButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: "#4CD964",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DailyStreak;