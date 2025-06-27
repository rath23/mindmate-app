import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [token, setToken] = useState(null);

  const login = async (token) => {
    await AsyncStorage.setItem('token', token);
    setToken(token);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
  };

  // 👇 Decode and check expiration
  const checkTokenValid = async () => {
    const storedToken = await AsyncStorage.getItem('token');

    if (!storedToken) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      const currentTime = Date.now() / 1000; // in seconds

      if (decoded.exp < currentTime) {
        console.log('Token expired');

        // Optional: try to refresh the token
        const newToken = await refreshToken();
        if (newToken) {
          login(newToken);
        } else {
          logout();
        }
      } else {
        setToken(storedToken);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('Token decoding failed:', err);
      logout();
    }
  };

  // 🔁 Simulate token refresh
 const refreshToken = async () => {
  try {
    const storedToken = await AsyncStorage.getItem('token'); // 👈 get current token
    const response = await fetch('http://localhost:8080/auth/user/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`, // 👈 pass token here!
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error('Token refresh failed:', err);
    return null;
  }
};


  useEffect(() => {
    checkTokenValid(); // ✅ check token on app start
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};
