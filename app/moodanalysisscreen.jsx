import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";

// Configuration constants
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  ENDPOINTS: {
    MOOD_ANALYTICS: "/mood/analytics"
  },
  TIMEOUT: 10000 // 10 seconds
};

const MoodAnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filterByTag, setFilterByTag] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('15days');
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

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

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOOD_ANALYTICS}?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "Failed to load data");
      
      if (error.message.includes("Authentication")) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const moodToNumber = {
    VERY_SAD: 1,
    SAD: 2,
    NEUTRAL: 3,
    HAPPY: 4,
    VERY_HAPPY: 5,
    null: 0,
  };

  const moodEmojis = {
    1: "😢",
    2: "🙁",
    3: "😐",
    4: "🙂",
    5: "😄",
    0: "❓"
  };

  const formatGraphData = () => {
    const moodArray = analyticsData?.moodData || [];
    const labels = moodArray.map((entry) => {
      if (timeRange === '7days') {
        return new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeRange === '30days') {
        return new Date(entry.date).getDate().toString();
      }
      return entry.date.slice(5); // MM-DD for default 15 days
    });
    
    const data = moodArray.map((entry) => moodToNumber[entry.mood || "null"]);
    
    return { labels, data };
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <TouchableOpacity 
        style={[styles.timeRangeButton, timeRange === '7days' && styles.activeTimeRange]}
        onPress={() => setTimeRange('7days')}
      >
        <Text style={[styles.timeRangeText, timeRange === '7days' && styles.activeTimeRangeText]}>7D</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.timeRangeButton, timeRange === '15days' && styles.activeTimeRange]}
        onPress={() => setTimeRange('15days')}
      >
        <Text style={[styles.timeRangeText, timeRange === '15days' && styles.activeTimeRangeText]}>15D</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.timeRangeButton, timeRange === '30days' && styles.activeTimeRange]}
        onPress={() => setTimeRange('30days')}
      >
        <Text style={[styles.timeRangeText, timeRange === '30days' && styles.activeTimeRangeText]}>30D</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMoodGraph = () => {
    if (isLoading) {
      return (
        <View style={styles.graphPlaceholder}>
          <ActivityIndicator size="large" color="#4c6ef5" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.graphPlaceholder}>
          <MaterialCommunityIcons name="chart-line" size={40} color="#a0aec0" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAnalyticsData}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const { labels, data } = formatGraphData();
    const chartWidth = Math.max(screenWidth * 1.5, labels.length * 40);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels,
            datasets: [{ 
              data,
              color: (opacity = 1) => `rgba(76, 110, 245, ${opacity})`,
              strokeWidth: 2
            }],
          }}
          width={chartWidth}
          height={220}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#f8f9fe",
            backgroundGradientTo: "#f8f9fe",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 110, 245, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#fff"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            paddingRight: 20
          }}
          formatYLabel={(value) => moodEmojis[value] || value}
        />
      </ScrollView>
    );
  };

  const renderTagFilter = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setFilterByTag(!filterByTag)}
    >
      <View style={[styles.checkbox, filterByTag && styles.checkedBox]}>
        {filterByTag && <Feather name="check" size={16} color="#fff" />}
      </View>
      <Text style={styles.filterText}>Show only frequent tags (5+ entries)</Text>
    </TouchableOpacity>
  );

  const renderTopTags = () => {
    if (!analyticsData?.topTags) return null;
    
    const tags = Object.entries(analyticsData.topTags)
      .filter(([_, count]) => !filterByTag || count >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (tags.length === 0) {
      return (
        <Text style={styles.noTagsText}>
          {filterByTag ? "No frequent tags found" : "No tags recorded yet"}
        </Text>
      );
    }

    return tags.map(([tag, count], index) => (
      <View key={tag} style={styles.tagItem}>
        <View style={styles.tagBullet} />
        <Text style={styles.tagText}>
          {tag} <Text style={styles.tagCount}>({count})</Text>
        </Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#f8f9fe"
        barStyle="dark-content"
        translucent={true}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={28} color="#4c6ef5" />
          </TouchableOpacity>
          <Text style={styles.header}>Mood Insights</Text>
          <View style={{ width: 28 }} /> {/* Spacer for alignment */}
        </View>

        {/* Mood Over Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Mood Journey</Text>
            {renderTimeRangeSelector()}
          </View>

          <Text style={styles.axisLabel}>
            {timeRange === '7days' ? 'Day of week' : 
             timeRange === '30days' ? 'Day of month' : 'Date (MM-DD)'}
          </Text>

          <View style={styles.divider} />

          {renderMoodGraph()}

          <View style={styles.divider} />

          {/* Mood Legend */}
          <Text style={styles.sectionSubtitle}>Mood Scale</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <Text style={styles.legendEmoji}>😢</Text>
              <Text style={styles.legendLabel}>Very Sad</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendEmoji}>🙁</Text>
              <Text style={styles.legendLabel}>Sad</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendEmoji}>😐</Text>
              <Text style={styles.legendLabel}>Neutral</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendEmoji}>🙂</Text>
              <Text style={styles.legendLabel}>Happy</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendEmoji}>😄</Text>
              <Text style={styles.legendLabel}>Very Happy</Text>
            </View>
          </View>
        </View>

        {/* Most Common Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Frequent Mood Tags</Text>
          <Text style={styles.sectionDescription}>
            Tags you've frequently associated with your mood entries
          </Text>

          <View style={styles.tagsContainer}>
            {renderTopTags()}
          </View>

          {renderTagFilter()}
        </View>

        {/* Mood Streak */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mood Logging Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>
              {analyticsData?.currentStreakDays ?? "0"}
            </Text>
            <Text style={styles.streakLabel}>days in a row</Text>
          </View>
          <Text style={styles.streakSubtext}>
            Keep logging your mood daily to maintain your streak!
          </Text>
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d3748",
    textAlign: "center",
    flex: 1,
    marginHorizontal: -28, // Compensate for icon widths
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 12,
  },
  timeRangeContainer: {
    flexDirection: "row",
    backgroundColor: "#edf2f7",
    borderRadius: 20,
    padding: 4,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeTimeRange: {
    backgroundColor: "#4c6ef5",
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  activeTimeRangeText: {
    color: "#fff",
  },
  axisLabel: {
    fontSize: 12,
    color: "#718096",
    marginTop: 4,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  graphPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fe",
    borderRadius: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#718096",
    marginTop: 10,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#edf2f7",
    borderRadius: 20,
  },
  retryText: {
    color: "#4c6ef5",
    fontWeight: "600",
  },
  legendContainer: {
    marginTop: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  legendLabel: {
    fontSize: 14,
    color: "#4a5568",
  },
  tagsContainer: {
    marginVertical: 10,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4c6ef5",
    marginRight: 12,
  },
  tagText: {
    fontSize: 16,
    color: "#4a5568",
  },
  tagCount: {
    color: "#a0aec0",
    fontSize: 14,
  },
  noTagsText: {
    fontSize: 16,
    color: "#a0aec0",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: "#4c6ef5",
    borderColor: "#4c6ef5",
  },
  filterText: {
    fontSize: 14,
    color: "#4a5568",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
    marginBottom: 6,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4c6ef5",
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 18,
    color: "#718096",
  },
  streakSubtext: {
    fontSize: 14,
    color: "#a0aec0",
    fontStyle: "italic",
  },
});

export default MoodAnalyticsScreen;