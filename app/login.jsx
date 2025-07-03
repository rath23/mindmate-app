import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { AuthContext } from "../context/AuthContext";

// Configuration constants
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  ENDPOINTS: {
    LOGIN: '/auth/user/login'
  }
};

const MindMateLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { username, password } = formData;
    
    if (!username || !password) {
      Alert.alert('Error', 'Both username and password are required');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formData.password,
            userName: formData.username,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 
          data.error || 
          'Login failed. Please check your credentials.'
        );
      }

      console.log("Login successful! Response:", data);
      login(data.token);
      router.replace("/home");

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        'Login Error', 
        error.message || 'An error occurred during login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    Alert.alert(
      'Anonymous Login',
      'You can explore the app with limited features',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.replace("/home") }
      ]
    );
  };

  const handleSignUp = () => {
    router.push('/MindMateRegister');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MindMate</Text>
          <Text style={styles.subtitle}>Login</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={formData.username}
            onChangeText={(text) => handleChange('username', text)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Anonymous Login */}
        <TouchableOpacity
          style={styles.anonymousButton}
          onPress={handleAnonymousLogin}
        >
          <Text style={styles.anonymousText}>Continue anonymously</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2d3748",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4a5568",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#4361ee",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4361ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#a0aec0",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  anonymousButton: {
    alignSelf: "center",
    paddingVertical: 12,
  },
  anonymousText: {
    color: "#4361ee",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#718096",
    fontSize: 16,
  },
  signUpText: {
    color: "#4361ee",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default MindMateLogin;