import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Mood enum matching backend values
const MoodType = {
  VERY_HAPPY: 'VERY_HAPPY',
  HAPPY: 'HAPPY',
  NEUTRAL: 'NEUTRAL',
  SAD: 'SAD',
  VERY_SAD: 'VERY_SAD'
};

const MoodCheckInScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [showDisabledMessage, setShowDisabledMessage] = useState(false);
  const router = useRouter();
  
  // Emojis mapped to enum values
  const moodOptions = [
    { emoji: '😄', value: MoodType.VERY_HAPPY },
    { emoji: '🙂', value: MoodType.HAPPY },
    { emoji: '😐', value: MoodType.NEUTRAL },
    { emoji: '🙁', value: MoodType.SAD },
    { emoji: '😢', value: MoodType.VERY_SAD }
  ];
  
  // Tags
  const tagOptions = ['anxious', 'calm', 'happy', 'energetic', 'tired', 'sad', 'stressed'];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (selectedMood === null) {
      // Show message when user tries to submit without selecting mood
      setShowDisabledMessage(true);
      
      // Hide message after 3 seconds
      setTimeout(() => setShowDisabledMessage(false), 3000);
      return;
    }
    submitMood();
  };

const submitMood = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    const payload = {
      mood: selectedMood,
      tags: selectedTags,
      note: note,
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(
      'http://localhost:8080/api/mood', // ✅ Your backend endpoint
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // ✅ Add token here
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      Alert.alert("Mood submitted successfully!");
      resetForm();
      await SecureStore.deleteItemAsync('dashboardData');
      router.replace("/selfcarescreen");
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.error('Submission error:', error);
    Alert.alert(
      "Failed to submit mood", 
      error.response?.data?.message || "Please check your connection and try again."
    );
  }
};


  const resetForm = () => {
    setSelectedMood(null);
    setSelectedTags([]);
    setNote('');
    setShowDisabledMessage(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#f8fafc" 
        barStyle="dark-content" 
        translucent={true}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="chevron-left" size={28} color="#4a5568" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Daily Mood Check-In</Text>
              <Text style={styles.time}>Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>

          {/* Emoji Question */}
          <Text style={styles.question}>How are you feeling?</Text>
          
          {/* Emoji Selection */}
          <View style={styles.emojiRow}>
            {moodOptions.map((moodOption, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  selectedMood === moodOption.value && styles.selectedEmoji
                ]}
                onPress={() => {
                  setSelectedMood(moodOption.value);
                  setShowDisabledMessage(false);
                }}
              >
                <Text style={styles.emoji}>{moodOption.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mood Tags Section */}
          <Text style={styles.sectionTitle}>Tags</Text>

          {/* Mood Tags */}
          <View style={styles.tagsContainer}>
            {tagOptions.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note Input */}
          <Text style={styles.noteLabel}>Want to say something?</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your thoughts here..."
            placeholderTextColor="#a0aec0"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />

          {/* Submit Button with Clear Disabled State */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              selectedMood === null && styles.disabledButton
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>
              {selectedMood ? "Submit Mood" : "Select a Mood"}
            </Text>
          </TouchableOpacity>
          
          {/* Disabled State Explanation */}
          {showDisabledMessage && (
            <View style={styles.messageContainer}>
              <Icon name="information-circle" size={20} color="#e53e3e" />
              <Text style={styles.disabledText}>
                Please select a mood to submit your check-in
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 16,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#718096',
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2f7',
    borderRadius: 16,
    padding: 12,
    width: '18%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedEmoji: {
    backgroundColor: '#ebf4ff',
    borderColor: '#90cdf4',
    borderWidth: 1.5,
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  tag: {
    backgroundColor: '#edf2f7',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedTag: {
    backgroundColor: '#ebf4ff',
    borderColor: '#90cdf4',
    borderWidth: 1.5,
  },
  tagText: {
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedTagText: {
    color: '#3182ce',
    fontWeight: '600',
  },
  noteLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#4299e1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledText: {
    color: '#e53e3e',
    fontSize: 14,
    marginLeft: 6,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
});

export default MoodCheckInScreen;