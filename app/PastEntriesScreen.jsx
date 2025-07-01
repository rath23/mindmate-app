import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert, Platform, RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";


const BASE_URL = "http://localhost:8080";

const PastEntriesScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  

  useFocusEffect(
  React.useCallback(() => {
    // Refresh your journal entries
    fetchEntries();
  }, [])
);


  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (err) {
      console.error("Token fetch error:", err);
      return null;
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    const token = await getAuthToken();
    if (!token) {
      Alert.alert("Session Expired", "Please login again");
      navigation.navigate("Login");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/journal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(response.data);
    } catch (err) {
      console.error("API fetch error:", err);
      Alert.alert("Error", "Failed to load entries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const toggleExpand = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

const handleEditPress = (entry) => {
    navigation.navigate("JournalEntryScreen", {
      id: entry.id, // or entry._id depending on your backend
      heading: entry.heading,
      body: entry.body,
      createdAt: entry.createdAt,
      editMode: "false", // Set to false for editing
    });
  };

  const handleDeletePress = (id) => {
 if (Platform.OS === "web") {
    const confirm = window.confirm("Are you sure you want to delete this entry?");
    if (confirm) performDelete(id);
  } else {
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
  }
  };

  const performDelete = async (id) => {
     console.log("Deleting entry with ID:", id); // Add this line
    setDeletingId(id);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Unauthorized", "Please login again");
        return;
      }

      await axios.delete(`${BASE_URL}/api/journal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete the entry");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
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
        <Text style={styles.headerTitle}>Past Entries</Text>
        <View style={{ width: 24 }} />
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
        <View style={styles.subtitleContainer}>
          <Ionicons name="journal-outline" size={20} color="#6C63FF" />
          <Text style={styles.subtitle}>
            {entries.length} memory{entries.length !== 1 ? "ies" : "y"} captured
          </Text>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={60} color="#D0D0D0" />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Your reflections will appear here once you start journaling
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("JournalNotesScreen")}
            >
              <Text style={styles.addButtonText}>Create First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry) => (
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

                <Text style={styles.heading} numberOfLines={2}>
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
          ))
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
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    padding: 12,
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6C63FF",
    marginLeft: 10,
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
