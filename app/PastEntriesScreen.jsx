import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  ENDPOINTS: {
    JOURNAL: "/journal"
  },
  TIMEOUT: 10000 // 10 seconds
};

const PastEntriesScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch entries with proper error handling
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      setEntries(response.data);
    } catch (err) {
      console.error("API fetch error:", err);
      
      let errorMessage = "Failed to load entries";
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      }

      setError(errorMessage);
      
      if (err.message.includes("Authentication")) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Get auth token with error handling
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (err) {
      console.error("Token fetch error:", err);
      throw err;
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const toggleExpand = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  const handleEditPress = (entry) => {
    navigation.navigate("JournalEntryScreen", {
      id: entry.id,
      heading: entry.heading,
      body: entry.body,
      createdAt: entry.createdAt,
      editMode: "true",
    });
  };

  const handleDeletePress = (id) => {
    const deleteConfirmation = () => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(id),
          },
        ]
      );
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this entry?")) {
        performDelete(id);
      }
    } else {
      deleteConfirmation();
    }
  };

  const performDelete = async (id) => {
    setDeletingId(id);
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOURNAL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      
      let errorMessage = "Failed to delete the entry";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Unknown time";
    }
  };

  const handleExportPress = async () => {
    try {
      const csvContent = entries.map(entry => 
        `"${entry.heading}","${entry.body.replace(/"/g, '""')}","${entry.createdAt}"`
      ).join('\n');
      
      const csvHeader = "Title,Content,Date\n";
      const fullCsv = csvHeader + csvContent;
      
      if (Platform.OS === 'web') {
        // For web - create download link
        const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'journal_entries.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile - show alert with instructions
        Alert.alert(
          "Export Entries",
          "To export your entries, please visit this app on a computer or use a dedicated journaling app that supports export functionality.",
          [
            { text: "OK" },
            { text: "Learn More", onPress: () => Linking.openURL('https://example.com/export-help') }
          ]
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to prepare export data");
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loaderText}>Loading your memories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Archive</Text>
        <TouchableOpacity onPress={handleExportPress}>
          <Ionicons name="download-outline" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C63FF"]}
            tintColor="#6C63FF"
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={40} color="#EF476F" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchEntries}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={60} color="#D0D0D0" />
            <Text style={styles.emptyTitle}>Your journal is empty</Text>
            <Text style={styles.emptyText}>
              Start writing to capture your thoughts and reflections
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("JournalNotesScreen")}
            >
              <Text style={styles.addButtonText}>Create First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{entries.length}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {new Set(entries.map(e => new Date(e.createdAt).toDateString())).size}
                </Text>
                <Text style={styles.statLabel}>Days Journaled</Text>
              </View>
            </View>

            {entries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entryContainer,
                  expandedEntry === entry.id && styles.expandedEntry,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => toggleExpand(entry.id)}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.dateContainer}>
                      <Feather name="calendar" size={14} color="#6C63FF" />
                      <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
                    </View>
                    <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
                  </View>

                  <Text style={styles.heading} numberOfLines={expandedEntry === entry.id ? 0 : 2}>
                    {entry.heading}
                  </Text>

                  {expandedEntry === entry.id && (
                    <Text style={styles.content}>{entry.body}</Text>
                  )}
                </TouchableOpacity>

                {expandedEntry === entry.id && (
                  <View style={styles.entryFooter}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditPress(entry)}
                    >
                      <Feather name="edit" size={16} color="#6C63FF" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeletePress(entry.id)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id ? (
                        <ActivityIndicator size="small" color="#EF476F" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={16} color="#EF476F" />
                          <Text style={[styles.actionText, { color: "#EF476F" }]}>
                            Delete
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FE",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FE",
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: "#6C63FF",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A4A72",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#F0F4FF",
    borderRadius: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6C63FF",
  },
  statLabel: {
    fontSize: 14,
    color: "#7D7D9C",
    marginTop: 4,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#4A4A72",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#6C63FF",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A4A72",
    marginTop: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#7D7D9C",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  addButton: {
    marginTop: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  entryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6C63FF",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  expandedEntry: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C63FF",
    marginLeft: 6,
  },
  time: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A0A7C2",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A4A72",
    marginBottom: 12,
    lineHeight: 24,
  },
  content: {
    fontSize: 16,
    color: "#5A5A7A",
    lineHeight: 24,
    marginTop: 10,
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F8",
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    color: "#6C63FF",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default PastEntriesScreen;