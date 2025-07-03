import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const fetchUserInfo = async (authToken) => {
  try {
    const res = await fetch('http://localhost:8080/api/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch user info');

    const userInfo = await res.json();
    setUser(userInfo); // 💾 Save in state
    await AsyncStorage.setItem('user', JSON.stringify(userInfo)); // Optional: store locally
  } catch (error) {
    console.error('User fetch failed:', error);
    setUser(null);
  }
};



  const login = async (token) => {
    await AsyncStorage.setItem('token', token);
    setToken(token);
    setIsLoggedIn(true);
    await fetchUserInfo(token);
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

   const updateUser = async (updatedUserData) => {
    try {
      // Update in state
      setUser(prev => ({ ...prev, ...updatedUserData }));
      
      // Optional: Update in AsyncStorage
      const currentUser = JSON.parse(await AsyncStorage.getItem('user')) || {};
      await AsyncStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...updatedUserData
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
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
    <AuthContext.Provider value={{ isLoggedIn, login, logout, token, user , updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
