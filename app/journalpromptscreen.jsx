import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  Dimensions
} from 'react-native';

const BreathingAnimation = () => {
  const move = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const circleWidth = 200;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(move, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(textOpacity, {
            delay: 100,
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(move, {
            delay: 1000,
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    
    animation.start();
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
        <Text style={styles.animationLabel}>Inhale</Text>
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
        <Text style={styles.animationLabel}>Exhale</Text>
      </Animated.View>
      
      {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => {
        const rotation = move.interpolate({
          inputRange: [0, 1],
          outputRange: [`${item * 45}deg`, `${item * 45 + 180}deg`],
        });
        
        return (
          <Animated.View
            key={item}
            style={{
              opacity: 0.1,
              backgroundColor: '#4299e1',
              width: circleWidth,
              height: circleWidth,
              borderRadius: circleWidth / 2,
              ...StyleSheet.absoluteFillObject,
              transform: [
                { rotateZ: rotation },
                { translateX: translate },
                { translateY: translate },
              ],
            }}
          />
        );
      })}
    </View>
  );
};

const journalpromptscreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        backgroundColor="#f8f9fe" 
        barStyle="dark-content" 
        translucent={true}
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Journal Prompt</Text>
        
        {/* Prompt Card */}
        <View style={styles.card}>
          <Text style={styles.promptText}>
            Write about three things in your life that you're grateful for.
          </Text>
        </View>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Breathing Animation */}
        <View style={styles.animationSection}>
          <BreathingAnimation />
          <Text style={styles.animationText}>Take a deep breath</Text>
        </View>
        
        {/* Quick Meditation Button */}
        <TouchableOpacity style={styles.meditationButton}>
          <Text style={styles.buttonText}>Quick Meditation</Text>
        </TouchableOpacity>
        
        {/* Why This Activity Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why this activity?</Text>
          <Text style={styles.infoText}>
            Practicing gratitude helps shift your focus from what's lacking to what's abundant in your life. 
            This simple exercise can improve mood, reduce stress, and enhance overall well-being.
          </Text>
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
    textAlign: 'center'
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
  promptText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#2d3748',
    textAlign: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 30,
  },
  animationSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  animationContainer: {
    width: 200,
    position: 'relative',
    marginBottom: 20,
  },
  animationLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
  },
  animationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
  },
  meditationButton: {
    backgroundColor: '#4299e1',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5568',
  },
});

export default journalpromptscreen;