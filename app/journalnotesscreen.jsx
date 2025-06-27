import { useNavigation } from '@react-navigation/native'; // Added import
import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const journalnotesscreen = () => {
  const navigation = useNavigation(); // Get navigation object
  const [prompt, setPrompt] = useState("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [promptError, setPromptError] = useState(false);
  const noteInputRef = useRef(null);

  const handleSave = async () => {
    if (!prompt.trim() || !note.trim()) {
      setPromptError(!prompt.trim());
      Alert.alert("Validation", "Please fill in both the prompt and note");
      return;
    }

    try {
      const payload = {
        prompt,
        note,
        timestamp: new Date().toISOString()
      };

      await axios.post('https://your-backend.com/api/journal', payload);

      Alert.alert("Success", "Journal saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save journal");
    }
  };

  const handleDelete = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      Alert.alert("Validation", "Please enter a prompt first.");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            setNote("");
            setPrompt("");
            setIsEditing(false);
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!prompt.trim()) {
      setPromptError(true);
      Alert.alert("Validation", "Please enter a prompt before editing.");
      return;
    }
    setIsEditing(true);
  };

  const handlePromptNavigation = () => {
    if (navigation) {
      navigation.navigate('journalpromptscreen');
    } else {
      console.warn("Navigation not available");
      Alert.alert("Navigation Error", "Couldn't access navigation. Please restart the app.");
    }
  };

    const handlePastEntriesScreenNavigation = () => {
    if (navigation) {
      navigation.navigate('PastEntriesScreen');
    } else {
      console.warn("Navigation not available");
      Alert.alert("Navigation Error", "Couldn't access navigation. Please restart the app.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#f8f9fe" barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Journal / Notes</Text>
        </View>

        {/* Prompt input: Always editable */}
        <TextInput
          style={[
            styles.promptInput,
            promptError && styles.promptInputError
          ]}
          value={prompt}
          onChangeText={(text) => {
            setPrompt(text);
            if (text.trim()) setPromptError(false);
          }}
          placeholder="What's on your mind today?"
          placeholderTextColor="#a0aec0"
          editable={true}
          multiline
          blurOnSubmit={false}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (prompt.trim()) {
              noteInputRef.current?.focus();
            } else {
              setPromptError(true);
              Alert.alert("Validation", "Please enter a prompt before continuing.");
            }
          }}
        />

        <View style={styles.divider} />

        {/* "Need a prompt?" button */}
        <TouchableOpacity 
          style={styles.promptSuggestionButton}
          onPress={handlePromptNavigation} // Updated handler
        >
          <Text style={styles.promptSuggestionText}>✨ Need a prompt?</Text>
        </TouchableOpacity>

        {/* Journal Entry with protection */}
        <TouchableWithoutFeedback
          onPressIn={() => {
            if (!prompt.trim()) {
              setPromptError(true);
              Alert.alert("Validation", "Please enter a prompt first.");
            } else {
              noteInputRef.current?.focus();
            }
          }}
        >
          <View style={styles.entryContainer} pointerEvents="box-none">
            <TextInput
              ref={noteInputRef}
              style={styles.journalInput}
              value={note}
              onChangeText={setNote}
              placeholder="Pour out your thoughts here..."
              placeholderTextColor="#a0aec0"
              multiline
              editable={isEditing}
              textAlignVertical="top"
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

       <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.pastEntriesButton}
          onPress={ handlePastEntriesScreenNavigation} // Add this line
        >
          <Text style={styles.pastEntriesText}>View Past Entries →</Text>
        </TouchableOpacity>
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
    padding: 25,
    paddingBottom: 30,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e8edff',
    paddingBottom: 15,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4c6ef5',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  promptInput: {
    fontSize: 20,
    fontWeight: '500',
    color: '#4a5568',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    minHeight: 80,
    lineHeight: 26,
  },
  promptInputError: {
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8edff',
    marginVertical: 25,
  },
  // New styles for prompt suggestion button
  promptSuggestionButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  promptSuggestionText: {
    color: '#4361ee',
    fontWeight: '500',
    fontSize: 16,
  },
  entryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    minHeight: 250,
    shadowColor: '#4c6ef5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  journalInput: {
    fontSize: 17,
    lineHeight: 26,
    color: '#4a5568',
    textAlignVertical: 'top',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4c6ef5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
    shadowColor: '#4c6ef5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#4c6ef5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
    shadowColor: '#4c6ef5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#f1f3f9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff1f2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  deleteButtonText: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  pastEntriesButton: {
    padding: 12,
  },
  pastEntriesText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4c6ef5',
  },
});

export default journalnotesscreen;