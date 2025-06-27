import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const PastEntriesScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([
    { id: '1', date: 'April 24, 2024', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', mood: 'happy' },
    { id: '2', date: 'April 23, 2024', content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', mood: 'sad' },
    { id: '3', date: 'April 21, 2024', content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', mood: 'calm' },
    { id: '4', date: 'April 18, 2024', content: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', mood: 'energetic' },
    { id: '5', date: 'April 15, 2024', content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', mood: 'tired' },
    { id: '6', date: 'April 12, 2024', content: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.', mood: 'anxious' },
  ]);
  
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const moodEmojis = {
    happy: '😊',
    sad: '😔',
    calm: '😌',
    energetic: '💪',
    tired: '😴',
    anxious: '😰'
  };
  
  const moodColors = {
    happy: '#FFD166',
    sad: '#6C63FF',
    calm: '#06D6A0',
    energetic: '#EF476F',
    tired: '#118AB2',
    anxious: '#FF9E6D'
  };

  const toggleExpand = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

const handleEditPress = (entry) => {
  navigation.navigate('JournalEntryScreen', {
    entry: JSON.stringify(entry),
    editMode: "true"
  });
};




  const loadMore = () => {
    setLoading(true);
    // Simulate loading more data
    setTimeout(() => {
      setEntries([
        ...entries,
        { id: '7', date: 'April 10, 2024', content: 'New entry loaded with additional content to show how the UI handles longer text entries.', mood: 'calm' },
        { id: '8', date: 'April 8, 2024', content: 'Another entry that demonstrates the loading functionality with attractive UI.', mood: 'happy' }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Entries</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Your journal history</Text>
        
        {entries.map((entry) => (
          <TouchableOpacity 
            key={entry.id} 
            style={[
              styles.entryContainer,
              { borderLeftColor: moodColors[entry.mood] },
              expandedEntry === entry.id && styles.expandedEntry
            ]}
            activeOpacity={0.9}
            onPress={() => toggleExpand(entry.id)}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.date}>{entry.date}</Text>
              <View style={styles.moodIndicator}>
                <Text style={styles.moodEmoji}>{moodEmojis[entry.mood]}</Text>
              </View>
            </View>
            
            <Text 
              style={styles.content}
              numberOfLines={expandedEntry === entry.id ? null : 2}
            >
              {entry.content}
            </Text>
            
            {expandedEntry === entry.id && (
              <View style={styles.entryFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={()=>handleEditPress(entry)}>
                  <Feather name="edit" size={16} color="#6C63FF" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Feather name="trash-2" size={16} color="#EF476F" />
                  <Text style={[styles.actionText, { color: '#EF476F' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={loadMore}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.loadMoreText}>Loading...</Text>
          ) : (
            <>
              <Text style={styles.loadMoreText}>Load More</Text>
              <Feather name="chevron-down" size={20} color="#6C63FF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
    marginLeft: 4,
  },
  entryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderLeftWidth: 4,
  },
  expandedEntry: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  moodIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  moodEmoji: {
    fontSize: 20,
  },
  content: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#6C63FF',
    fontWeight: '500',
    fontSize: 14,
  },
  loadMoreButton: {
    marginTop: 10,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  loadMoreText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PastEntriesScreen;