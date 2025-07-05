import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const MoodAnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filterByTag, setFilterByTag] = useState(false);
  const navigation = useNavigation();

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Authentication Error", "Please login again");
        return;
      }
      const response = await fetch("https://mindmate-ye33.onrender.com/api/mood/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const moodToNumber = {
    VERY_SAD: 1,
    SAD: 1,
    NEUTRAL: 2,
    HAPPY: 3,
    VERY_HAPPY: 3,
    null: 0,
  };

  const formatGraphData = () => {
    const moodArray = analyticsData?.last15Days || [];
    const labels = moodArray.map((entry) => entry.date.slice(5)); // MM-DD
    const data = moodArray.map((entry) =>
      moodToNumber[entry.mood || "null"]
    );
    return { labels, data };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#f8f9fe"
        barStyle="dark-content"
        translucent={true}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather style={styles.backIcon} name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.header}>Mood History / Analytics</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood Over Time</Text>
            <TouchableOpacity style={styles.dateRangeButton}>
              <Text style={styles.dateRangeText}>Past 15 Days</Text>
              <Text style={styles.dateRangeChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.axisLabel}>X-axis: Date (MM-DD)</Text>
          <View style={styles.divider} />

          {analyticsData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: formatGraphData().labels,
                  datasets: [{ data: formatGraphData().data }],
                }}
                width={Math.max(500, formatGraphData().labels.length * 40)}
                height={220}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#f8f9fe",
                  backgroundGradientTo: "#f8f9fe",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: () => "#718096",
                }}
                style={{ borderRadius: 8 }}
              />
            </ScrollView>
          ) : (
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphText}>Loading graph...</Text>
            </View>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Mood Legend</Text>
          <View style={styles.legendContainer}>
            <Text style={styles.legendItem}>0 - No Mood Logged</Text>
            <Text style={styles.legendItem}>1 - 😢 / 🙁 (Sad / Very Sad)</Text>
            <Text style={styles.legendItem}>2 - 😐 (Neutral)</Text>
            <Text style={styles.legendItem}>3 - 🙂 / 😄 (Happy / Very Happy)</Text>
          </View>

          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Common Tags</Text>
          <View style={styles.tagsContainer}>
            {analyticsData &&
              Object.entries(analyticsData.topTags)
                .filter(([_, count]) => !filterByTag || count >= 5)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, count], index) => (
                  <View key={tag} style={styles.tagItem}>
                    <Text
                      style={index === 0 ? styles.boldTagText : styles.tagText}
                    >
                      {index === 0 ? `${tag} (${count})` : `• ${tag} (${count})`}
                    </Text>
                  </View>
                ))}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterByTag(!filterByTag)}
          >
            <View style={styles.checkbox}>
              {filterByTag && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.filterText}>Filter tags with ≥ 5 count</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>
              {analyticsData?.currentStreakDays ?? "--"}
            </Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
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
    marginBottom: 30,
  },
  backIcon: {
    fontSize: 24,
    color: "#2d3748",
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2d3748",
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
    fontWeight: "600",
    color: "#2d3748",
  },
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf2f7",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dateRangeText: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
  },
  dateRangeChevron: {
    fontSize: 20,
    color: "#4a5568",
    marginLeft: 4,
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
    height: 200,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fe",
  },
  graphText: {
    fontSize: 16,
    color: "#a0aec0",
  },
  legendContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  legendItem: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
  },
  tagsContainer: {
    marginVertical: 10,
  },
  tagItem: {
    marginBottom: 8,
  },
  boldTagText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
  },
  tagText: {
    fontSize: 16,
    color: "#4a5568",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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
  checkmark: {
    fontSize: 14,
    color: "#4299e1",
    fontWeight: "bold",
  },
  filterText: {
    fontSize: 16,
    color: "#4a5568",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#3b82f6",
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 18,
    color: "#718096",
  },
});

export default MoodAnalyticsScreen;
