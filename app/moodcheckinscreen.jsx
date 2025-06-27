import axios from 'axios';
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

const MoodCheckInScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  
  // Emojis from code 1
  const moodOptions = ['😄', '🙂', '😐', '🙁', '😢'];
  
  // Tags from code 1
  const tagOptions = ['anxious', 'calm', 'happy', 'energetic', 'tired', 'sad', 'stressed'];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const submitMood = async () => {
    if (selectedMood === null) {
      Alert.alert("Please select a mood emoji.");
      return;
    }

    try {
      const payload = {
        mood: selectedMood,
        tags: selectedTags,
        note: note,
        timestamp: new Date().toISOString()
      };

      // Replace with your actual backend endpoint
      await axios.post('https://your-backend.com/api/mood/checkin', payload);

      Alert.alert("Mood submitted successfully!");
      setSelectedMood(null);
      setSelectedTags([]);
      setNote('');
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to submit mood.");
    }
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Mood Check-In</Text>
            <Text style={styles.time}>Today • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>

          {/* Emoji Question */}
          <Text style={styles.question}>How are you feeling?</Text>
          
          {/* Emoji Selection - Using code 1's approach */}
          <View style={styles.emojiRow}>
            {moodOptions.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.emojiButton,
                  selectedMood === index && styles.selectedEmoji
                ]}
                onPress={() => setSelectedMood(index)}
              >
                <Text style={styles.emoji}>{mood}</Text>
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

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitMood}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    color: '#718096',
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
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
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MoodCheckInScreen;