import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f7f9fc', '#eef2f7']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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

        {/* Badges Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Unlockable Badges</Text>
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['#8C6BFF', '#6341FF']}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="military-tech" size={32} color="#FFD700" />
              <Text style={styles.badgeText}>7-Day Calm Streak</Text>
            </LinearGradient>
            <View style={styles.badgePlaceholder} />
            <View style={styles.badgePlaceholder} />
          </View>
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
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    width: 100,
    height: 120,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  badgePlaceholder: {
    width: 100,
    height: 120,
    backgroundColor: '#EDF2F7',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
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
