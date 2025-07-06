import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const fetchUserInfo = async (authToken) => {
    try {
      const res = await fetch('https://mindmate-ye33.onrender.com/api/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch user info');

      const userInfo = await res.json();
      setUser(userInfo);
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
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
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const refreshUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to refresh user from storage", error);
    }
  };

  const refreshToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const response = await fetch('https://mindmate-ye33.onrender.com/auth/user/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
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

  const checkTokenValid = async () => {
    const storedToken = await AsyncStorage.getItem('token');

    if (!storedToken) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const decoded = jwt_decode(storedToken);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.log('Token expired');
        const newToken = await refreshToken();
        if (newToken) {
          await login(newToken);
        } else {
          await logout();
        }
      } else {
        setToken(storedToken);
        setIsLoggedIn(true);
        await refreshUserFromStorage();        // Load cached user immediately
        await fetchUserInfo(storedToken);      // Refresh with fresh data
      }
    } catch (err) {
      console.error('Token decoding failed:', err);
      await logout();
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      setUser(prev => ({ ...prev, ...updatedUserData }));

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

  useEffect(() => {
    checkTokenValid();
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      login,
      logout,
      token,
      user,
      updateUser,
      refreshUserFromStorage,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
