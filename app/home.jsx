import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const DashboardScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout, user, token } = useContext(AuthContext);
  const router = useRouter();

  // Mood options mapping
  const moodOptions = [
    { emoji: '😄', value: 'VERY_HAPPY', label: 'Very Happy' },
    { emoji: '🙂', value: 'HAPPY', label: 'Happy' },
    { emoji: '😐', value: 'NEUTRAL', label: 'Neutral' },
    { emoji: '🙁', value: 'SAD', label: 'Sad' },
    { emoji: '😢', value: 'VERY_SAD', label: 'Very Sad' }
  ];

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:8080/api/user/home', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
        
        // Cache data in AsyncStorage
        await AsyncStorage.setItem('dashboardData', JSON.stringify({
          data,
          timestamp: new Date().getTime()
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Try to load cached data
        const cachedData = await AsyncStorage.getItem('dashboardData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setDashboardData(parsedData.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMenuPress = async (action) => {
    setMenuVisible(false);
    switch (action) {
      case 'profile':
        console.log('Navigate to Profile');
        break;
      case 'settings':
        router.push('/settingscreen');
        break;
      case 'logout':
        await logout();
        router.replace('/login');
        break;
    }
  };

  // Mood Card Component
  const MoodCard = () => {
    if (loading) {
      return (
        <View style={styles.moodCard}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <Text style={styles.moodCardText}>Loading your mood...</Text>
        </View>
      );
    }

    if (!dashboardData?.todayMood) {
      return (
        <TouchableOpacity 
          style={styles.moodCard}
          onPress={() => router.push('/moodcheckinscreen')}
        >
          <Text style={styles.moodCardEmoji}>📝</Text>
          <Text style={styles.moodCardText}>Log your mood today</Text>
          <Feather name="chevron-right" size={20} color="#718096" />
        </TouchableOpacity>
      );
    }

    const moodData = moodOptions.find(option => 
      option.value === dashboardData.todayMood
    );

    return (
      <View style={styles.moodCard}>
        <Text style={styles.moodCardEmoji}>{moodData?.emoji || '😐'}</Text>
        <View style={styles.moodCardContent}>
          <Text style={styles.moodCardLabel}>Today's Mood</Text>
          <Text style={styles.moodCardValue}>{moodData?.label || 'Neutral'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editMoodButton}
          onPress={() => router.push('/moodcheckinscreen')}
        >
          <Feather name="edit" size={16} color="#6C63FF" />
        </TouchableOpacity>
      </View>
    );
  };

  // Stats Card Component
  const StatsCard = () => {
    if (loading) {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
          <View style={styles.statCard}>
            <ActivityIndicator size="small" color="#6C63FF" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Streak</Text>
          <View style={styles.streakCircle}>
            <Text style={styles.streakText}>{dashboardData?.streak || 0}</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>XP Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${Math.min(100, Math.floor((dashboardData?.xp || 0) / 3))}%` 
            }]} />
          </View>
          <Text style={styles.progressText}>
            {dashboardData?.xp || 0} XP collected
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor="#f8f9fe"
          barStyle="dark-content"
          translucent={true}
        />

        {/* Dropdown Menu */}
        {menuVisible && (
          <View style={styles.absoluteDropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleMenuPress('profile')}>
              <Feather name="user" size={18} color="#2d3748" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleMenuPress('settings')}>
              <Feather name="settings" size={18} color="#2d3748" style={styles.dropdownIcon} />
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => handleMenuPress('logout')}>
              <Feather name="log-out" size={18} color="#e53e3e" style={styles.dropdownIcon} />
              <Text style={[styles.dropdownText, { color: '#e53e3e' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name}</Text>
              <Text style={styles.date}>Today</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Feather name="more-vertical" size={24} color="#2d3748" />
            </TouchableOpacity>
          </View>

          {/* Mood Card */}
          <MoodCard />

          {/* Self-Care Suggestions */}
          <Text style={styles.sectionTitle}>Self-Care Suggestions</Text>
          <View style={styles.suggestionsContainer}>
            <SuggestionCard icon="🚶‍♂️" title="Go for" description="a walk" />
            <SuggestionCard icon="✍️" title="Write down" description="3 things you're grateful for" />
            <SuggestionCard icon="🎵" title="Listen to" description="music" />
          </View>

          {/* Stats Container */}
          <StatsCard />

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <ActionButton text="Check-In" onPress={() => router.push('/moodcheckinscreen')} />
            <ActionButton text="Journal" onPress={() => router.push('/journalnotesscreen')}/>
            <ActionButton text="Talk to" onPress={() => router.push('/TopicSelectionScreen')} />
            <ActionButton text="Relax" onPress={() => router.push('/DailyStreak')}/>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// Reusable Components
const SuggestionCard = ({ icon, title, description }) => (
  <TouchableOpacity style={styles.suggestionCard}>
    <Text style={styles.suggestionIcon}>{icon}</Text>
    <Text style={styles.suggestionTitle}>{title}</Text>
    <Text style={styles.suggestionDescription}>{description}</Text>
  </TouchableOpacity>
);

const ActionButton = ({ text, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <Text style={styles.actionText}>{text}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fe',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
  },
  date: {
    fontSize: 18,
    color: '#718096',
    marginTop: 4,
  },
  moodCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  moodCardEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  moodCardContent: {
    flex: 1,
  },
  moodCardLabel: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
  },
  moodCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  moodCardText: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 12,
    flex: 1,
  },
  editMoodButton: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    textAlign: 'center',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  streakCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ebf4ff',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  streakText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b82f6',
  },
  streakLabel: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
  },
  absoluteDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
});

export default DashboardScreen;