import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const JournalEntryScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get entry data from URL params or use defaults
  const entryData = params.entry 
    ? JSON.parse(params.entry)
    : {
        date: 'June 24, 2025',
        quote: '"It\'s okay to put yourself first."',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        mood: 'Happy',
        moodEmoji: '😊'
      };

  const [isEditing, setIsEditing] = useState(params.editMode === "true");
  const [editedQuote, setEditedQuote] = useState(entryData.quote);
  const [editedContent, setEditedContent] = useState(entryData.content);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Your changes have been saved!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#f0f4ff', '#e6e9ff']}
        style={styles.background}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Feather name="arrow-left" size={24} color="#6C63FF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Journal Entry</Text>
              <View style={{ width: 40 }} />
            </View>
            
            {/* Content Card */}
            <View style={styles.card}>
              {/* Date */}
              <View style={styles.dateContainer}>
                <Feather name="calendar" size={18} color="#6C63FF" />
                <Text style={styles.date}>{entryData.date}</Text>
              </View>
              
              {/* Quote */}
              <View style={styles.quoteContainer}>
                <Feather name="star" size={18} color="#FFD166" style={styles.quoteIcon} />
                {isEditing ? (
                  <TextInput
                    style={styles.quoteInput}
                    value={editedQuote}
                    onChangeText={setEditedQuote}
                    multiline
                    placeholder="Enter your quote..."
                  />
                ) : (
                  <Text style={styles.quote}>{editedQuote}</Text>
                )}
              </View>
              
              {/* Body Text */}
              <View style={styles.contentContainer}>
                {isEditing ? (
                  <TextInput
                    style={styles.contentInput}
                    value={editedContent}
                    onChangeText={setEditedContent}
                    multiline
                    placeholder="Write your journal entry..."
                  />
                ) : (
                  <Text style={styles.bodyText}>{editedContent}</Text>
                )}
              </View>
              
              {/* Mood Indicator */}
              <View style={styles.moodContainer}>
                <Text style={styles.moodLabel}>Mood:</Text>
                <View style={styles.moodIndicator}>
                  <Text style={styles.moodEmoji}>{entryData.moodEmoji}</Text>
                  <Text style={styles.moodText}>{entryData.mood}</Text>
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Feather name="save" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Feather name="x" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Feather name="edit-3" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Edit Entry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.deleteButton]}>
                    <Feather name="trash-2" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Delete Entry</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 10,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 209, 102, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
  },
  quoteIcon: {
    position: 'absolute',
    top: -10,
    left: -10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quote: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#2D3748',
    lineHeight: 26,
  },
  quoteInput: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#2D3748',
    lineHeight: 26,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
  },
  contentContainer: {
    marginBottom: 30,
  },
  bodyText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 26,
  },
  contentInput: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 26,
    padding: 15,
    minHeight: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    marginRight: 15,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6C63FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 15,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#6C63FF',
  },
  deleteButton: {
    backgroundColor: '#EF476F',
  },
  saveButton: {
    backgroundColor: '#06D6A0',
  },
  cancelButton: {
    backgroundColor: '#4A5568',
  },
});

export default JournalEntryScreen;