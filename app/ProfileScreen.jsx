import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useContext, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const ProfileScreen = () => {
  const router = useRouter();
  const { user, logout, updateUser, refreshUserFromStorage } =
    useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshUserFromStorage();
    }, [[refreshUserFromStorage]])
  );

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await logout();
            // Clear sensitive data
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("refreshToken");
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need access to your photos to set a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePic(result.assets[0].uri);
        // Here you would typically upload the image to your server
        // and update the user's profile picture URL
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/EditProfileScreen",
      params: {
        email: user?.email,
        username: user?.userName,
        fullName: user?.name,
        nickname: user?.nickName,
      },
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fe" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color="#4c6ef5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={handleLogout} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4c6ef5" />
            ) : (
              <MaterialIcons name="logout" size={24} color="#4c6ef5" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={pickImage}>
              <View style={styles.profilePic}>
                {profilePic ? (
                  <Image
                    source={{ uri: profilePic }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Feather name="user" size={60} color="#4c6ef5" />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.userName}>{user?.userName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Profile Information */}
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>{user?.name || "Not set"}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Nickname</Text>
              <Text
                style={[styles.value, !user?.nickName && styles.emptyValue]}
              >
                {user?.nickName || "Not set"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditProfile}
            >
              <Feather name="edit-3" size={20} color="#4c6ef5" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => router.push("/settings")}
            >
              <Feather name="settings" size={20} color="#4a5568" />
              <Text
                style={[styles.actionButtonText, styles.secondaryActionText]}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fe",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d3748",
  },
  profilePicContainer: {
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 10,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ebf4ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4c6ef5",
    marginBottom: 15,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#718096",
  },
  infoContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  infoItem: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: "#2d3748",
    fontWeight: "600",
  },
  emptyValue: {
    color: "#a0aec0",
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#edf2f7",
  },
  actionsContainer: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebf4ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  actionButtonText: {
    color: "#4c6ef5",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  secondaryAction: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryActionText: {
    color: "#4a5568",
  },
});

export default ProfileScreen;
