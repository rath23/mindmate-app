import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  ENDPOINTS: {
    UPDATE_PROFILE: "/user/update-profile",
  },
  TIMEOUT: 10000, // 10 seconds
};

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
  const [errors, setErrors] = useState({
    email: "",
    userName: "",
    name: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      userName: "",
      name: "",
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.userName) {
      newErrors.userName = "Username is required";
      isValid = false;
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
      isValid = false;
    }

    if (!formData.name) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      const response = await axios({
        method: 'put',
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      });

      if (response.status === 200) {
        const success = await updateUser({
          email: formData.email,
          username: formData.userName,
          name: formData.name,
          nickname: formData.nickName
        });

        if (success) {
          Alert.alert(
            "Success", 
            "Profile updated successfully",
            [{ text: "OK", onPress: () => router.back() }]
          );
        } else {
          throw new Error("Failed to update local user data");
        }
      } else {
        throw new Error(response.data?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      
      let errorMessage = "Failed to update profile";
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage);
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
          disabled={isSaving}
        >
          <Feather name="chevron-left" style={styles.backButtonText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        {/* Editable Profile Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Email*</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                setErrors({ ...errors, email: "" });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Username*</Text>
            <TextInput
              style={[styles.input, errors.userName && styles.inputError]}
              value={formData.userName}
              onChangeText={(text) => {
                setFormData({ ...formData, userName: text });
                setErrors({ ...errors, userName: "" });
              }}
              autoCapitalize="none"
            />
            {errors.userName ? (
              <Text style={styles.errorText}>{errors.userName}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={styles.label}>Full Name*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => {
                setFormData({ ...formData, name: text });
                setErrors({ ...errors, name: "" });
              }}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
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
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
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
  inputError: {
    borderColor: "#ff4d4f",
    backgroundColor: "#fff2f0",
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
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
  },
});

export default EditProfileScreen;