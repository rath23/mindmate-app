import { Feather } from "@expo/vector-icons";
import axios from "axios";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";


const API_URL = "http://localhost:8080/api/user/update-profile";

const EditProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
 const { updateUser, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: params.email || "",
    userName: params.username || "",
    name: params.fullName || "",
    nickName: params.nickname || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    console.log(token);
    if (!formData.email || !formData.userName || !formData.name) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    
    try {
    
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.put(API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        const success = await updateUser({
          email: formData.email,
          username: formData.userName,
          name: formData.name,
          nickname: formData.nickName
        });
        router.back();
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Save Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" style={styles.backButtonText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        {/* Editable Profile Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Email*</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Often email isn't editable
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Username*</Text>
            <TextInput
              style={styles.input}
              value={formData.userName}
              onChangeText={(text) =>
                setFormData({ ...formData, userName: text })
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Full Name*</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={[styles.input, styles.nicknameInput]}
              value={formData.nickName}
              onChangeText={(text) =>
                setFormData({ ...formData, nickName: text })
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ... keep your existing styles ...

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
  saveButton: {
    backgroundColor: "#4a7dff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#a0b8ff",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
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
  },
  infoItem: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  nicknameInput: {
    borderColor: "#4a7dff",
    backgroundColor: "#f0f4ff",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
});

export default EditProfileScreen;
