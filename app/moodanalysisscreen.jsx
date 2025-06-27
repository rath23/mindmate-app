import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';

const MoodAnalyticsScreen = () => {
  // Mock data
  const commonTags = [
    { name: 'stressed', count: 12 },
    { name: 'tired', count: 8 },
    { name: 'happy', count: 6 },
    { name: 'anxious', count: 5 },
  ];

  const [filterByTag, setFilterByTag] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#f8f9fe" 
        barStyle="dark-content" 
        translucent={true}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Mood History / Analytics</Text>
        
        {/* Mood Over Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mood Over Time</Text>
            <TouchableOpacity style={styles.dateRangeButton}>
              <Text style={styles.dateRangeText}>Past 30 Days</Text>
              <Text style={styles.dateRangeChevron}>›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          {/* Graph Placeholder */}
          <View style={styles.graphPlaceholder}>
            <Text style={styles.graphText}>Graph will appear here</Text>
          </View>
          
          <View style={styles.divider} />
        </View>
        
        {/* Most Common Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Common Tags</Text>
          
          <View style={styles.tagsContainer}>
            {commonTags.map((tag, index) => (
              <View key={index} style={styles.tagItem}>
                {index === 0 ? (
                  <Text style={styles.boldTagText}>{tag.name}</Text>
                ) : (
                  <Text style={styles.tagText}>• {tag.name}</Text>
                )}
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterByTag(!filterByTag)}
          >
            <View style={styles.checkbox}>
              {filterByTag && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.filterText}>Filter by tag</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
        </View>
        
        {/* Mood Streak Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>5</Text>
            <Text style={styles.streakLabel}>days</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf2f7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  dateRangeChevron: {
    fontSize: 20,
    color: '#4a5568',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  graphPlaceholder: {
    height: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fe',
  },
  graphText: {
    fontSize: 16,
    color: '#a0aec0',
  },
  tagsContainer: {
    marginVertical: 10,
  },
  tagItem: {
    marginBottom: 8,
  },
  boldTagText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  tagText: {
    fontSize: 16,
    color: '#4a5568',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkmark: {
    fontSize: 14,
    color: '#4299e1',
    fontWeight: 'bold',
  },
  filterText: {
    fontSize: 16,
    color: '#4a5568',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3b82f6',
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 18,
    color: '#718096',
  },
});

export default MoodAnalyticsScreen;