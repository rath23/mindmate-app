// app/_layout.js
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{headerShown: false}}>
        < Stack.Screen name = "index"   />
        <Stack.Screen name="login"  />
        <Stack.Screen name="register"  />
        <Stack.Screen name="home"  />
        <Stack.Screen name="settingscreen"  />
        <Stack.Screen name="MindMateRegister"  />
        <Stack.Screen name="moodcheckinscreen"  />
        <Stack.Screen name="JournalEntryScreen" />
        <Stack.Screen name="PastEntriesScreen" />
        <Stack.Screen name="TopicSelectionScreen" />
        <Stack.Screen name="DailyStreak" />
         <Stack.Screen
          name="group/[topic]"
          
        />
      </Stack>

    </AuthProvider>
  );
}
