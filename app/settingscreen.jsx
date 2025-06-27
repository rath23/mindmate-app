import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch
} from 'react-native';

const SettingsScreen = () => {
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#f8f9fe" 
        barStyle="dark-content" 
        translucent={true}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Settings & Privacy</Text>
        
        {/* Anonymous Mode Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Anonymous Mode</Text>
            <Switch
              value={anonymousMode}
              onValueChange={setAnonymousMode}
              trackColor={{ false: "#e2e8f0", true: "#4299e1" }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.sectionDescription}>
            Hide your name and profile details
          </Text>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Reminders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ false: "#e2e8f0", true: "#4299e1" }}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.sectionDescription}>
            Receive daily self-care reminders
          </Text>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionText}>Export data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={[styles.optionText, styles.deleteText]}>Delete account</Text>
          </TouchableOpacity>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#e2e8f0", true: "#4299e1" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#718096',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 15,
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionText: {
    fontSize: 16,
    color: '#4a5568',
  },
  deleteText: {
    color: '#e53e3e',
    fontWeight: '500',
  },
});

export default SettingsScreen;