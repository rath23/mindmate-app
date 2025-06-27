import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ← Add this line
import React, { useContext, useState } from 'react';
import {
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
  const { logout } = useContext(AuthContext);
  const router = useRouter(); // ← Add this line

  

const handleMenuPress = async (action) => {
  setMenuVisible(false);
  switch (action) {
    case 'profile':
      console.log('Navigate to Profile');
      break;
    case 'settings':
      router.push('/settingscreen'); // Navigate to settings
      break;
    case 'logout':
      await logout();             // Clear token
      router.replace('/login');   // Navigate and clear history
      break;
  }
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
              <Text style={styles.greeting}>Hello, Adam</Text>
              <Text style={styles.date}>Today</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Feather name="more-vertical" size={24} color="#2d3748" />
            </TouchableOpacity>
          </View>

          {/* Self-Care Suggestions */}
          <Text style={styles.sectionTitle}>Self-Care Suggestions</Text>
          <View style={styles.suggestionsContainer}>
            <SuggestionCard icon="🚶‍♂️" title="Go for" description="a walk" />
            <SuggestionCard icon="✍️" title="Write down" description="3 things you're grateful for" />
            <SuggestionCard icon="🎵" title="Listen to" description="music" />
          </View>

          {/* Stats Container */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Streak</Text>
              <View style={styles.streakCircle}>
                <Text style={styles.streakText}>7</Text>
                <Text style={styles.streakLabel}>days</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>XP Progress</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.progressText}>65% complete</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <ActionButton text="Check-In" onPress={() => router.push('/moodcheckinscreen')} />
            <ActionButton text="Journal" onPress={() => router.push('/journalnotesscreen')}/>
            <ActionButton text="Talk to" onPress={() => router.push('/TopicSelectionScreen')} />
            <ActionButton text="Relax" />
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
    marginBottom: 30,
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
