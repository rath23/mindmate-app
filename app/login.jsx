import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

import { useRouter } from "expo-router";

const MindMateLogin = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);



  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/user/login", {
        // replace with your local IP
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
          userName: username,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();

      console.log("Login successful! Response:", data);

      const token = data.token; // ✅ Extract token from backend response
      login(token);
      router.replace("/home"); // ✅ go to home page
      // ✅ Pass token to context
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleAnonymousLogin = () => {
    // Anonymous login logic
    console.log("Continuing anonymously");
  };

  const handleSignUp = () => {
    
    console.log("Navigate to sign up");
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
          <Text style={styles.subtitle}>login</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
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
