import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = ({ navigation }) => {
  const router = useRouter();
   const { user } = useContext(AuthContext);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Minimal Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" style={styles.backButtonText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.profileContainer}>
        {/* Profile Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.userName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Nickname</Text>
            <Text style={[styles.value, styles.nickname]}>{user?.nickName}</Text>
          </View>

          {/* Edit Button at Bottom Right */}
          <TouchableOpacity
            style={styles.bottomEditButton}
            onPress={() =>
              router.push({
                pathname: "/EditProfileScreen",
                params: {
                  email: user?.email,
                  username: user?.userName,
                  fullName: user?.name,
                  nickname: user?.nickName,
                },
              })
            }
          >
            <Text style={styles.bottomEditButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4a7dff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 24, // Matches back button width for balance
  },
  profileContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  infoContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    position: "relative", // Needed for absolute positioning of edit button
    paddingBottom: 70, // Extra space for the edit button
  },
  infoItem: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  nickname: {
    color: "#4a7dff",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  bottomEditButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4a7dff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4a7dff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomEditButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ProfileScreen;
