import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const BreathingAnimation = ({ onCompleteCycle }) => {
  const move = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const circleWidth = Dimensions.get('window').width * 0.6;
  const [cycleCount, setCycleCount] = useState(0);

  const animateBreathing = () => {
    return Animated.sequence([
      // Inhale
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 1,
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
      // Pause at top
      Animated.delay(500),
      // Exhale
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]),
      // Pause at bottom
      Animated.delay(500),
    ]);
  };

  useEffect(() => {
    const animation = Animated.loop(
      animateBreathing(),
      {
        iterations: 3, // Complete 3 breathing cycles
      }
    );
    
    animation.start(({ finished }) => {
      if (finished) {
        onCompleteCycle();
      }
    });
    
    return () => animation.stop();
  }, []);

  const translate = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circleWidth / 6],
  });
  
  const exhale = textOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.animationContainer, { height: circleWidth }]}>
      <Animated.View
        style={{
          width: circleWidth,
          height: circleWidth,
          ...StyleSheet.absoluteFillObject,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: textOpacity,
        }}
      >
        <Text style={styles.animationLabel}>Breathe In</Text>
      </Animated.View>
      
      <Animated.View
        style={{
          width: circleWidth,
          height: circleWidth,
          ...StyleSheet.absoluteFillObject,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: exhale,
        }}
      >
        <Text style={styles.animationLabel}>Breathe Out</Text>
      </Animated.View>
      
      {[...Array(8).keys()].map((item) => {
        const rotation = move.interpolate({
          inputRange: [0, 1],
          outputRange: [`${item * 45}deg`, `${item * 45 + 180}deg`],
        });
        
        return (
          <Animated.View
            key={item}
            style={{
              opacity: 0.1,
              backgroundColor: '#4c6ef5',
              width: circleWidth,
              height: circleWidth,
              borderRadius: circleWidth / 2,
              ...StyleSheet.absoluteFillObject,
              transform: [
                { rotateZ: rotation },
                { translateX: translate },
                { translateY: translate },
                { scale },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

const JournalPromptScreen = () => {
  const [showCompletion, setShowCompletion] = useState(false);
  const [prompts] = useState([
    "Write about three things in your life that you're grateful for.",
    "Describe a recent challenge and what you learned from it.",
    "Reflect on a person who has positively impacted your life.",
    "Write about a moment when you felt truly at peace."
  ]);
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);

  const handleCompleteCycle = () => {
    setShowCompletion(true);
    setTimeout(() => setShowCompletion(false), 3000);
  };

  const handleNewPrompt = () => {
    const currentIndex = prompts.indexOf(currentPrompt);
    const nextIndex = (currentIndex + 1) % prompts.length;
    setCurrentPrompt(prompts[nextIndex]);
  };

  const openMeditationLink = () => {
    Linking.openURL('https://www.youtube.com/watch?v=inpok4MKVLM');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#f8f9fe" 
        barStyle="dark-content" 
        translucent={true}
      />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Mindful Journaling</Text>
          <TouchableOpacity onPress={handleNewPrompt} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={20} color="#4c6ef5" />
          </TouchableOpacity>
        </View>
        
        {/* Prompt Card */}
        <View style={styles.card}>
          <View style={styles.promptHeader}>
            <Feather name="edit-3" size={20} color="#4c6ef5" />
            <Text style={styles.promptHeaderText}>Today's Prompt</Text>
          </View>
          <Text style={styles.promptText}>
            {currentPrompt}
          </Text>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Breathing Animation */}
        <View style={styles.animationSection}>
          {showCompletion ? (
            <View style={styles.completionContainer}>
              <Feather name="check-circle" size={60} color="#06D6A0" />
              <Text style={styles.completionText}>Great job! You've completed 3 breathing cycles.</Text>
            </View>
          ) : (
            <>
              <BreathingAnimation onCompleteCycle={handleCompleteCycle} />
              <Text style={styles.animationText}>Follow the animation to breathe deeply</Text>
            </>
          )}
        </View>
        
        {/* Quick Meditation Button */}
        <TouchableOpacity 
          style={styles.meditationButton}
          onPress={openMeditationLink}
        >
          <Feather name="play-circle" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>5-Minute Meditation</Text>
        </TouchableOpacity>
        
        {/* Why This Activity Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather name="info" size={20} color="#4c6ef5" />
            <Text style={styles.infoTitle}>Why This Activity?</Text>
          </View>
          <Text style={styles.infoText}>
            Research shows that combining journaling with mindful breathing can:
          </Text>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#06D6A0" />
            <Text style={styles.benefitText}>Reduce stress and anxiety levels</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#06D6A0" />
            <Text style={styles.benefitText}>Improve emotional awareness</Text>
          </View>
          <View style={styles.benefitItem}>
            <Feather name="check" size={16} color="#06D6A0" />
            <Text style={styles.benefitText}>Enhance focus and clarity</Text>
          </View>
        </View>
        
        {/* Start Journaling Button */}
        <TouchableOpacity style={styles.journalButton}>
          <Text style={styles.journalButtonText}>Start Journaling</Text>
          <Feather name="arrow-right" size={20} color="#4c6ef5" />
        </TouchableOpacity>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#ebf4ff',
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  promptHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4c6ef5',
    marginLeft: 8,
  },
  promptText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#2d3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 30,
  },
  animationSection: {
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 250,
    justifyContent: 'center',
  },
  animationContainer: {
    width: Dimensions.get('window').width * 0.6,
    position: 'relative',
    marginBottom: 20,
  },
  animationLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
  },
  animationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 20,
  },
  completionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 26,
  },
  meditationButton: {
    backgroundColor: '#4c6ef5',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4c6ef5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ebf4ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5568',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 8,
  },
  journalButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#4c6ef5',
  },
  journalButtonText: {
    color: '#4c6ef5',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default JournalPromptScreen;