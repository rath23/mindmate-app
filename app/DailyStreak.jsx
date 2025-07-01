import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

const DailyStreak = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Updated badges array with unlocked status
  const badges = [
    { name: 'Mood Rookie', desc: "You've logged your first mood!", color: ['#8C6BFF', '#6341FF'], unlocked: true },
    { name: 'Streak Starter', desc: "You're on a roll!", color: ['#F9A825', '#FF6F00'], unlocked: true },
    { name: 'Feelings Pro', desc: 'Keeping up with your emotions consistently.', color: ['#2196F3', '#1976D2'], unlocked: false },
    { name: 'Emotional Explorer', desc: 'You’ve explored the full mood spectrum!', color: ['#4CAF50', '#2E7D32'], unlocked: true },
    { name: 'Reflective Soul', desc: 'You’ve started your journaling journey.', color: ['#BA68C8', '#8E24AA'], unlocked: false },
    { name: 'Insight Seeker', desc: 'You’re digging deep into your thoughts.', color: ['#9575CD', '#512DA8'], unlocked: false },
    { name: 'Daily Writer', desc: "You're building a writing habit!", color: ['#03A9F4', '#0288D1'], unlocked: true },
    { name: 'Calm Beginner', desc: 'Breathe in, breathe out — great job!', color: ['#00BCD4', '#0097A7'], unlocked: true },
    { name: 'Zen Explorer', desc: 'Exploring ways to relax.', color: ['#4DB6AC', '#00796B'], unlocked: false },
    { name: 'Mindful Master', desc: 'You’re becoming a mindfulness expert.', color: ['#388E3C', '#1B5E20'], unlocked: false },
    { name: 'Hello There!', desc: 'You reached out — well done!', color: ['#FFC107', '#FFA000'], unlocked: false },
    { name: 'Supporter', desc: 'You helped someone feel heard.', color: ['#FF9800', '#F57C00'], unlocked: false },
    { name: 'Active Listener', desc: 'You’re contributing to the community.', color: ['#FF5722', '#E64A19'], unlocked: false },
    { name: '7-Day Streak', desc: 'A full week of self-care.', color: ['#CDDC39', '#AFB42B'], unlocked: false },
    { name: '14-Day Warrior', desc: 'Amazing consistency!', color: ['#8BC34A', '#689F38'], unlocked: false },
    { name: '30-Day MindMate', desc: 'Your mental health matters.', color: ['#009688', '#00695C'], unlocked: false },
    { name: 'Comeback Kid', desc: 'Welcome back!', color: ['#795548', '#4E342E'], unlocked: true },
  ];

  // Function to get badge icon based on unlocked status
  const getBadgeIcon = (unlocked) => {
    return unlocked ? 'military-tech' : 'lock';
  };

  // Function to get icon color based on unlocked status
  const getIconColor = (unlocked) => {
    return unlocked ? '#FFD700' : '#A0AEC0';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f7f9fc', '#eef2f7']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Daily Check-In Streak</Text>
            <LinearGradient
              colors={['#FF9E44', '#FF7A00']}
              style={styles.streakContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.streakText}>3 days</Text>
              <View style={styles.fireIcon}>
                <Icon name="whatshot" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </View>

          {/* XP Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Earned Wellness XP</Text>
            <Animated.View
              style={[styles.xpContainer, { transform: [{ scale: pulseAnim }] }]}
            >
              <Text style={styles.xpText}>120</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </Animated.View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#5A8EFF', '#3A5BFF']}
                style={[styles.progressFill, { width: '75%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          {/* Badges Section - Now horizontally scrollable */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Unlockable Badges</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesContainer}
            >
              {badges.map((badge, index) => (
                <LinearGradient
                  key={index}
                  colors={badge.unlocked ? badge.color : ['#CBD5E0', '#A0AEC0']}
                  style={[
                    styles.badge,
                    !badge.unlocked && styles.lockedBadge
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon 
                    name={getBadgeIcon(badge.unlocked)} 
                    size={28} 
                    color={getIconColor(badge.unlocked)} 
                  />
                  <Text style={[
                    styles.badgeText,
                    !badge.unlocked && styles.lockedBadgeText
                  ]}>
                    {badge.name}
                  </Text>
                </LinearGradient>
              ))}
            </ScrollView>
          </View>

          {/* Goals Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily/Weekly Goals</Text>
            <View style={styles.goalContainer}>
              <LinearGradient
                colors={['#4CD964', '#2DBE49']}
                style={styles.goalBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="check" size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>Goal for today</Text>
                <Text style={styles.goalStatus}>1/1 Completed</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, padding: 20 },
  header: { marginBottom: 25, alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  streakText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 10,
  },
  fireIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#A0AEC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 15,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 15,
  },
  xpText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2D3748',
  },
  xpLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5A8EFF',
    marginLeft: 8,
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#EDF2F7',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  // Updated badge styles for horizontal scrolling
  badgesContainer: {
    paddingVertical: 5,
  },
  badge: {
    width: screenWidth * 0.4, // 40% of screen width
    height: 120,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginRight: 12, // Space between badges
  },
  lockedBadge: {
    opacity: 0.7,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  lockedBadgeText: {
    color: '#F7FAFC',
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalBadge: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTextContainer: {
    marginLeft: 15,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  goalStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2DBE49',
  },
});

export default DailyStreak;